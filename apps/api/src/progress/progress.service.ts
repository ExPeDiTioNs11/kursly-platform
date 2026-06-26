import { Injectable, NotFoundException } from '@nestjs/common';
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
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
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
