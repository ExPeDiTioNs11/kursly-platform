import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@kursly/shared';
import type { SocialAuthor } from '@kursly/shared';
import { PrismaService } from '../prisma/prisma.service';

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

  /** Users the given user follows. */
  async listFollowing(userId: string): Promise<SocialAuthor[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
      include: { following: { select: { id: true, name: true, avatarUrl: true, role: true } } },
    });
    return rows.map((r) => ({ ...r.following, role: r.following.role as Role }));
  }

  /** Users who follow the given user. */
  async listFollowers(userId: string): Promise<SocialAuthor[]> {
    const rows = await this.prisma.follow.findMany({
      where: { followingId: userId },
      orderBy: { createdAt: 'desc' },
      include: { follower: { select: { id: true, name: true, avatarUrl: true, role: true } } },
    });
    return rows.map((r) => ({ ...r.follower, role: r.follower.role as Role }));
  }
}
