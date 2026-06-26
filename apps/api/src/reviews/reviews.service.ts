import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertReviewDto } from './dto/upsert-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  listForCourse(courseId: string) {
    return this.prisma.review.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  /** Create or update the current user's review. Requires enrollment. */
  async upsert(userId: string, courseId: string, dto: UpsertReviewDto) {
    const enrolled = await this.prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!enrolled) {
      throw new ForbiddenException('You must be enrolled to review this course');
    }
    return this.prisma.review.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId, rating: dto.rating, comment: dto.comment },
      update: { rating: dto.rating, comment: dto.comment },
    });
  }

  async remove(userId: string, courseId: string) {
    const review = await this.prisma.review.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    await this.prisma.review.delete({ where: { id: review.id } });
  }
}
