import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@kursly/shared';
import type { JwtPayload, Paginated, Post, PostComment } from '@kursly/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { paginated } from '../common/pagination';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryPostsDto, currentUserId: string): Promise<Paginated<Post>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;

    // "following" scopes the feed to authors the current user follows.
    let authorFilter: Prisma.PostWhereInput = {};
    if (query.following) {
      const ids = (
        await this.prisma.follow.findMany({
          where: { followerId: currentUserId },
          select: { followingId: true },
        })
      ).map((f) => f.followingId);
      authorFilter = { authorId: ids.length ? { in: ids } : '__none__' };
    } else if (query.authorId) {
      authorFilter = { authorId: query.authorId };
    }

    const where: Prisma.PostWhereInput = {
      ...authorFilter,
      ...(query.authorRole ? { author: { role: query.authorRole } } : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: this.postInclude(currentUserId),
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: rows.map((p) => this.toPost(p)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async create(currentUserId: string, dto: CreatePostDto): Promise<Post> {
    if (dto.courseId) {
      const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
      if (!course) {
        throw new NotFoundException('Referenced course not found');
      }
    }
    const post = await this.prisma.post.create({
      data: {
        authorId: currentUserId,
        content: dto.content,
        imageUrl: dto.imageUrl ?? null,
        courseId: dto.courseId ?? null,
      },
      include: this.postInclude(currentUserId),
    });
    return this.toPost(post);
  }

  async update(user: JwtPayload, id: string, dto: UpdatePostDto): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (user.role !== Role.ADMIN && post.authorId !== user.sub) {
      throw new ForbiddenException('You do not own this post');
    }
    await this.prisma.post.update({
      where: { id },
      data: {
        ...(dto.content !== undefined ? { content: dto.content } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl || null } : {}),
      },
    });
    const updated = await this.prisma.post.findUniqueOrThrow({
      where: { id },
      include: this.postInclude(user.sub),
    });
    return this.toPost(updated);
  }

  async remove(user: JwtPayload, id: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (user.role !== Role.ADMIN && post.authorId !== user.sub) {
      throw new ForbiddenException('You do not own this post');
    }
    await this.prisma.post.delete({ where: { id } });
  }

  /** Like a post (idempotent). Returns the fresh like state and count. */
  async like(
    currentUserId: string,
    postId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    await this.assertPostExists(postId);
    await this.prisma.postLike.upsert({
      where: { postId_userId: { postId, userId: currentUserId } },
      create: { postId, userId: currentUserId },
      update: {},
    });
    return { liked: true, likeCount: await this.prisma.postLike.count({ where: { postId } }) };
  }

  /** Remove the current user's like from a post (idempotent). */
  async unlike(
    currentUserId: string,
    postId: string,
  ): Promise<{ liked: boolean; likeCount: number }> {
    await this.assertPostExists(postId);
    await this.prisma.postLike.deleteMany({ where: { postId, userId: currentUserId } });
    return { liked: false, likeCount: await this.prisma.postLike.count({ where: { postId } }) };
  }

  async listComments(
    postId: string,
    page: number,
    pageSize: number,
  ): Promise<Paginated<PostComment>> {
    await this.assertPostExists(postId);
    const where = { postId };
    const [comments, total] = await this.prisma.$transaction([
      this.prisma.postComment.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { author: this.authorSelect() },
      }),
      this.prisma.postComment.count({ where }),
    ]);
    return paginated(
      comments.map((c) => ({
        id: c.id,
        content: c.content,
        author: { ...c.author, role: c.author.role as Role },
        createdAt: c.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    );
  }

  async addComment(
    currentUserId: string,
    postId: string,
    dto: CreateCommentDto,
  ): Promise<PostComment> {
    await this.assertPostExists(postId);
    const comment = await this.prisma.postComment.create({
      data: { postId, authorId: currentUserId, content: dto.content },
      include: { author: this.authorSelect() },
    });
    return {
      id: comment.id,
      content: comment.content,
      author: { ...comment.author, role: comment.author.role as Role },
      createdAt: comment.createdAt.toISOString(),
    };
  }

  async updateComment(
    user: JwtPayload,
    commentId: string,
    dto: UpdateCommentDto,
  ): Promise<PostComment> {
    const existing = await this.prisma.postComment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });
    if (!existing) {
      throw new NotFoundException('Comment not found');
    }
    if (user.role !== Role.ADMIN && existing.authorId !== user.sub) {
      throw new ForbiddenException('You do not own this comment');
    }
    const comment = await this.prisma.postComment.update({
      where: { id: commentId },
      data: { ...(dto.content !== undefined ? { content: dto.content } : {}) },
      include: { author: this.authorSelect() },
    });
    return {
      id: comment.id,
      content: comment.content,
      author: { ...comment.author, role: comment.author.role as Role },
      createdAt: comment.createdAt.toISOString(),
    };
  }

  async removeComment(user: JwtPayload, commentId: string): Promise<void> {
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
      select: { authorId: true },
    });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (user.role !== Role.ADMIN && comment.authorId !== user.sub) {
      throw new ForbiddenException('You do not own this comment');
    }
    await this.prisma.postComment.delete({ where: { id: commentId } });
  }

  private async assertPostExists(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({ where: { id: postId }, select: { id: true } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
  }

  private authorSelect() {
    return { select: { id: true, name: true, avatarUrl: true, role: true } } as const;
  }

  private postInclude(currentUserId: string) {
    return {
      author: this.authorSelect(),
      course: { select: { id: true, slug: true, title: true, thumbnailUrl: true } },
      _count: { select: { likes: true, comments: true } },
      likes: { where: { userId: currentUserId }, select: { id: true } },
    } satisfies Prisma.PostInclude;
  }

  private toPost(post: PostWithRelations): Post {
    return {
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      author: { ...post.author, role: post.author.role as Role },
      course: post.course,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      likedByMe: post.likes.length > 0,
      createdAt: post.createdAt.toISOString(),
    };
  }
}

type PostWithRelations = Prisma.PostGetPayload<{
  include: {
    author: { select: { id: true; name: true; avatarUrl: true; role: true } };
    course: { select: { id: true; slug: true; title: true; thumbnailUrl: true } };
    _count: { select: { likes: true; comments: true } };
    likes: { select: { id: true } };
  };
}>;
