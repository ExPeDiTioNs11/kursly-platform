import { Injectable } from '@nestjs/common';
import { CourseStatus, Role } from '@kursly/shared';
import type { PlatformStats } from '@kursly/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<PlatformStats> {
    const [courses, students, instructors, enrollments, reviews] = await Promise.all([
      this.prisma.course.count({ where: { status: CourseStatus.PUBLISHED } }),
      this.prisma.user.count({ where: { role: Role.STUDENT } }),
      this.prisma.user.count({ where: { role: Role.INSTRUCTOR } }),
      this.prisma.enrollment.count(),
      this.prisma.review.findMany({
        where: { rating: { gte: 4 }, comment: { not: null } },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, role: true } },
          course: { select: { title: true, slug: true } },
        },
      }),
    ]);

    return {
      courses,
      students,
      instructors,
      enrollments,
      featuredReviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment ?? '',
        user: { ...r.user, role: r.user.role as Role },
        courseTitle: r.course.title,
        courseSlug: r.course.slug,
      })),
    };
  }
}
