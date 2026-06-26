import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /** Progress for every lesson the user has touched in a given course. */
  async forCourse(userId: string, courseId: string) {
    return this.prisma.progress.findMany({
      where: { userId, lesson: { section: { courseId } } },
    });
  }

  async upsert(userId: string, lessonId: string, dto: UpdateProgressDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { select: { courseId: true } } },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    // Progress can only be recorded for a course the user is actually enrolled in.
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: lesson.section.courseId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled to track progress');
    }
    return this.prisma.progress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        completed: dto.completed ?? false,
        positionSeconds: dto.positionSeconds ?? 0,
      },
      update: {
        ...(dto.completed !== undefined ? { completed: dto.completed } : {}),
        ...(dto.positionSeconds !== undefined ? { positionSeconds: dto.positionSeconds } : {}),
      },
    });
  }
}
