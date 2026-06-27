import { NotFoundException } from '@nestjs/common';
import { Role } from '@kursly/shared';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  it('throws NotFound for an unknown profile', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new UsersService(prisma as unknown as PrismaService);

    await expect(service.getProfile('viewer', 'ghost')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('marks the profile as "me" and does not query follow-state for self', async () => {
    const followFindUnique = jest.fn();
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'u1',
          name: 'Self',
          avatarUrl: null,
          bio: null,
          role: Role.STUDENT,
          createdAt: new Date('2026-01-01'),
        }),
      },
      post: { count: jest.fn().mockResolvedValue(2) },
      follow: { count: jest.fn().mockResolvedValue(1), findUnique: followFindUnique },
      course: { count: jest.fn().mockResolvedValue(0) },
    };
    const service = new UsersService(prisma as unknown as PrismaService);

    const profile = await service.getProfile('u1', 'u1');

    expect(profile.isMe).toBe(true);
    expect(profile.isFollowing).toBe(false);
    expect(profile.counts.posts).toBe(2);
    expect(profile.counts.followers).toBe(1);
    expect(followFindUnique).not.toHaveBeenCalled();
  });
});
