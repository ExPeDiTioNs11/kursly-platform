import { Injectable, NotFoundException } from '@nestjs/common';
import { CourseStatus, Role } from '@kursly/shared';
import type { PublicUser, UserProfile } from '@kursly/shared';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublicById(id: string): Promise<PublicUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UsersService.toPublicUser(user);
  }

  /** Update the current user's editable profile fields. */
  async updateProfile(id: string, dto: UpdateProfileDto): Promise<PublicUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.avatarUrl !== undefined ? { avatarUrl: dto.avatarUrl } : {}),
      },
    });
    return UsersService.toPublicUser(user);
  }

  /** Public profile enriched with social counts and the viewer's follow state. */
  async getProfile(viewerId: string, id: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const [posts, followers, following, courses, follow] = await Promise.all([
      this.prisma.post.count({ where: { authorId: id } }),
      this.prisma.follow.count({ where: { followingId: id } }),
      this.prisma.follow.count({ where: { followerId: id } }),
      this.prisma.course.count({ where: { instructorId: id, status: CourseStatus.PUBLISHED } }),
      viewerId === id
        ? Promise.resolve(null)
        : this.prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: viewerId, followingId: id } },
          }),
    ]);

    return {
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role as Role,
      createdAt: user.createdAt.toISOString(),
      counts: { posts, followers, following, courses },
      isFollowing: Boolean(follow),
      isMe: viewerId === id,
    };
  }

  static toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
