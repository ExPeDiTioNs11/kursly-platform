import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '@kursly/shared';
import type { JwtPayload } from '@kursly/shared';
import { StorageService } from './storage.service';
import { PrismaService } from '../prisma/prisma.service';

const student: JwtPayload = { sub: 'u1', email: 'u@x.com', role: Role.STUDENT };

function makePrisma() {
  return {
    lesson: { findUnique: jest.fn() },
    enrollment: { findUnique: jest.fn() },
  };
}

function makeService(prisma: ReturnType<typeof makePrisma>) {
  const config = { get: jest.fn().mockReturnValue(undefined) };
  return new StorageService(config as unknown as ConfigService, prisma as unknown as PrismaService);
}

describe('StorageService.getLessonPlaybackUrl', () => {
  it('blocks a non-enrolled user from a non-preview lesson', async () => {
    const prisma = makePrisma();
    prisma.lesson.findUnique.mockResolvedValue({
      videoKey: 'uploads/abc.mp4',
      isPreview: false,
      section: { course: { id: 'c1', instructorId: 'other' } },
    });
    prisma.enrollment.findUnique.mockResolvedValue(null);
    const service = makeService(prisma);

    await expect(service.getLessonPlaybackUrl(student, 'l1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('404s when the lesson has no video', async () => {
    const prisma = makePrisma();
    prisma.lesson.findUnique.mockResolvedValue({
      videoKey: null,
      isPreview: true,
      section: { course: { id: 'c1', instructorId: 'other' } },
    });
    const service = makeService(prisma);

    await expect(service.getLessonPlaybackUrl(student, 'l1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
