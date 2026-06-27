import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@kursly/shared';
import type { JwtPayload } from '@kursly/shared';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreatePostDto } from './dto/create-post.dto';

const asUser = (sub: string, role: Role = Role.STUDENT): JwtPayload => ({
  sub,
  email: 'x@x',
  role,
});

describe('PostsService', () => {
  it('forbids editing a post you do not own', async () => {
    const prisma = { post: { findUnique: jest.fn().mockResolvedValue({ authorId: 'other' }) } };
    const service = new PostsService(prisma as unknown as PrismaService);

    await expect(
      service.update(asUser('me'), 'p1', { content: 'edit' } as CreatePostDto),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('throws NotFound when deleting a missing post', async () => {
    const prisma = { post: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new PostsService(prisma as unknown as PrismaService);

    await expect(service.remove(asUser('me'), 'p1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('liking a post is idempotent (upsert + fresh count)', async () => {
    const prisma = {
      post: { findUnique: jest.fn().mockResolvedValue({ id: 'p1' }) },
      postLike: { upsert: jest.fn(), count: jest.fn().mockResolvedValue(3) },
    };
    const service = new PostsService(prisma as unknown as PrismaService);

    const result = await service.like('u1', 'p1');

    expect(prisma.postLike.upsert).toHaveBeenCalled();
    expect(result).toEqual({ liked: true, likeCount: 3 });
  });

  it('forbids deleting a comment you do not own', async () => {
    const prisma = {
      postComment: { findUnique: jest.fn().mockResolvedValue({ authorId: 'other' }) },
    };
    const service = new PostsService(prisma as unknown as PrismaService);

    await expect(service.removeComment(asUser('me'), 'c1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
