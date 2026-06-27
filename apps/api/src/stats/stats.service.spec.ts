import { Role } from '@kursly/shared';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';

describe('StatsService', () => {
  it('aggregates platform counts and maps featured reviews', async () => {
    const prisma = {
      course: { count: jest.fn().mockResolvedValue(6) },
      user: { count: jest.fn().mockResolvedValueOnce(3).mockResolvedValueOnce(2) },
      enrollment: { count: jest.fn().mockResolvedValue(4) },
      review: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'r1',
            rating: 5,
            comment: 'Harika',
            user: { id: 'u1', name: 'Ali', avatarUrl: null, role: Role.STUDENT },
            course: { title: 'Kurs', slug: 'kurs' },
          },
        ]),
      },
    };
    const service = new StatsService(prisma as unknown as PrismaService);

    const stats = await service.getStats();

    expect(stats).toMatchObject({ courses: 6, students: 3, instructors: 2, enrollments: 4 });
    expect(stats.featuredReviews).toHaveLength(1);
    expect(stats.featuredReviews[0]).toMatchObject({
      rating: 5,
      comment: 'Harika',
      courseTitle: 'Kurs',
      courseSlug: 'kurs',
    });
  });
});
