import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Role } from '@kursly/shared';
import type { JwtPayload } from '@kursly/shared';
import { StoriesService } from './stories.service';
import { PrismaService } from '../prisma/prisma.service';

const asUser = (sub: string, role: Role = Role.STUDENT): JwtPayload => ({
  sub,
  email: 'x@x',
  role,
});

describe('StoriesService', () => {
  it('purges only stories older than the 24h TTL', async () => {
    const deleteMany = jest.fn().mockResolvedValue({ count: 4 });
    const prisma = { story: { deleteMany } };
    const service = new StoriesService(prisma as unknown as PrismaService);

    await service.purgeExpired();

    const arg = deleteMany.mock.calls[0][0];
    expect(arg.where.createdAt.lt).toBeInstanceOf(Date);
    expect(arg.where.createdAt.lt.getTime()).toBeLessThan(Date.now());
  });

  it('throws NotFound marking a missing story viewed', async () => {
    const prisma = { story: { findUnique: jest.fn().mockResolvedValue(null) } };
    const service = new StoriesService(prisma as unknown as PrismaService);

    await expect(service.markViewed('u1', 's1')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('forbids deleting a story you do not own', async () => {
    const prisma = { story: { findUnique: jest.fn().mockResolvedValue({ authorId: 'other' }) } };
    const service = new StoriesService(prisma as unknown as PrismaService);

    await expect(service.remove(asUser('me'), 's1')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
