import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@kursly/shared';
import type { Paginated, SocialAuthor } from '@kursly/shared';
import { PrismaService } from '../prisma/prisma.service';
import { paginated } from '../common/pagination';

const authorSelect = { select: { id: true, name: true, avatarUrl: true, role: true } } as const;

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.follow.upsert({
      where: { followerId_followingId: { followerId, followingId } },
      create: { followerId, followingId },
      update: {},
    });
    return { following: true };
  }

  async unfollow(followerId: string, followingId: string): Promise<{ following: boolean }> {
    await this.prisma.follow.deleteMany({ where: { followerId, followingId } });
    return { following: false };
  }

  /** Full list of users the given user follows (used for follow-state on the feed). */
  async listFollowing(userId: string): Promise<SocialAuthor[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { following: authorSelect },
    });
    return rows.map((r) => ({ ...r.following, role: r.following.role as Role }));
  }

  async listFollowers(userId: string): Promise<SocialAuthor[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followingId: userId },
      orderBy: { createdAt: 'desc' },
      include: { follower: authorSelect },
    });
    return rows.map((r) => ({ ...r.follower, role: r.follower.role as Role }));
  }

  /** Paginated followers of a user — safe for accounts with very many followers. */
  async pageFollowers(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<Paginated<SocialAuthor>> {
    const where = { followingId: userId };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.follow.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { follower: authorSelect },
      }),
      this.prisma.follow.count({ where }),
    ]);
    return paginated(
      rows.map((r) => ({ ...r.follower, role: r.follower.role as Role })),
      total,
      page,
      pageSize,
    );
  }

  async pageFollowing(
    userId: string,
    page: number,
    pageSize: number,
  ): Promise<Paginated<SocialAuthor>> {
    const where = { followerId: userId };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.follow.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { following: authorSelect },
      }),
      this.prisma.follow.count({ where }),
    ]);
    return paginated(
      rows.map((r) => ({ ...r.following, role: r.following.role as Role })),
      total,
      page,
      pageSize,
    );
  }
}
