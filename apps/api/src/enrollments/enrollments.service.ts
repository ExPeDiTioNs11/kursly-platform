import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CourseStatus } from '@kursly/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async enroll(userId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    // Students may only enroll in published courses — drafts/archived are not
    // open for enrollment.
    if (course.status !== CourseStatus.PUBLISHED) {
      throw new ForbiddenException('This course is not open for enrollment');
    }
    const existing = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) {
      throw new ConflictException('Already enrolled in this course');
    }
    return this.prisma.enrollment.create({ data: { userId, courseId } });
  }

  listForUser(userId: string) {
    return this.prisma.enrollment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true, avatarUrl: true } },
            category: true,
          },
        },
      },
    });
  }

  async unenroll(userId: string, courseId: string) {
    await this.prisma.enrollment.deleteMany({ where: { userId, courseId } });
  }
}
