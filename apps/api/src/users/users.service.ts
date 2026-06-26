import { Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@kursly/shared';
import type { PublicUser } from '@kursly/shared';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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
