import { ConflictException, ForbiddenException } from '@nestjs/common';
import { CourseStatus } from '@kursly/shared';
import { EnrollmentsService } from './enrollments.service';
import { PrismaService } from '../prisma/prisma.service';

function makePrisma() {
  return {
    course: { findUnique: jest.fn() },
    enrollment: { findUnique: jest.fn(), create: jest.fn() },
  };
}

describe('EnrollmentsService', () => {
  it('refuses enrollment in a course that is not published', async () => {
    const prisma = makePrisma();
    prisma.course.findUnique.mockResolvedValue({ id: 'c1', status: CourseStatus.DRAFT });
    const service = new EnrollmentsService(prisma as unknown as PrismaService);

    await expect(service.enroll('u1', 'c1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.enrollment.create).not.toHaveBeenCalled();
  });

  it('refuses a duplicate enrollment', async () => {
    const prisma = makePrisma();
    prisma.course.findUnique.mockResolvedValue({ id: 'c1', status: CourseStatus.PUBLISHED });
    prisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });
    const service = new EnrollmentsService(prisma as unknown as PrismaService);

    await expect(service.enroll('u1', 'c1')).rejects.toBeInstanceOf(ConflictException);
  });
});
