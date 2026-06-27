import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FollowsService', () => {
  it('refuses to let a user follow themselves', async () => {
    const prisma = {};
    const service = new FollowsService(prisma as unknown as PrismaService);

    await expect(service.follow('u1', 'u1')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFound when following a user that does not exist', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new FollowsService(prisma as unknown as PrismaService);

    await expect(service.follow('u1', 'ghost')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('upserts a follow edge for a valid target', async () => {
    const upsert = jest.fn();
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ id: 'u2' }) },
      follow: { upsert },
    };
    const service = new FollowsService(prisma as unknown as PrismaService);

    const result = await service.follow('u1', 'u2');

    expect(upsert).toHaveBeenCalled();
    expect(result).toEqual({ following: true });
  });
});
