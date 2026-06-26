import { NotFoundException } from '@nestjs/common';
import { CourseStatus, Role } from '@kursly/shared';
import type { JwtPayload } from '@kursly/shared';
import { CoursesService } from './courses.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateSectionDto } from './dto/create-section.dto';

const instructor: JwtPayload = { sub: 'i1', email: 'i@x.com', role: Role.INSTRUCTOR };

function makePrisma() {
  return {
    course: { findUnique: jest.fn() },
    section: { aggregate: jest.fn(), create: jest.fn() },
    lesson: { aggregate: jest.fn(), create: jest.fn() },
  };
}

describe('CoursesService', () => {
  it('hides non-published courses from the public detail endpoint', async () => {
    const prisma = makePrisma();
    prisma.course.findUnique.mockResolvedValue({ slug: 'draft', status: CourseStatus.DRAFT });
    const service = new CoursesService(prisma as unknown as PrismaService);

    await expect(service.findBySlug('draft')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('auto-assigns the next section order to avoid unique-constraint clashes', async () => {
    const prisma = makePrisma();
    prisma.course.findUnique.mockResolvedValue({ instructorId: 'i1' }); // ownership check
    prisma.section.aggregate.mockResolvedValue({ _max: { order: 2 } });
    prisma.section.create.mockResolvedValue({ id: 's1' });
    const service = new CoursesService(prisma as unknown as PrismaService);

    await service.addSection(instructor, 'c1', { title: 'Intro' } as CreateSectionDto);

    expect(prisma.section.create).toHaveBeenCalledWith({
      data: { title: 'Intro', order: 3, courseId: 'c1' },
    });
  });
});
