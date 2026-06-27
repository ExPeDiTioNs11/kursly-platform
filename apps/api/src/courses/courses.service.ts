import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CourseStatus, Role } from '@kursly/shared';
import type { JwtPayload, Paginated } from '@kursly/shared';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { QueryCoursesDto } from './dto/query-courses.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { averageRating } from '../common/rating';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryCoursesDto): Promise<Paginated<unknown>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 12;

    // A subcategory narrows to an exact slug; a parent category also matches
    // courses filed under any of its subcategories.
    const categoryFilter: Prisma.CourseWhereInput = query.subcategory
      ? { category: { slug: query.subcategory } }
      : query.category
        ? { category: { OR: [{ slug: query.category }, { parent: { slug: query.category } }] } }
        : {};

    const where: Prisma.CourseWhereInput = {
      status: CourseStatus.PUBLISHED,
      ...(query.level ? { level: query.level } : {}),
      ...(query.format ? { format: query.format } : {}),
      ...(query.instructorId ? { instructorId: query.instructorId } : {}),
      ...categoryFilter,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { subtitle: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: this.summaryInclude(),
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      items: rows.map((c) => this.toSummary(c)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findBySlug(slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        ...this.summaryInclude(),
        sections: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } },
        },
      },
    });
    // Only published courses are exposed on the public detail endpoint; drafts
    // and archived courses must not leak via a guessed slug.
    if (!course || course.status !== CourseStatus.PUBLISHED) {
      throw new NotFoundException('Course not found');
    }
    return {
      ...this.toSummary(course),
      description: course.description,
      sections: course.sections.map((s) => ({
        id: s.id,
        title: s.title,
        order: s.order,
        lessons: s.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          order: l.order,
          durationSeconds: l.durationSeconds,
          isPreview: l.isPreview,
        })),
      })),
    };
  }

  /** The current instructor's own courses, across every status (incl. drafts). */
  async findMine(user: JwtPayload) {
    const rows = await this.prisma.course.findMany({
      where: { instructorId: user.sub },
      orderBy: { updatedAt: 'desc' },
      include: this.summaryInclude(),
    });
    return rows.map((c) => this.toSummary(c));
  }

  /** Full editable course detail for its owner/admin, regardless of status. */
  async manageDetail(user: JwtPayload, id: string) {
    await this.assertOwnerOrAdmin(user, id);
    const course = await this.prisma.course.findUniqueOrThrow({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' } } },
        },
      },
    });
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      description: course.description,
      thumbnailUrl: course.thumbnailUrl,
      level: course.level,
      status: course.status,
      format: course.format,
      price: course.price,
      categoryId: course.categoryId,
      sections: course.sections.map((s) => ({
        id: s.id,
        title: s.title,
        order: s.order,
        lessons: s.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          order: l.order,
          durationSeconds: l.durationSeconds,
          isPreview: l.isPreview,
          videoKey: l.videoKey,
        })),
      })),
    };
  }

  create(user: JwtPayload, dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: { ...dto, instructorId: user.sub },
      include: this.summaryInclude(),
    });
  }

  async update(user: JwtPayload, id: string, dto: UpdateCourseDto) {
    await this.assertOwnerOrAdmin(user, id);
    return this.prisma.course.update({
      where: { id },
      data: dto,
      include: this.summaryInclude(),
    });
  }

  async remove(user: JwtPayload, id: string) {
    await this.assertOwnerOrAdmin(user, id);
    await this.prisma.course.delete({ where: { id } });
  }

  async addSection(user: JwtPayload, courseId: string, dto: CreateSectionDto) {
    await this.assertOwnerOrAdmin(user, courseId);
    // Auto-assign the next order when the caller omits it, so two sections never
    // collide on the @@unique([courseId, order]) constraint.
    const order = dto.order ?? (await this.nextOrder('section', { courseId }));
    return this.prisma.section.create({ data: { title: dto.title, order, courseId } });
  }

  async addLesson(user: JwtPayload, sectionId: string, dto: CreateLessonDto) {
    const section = await this.prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    await this.assertOwnerOrAdmin(user, section.courseId);
    const order = dto.order ?? (await this.nextOrder('lesson', { sectionId }));
    return this.prisma.lesson.create({ data: { ...dto, order, sectionId } });
  }

  async updateSection(user: JwtPayload, sectionId: string, dto: UpdateSectionDto) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { courseId: true },
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    await this.assertOwnerOrAdmin(user, section.courseId);
    return this.prisma.section.update({ where: { id: sectionId }, data: dto });
  }

  async removeSection(user: JwtPayload, sectionId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      select: { courseId: true },
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    await this.assertOwnerOrAdmin(user, section.courseId);
    await this.prisma.section.delete({ where: { id: sectionId } });
  }

  async updateLesson(user: JwtPayload, lessonId: string, dto: UpdateLessonDto) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { select: { courseId: true } } },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    await this.assertOwnerOrAdmin(user, lesson.section.courseId);
    return this.prisma.lesson.update({ where: { id: lessonId }, data: dto });
  }

  async removeLesson(user: JwtPayload, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { section: { select: { courseId: true } } },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    await this.assertOwnerOrAdmin(user, lesson.section.courseId);
    await this.prisma.lesson.delete({ where: { id: lessonId } });
  }

  /** Next free `order` value within a section/course, or 0 when empty. */
  private async nextOrder(
    model: 'section' | 'lesson',
    where: Prisma.SectionWhereInput | Prisma.LessonWhereInput,
  ): Promise<number> {
    const agg =
      model === 'section'
        ? await this.prisma.section.aggregate({
            where: where as Prisma.SectionWhereInput,
            _max: { order: true },
          })
        : await this.prisma.lesson.aggregate({
            where: where as Prisma.LessonWhereInput,
            _max: { order: true },
          });
    return (agg._max.order ?? -1) + 1;
  }

  private async assertOwnerOrAdmin(user: JwtPayload, courseId: string): Promise<void> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    if (user.role !== Role.ADMIN && course.instructorId !== user.sub) {
      throw new ForbiddenException('You do not own this course');
    }
  }

  private summaryInclude() {
    return {
      category: true,
      instructor: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { enrollments: true, reviews: true } },
      reviews: { select: { rating: true } },
    } satisfies Prisma.CourseInclude;
  }

  private toSummary(course: CourseWithSummary) {
    const ratings = course.reviews.map((r) => r.rating);
    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle,
      thumbnailUrl: course.thumbnailUrl,
      level: course.level,
      status: course.status,
      format: course.format,
      price: course.price,
      averageRating: averageRating(ratings),
      reviewCount: course._count.reviews,
      enrollmentCount: course._count.enrollments,
      category: course.category,
      instructor: course.instructor,
    };
  }
}

type CourseWithSummary = Prisma.CourseGetPayload<{
  include: {
    category: true;
    instructor: { select: { id: true; name: true; avatarUrl: true } };
    _count: { select: { enrollments: true; reviews: true } };
    reviews: { select: { rating: true } };
  };
}>;
