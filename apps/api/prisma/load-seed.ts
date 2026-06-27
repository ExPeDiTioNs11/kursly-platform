/**
 * Load-test seed: generates tens of thousands of rows so queries, indexes and
 * pagination can be profiled locally before there is real traffic.
 *
 * Run:  pnpm --filter @kursly/api db:load-seed
 * Idempotent-ish: uses `skipDuplicates` and `load-` prefixes; safe to re-run.
 */
import {
  PrismaClient,
  Role,
  CourseLevel,
  CourseStatus,
  CourseFormat,
  InternshipStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Tune these for heavier/lighter loads.
const N_STUDENTS = 3000;
const N_INSTRUCTORS = 200;
const N_COMPANIES = 50;
const N_COURSES = 2000;
const N_ENROLLMENTS = 40000;
const N_REVIEWS = 20000;
const N_POSTS = 40000;
const N_COMMENTS = 50000;
const N_FOLLOWS = 30000;
const N_INTERNSHIPS = 1000;
const N_APPLICATIONS = 15000;

const CHUNK = 2000;
const rnd = (n: number) => Math.floor(Math.random() * n);
const pick = <T>(arr: T[]): T => arr[rnd(arr.length)];

async function createManyChunked<T>(
  label: string,
  rows: T[],
  insert: (batch: T[]) => Promise<unknown>,
) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    await insert(rows.slice(i, i + CHUNK));
  }
  console.log(`  + ${rows.length.toLocaleString()} ${label}`);
}

async function main() {
  console.time('load-seed');
  const password = await bcrypt.hash('Password123!', 8);

  console.log('Users…');
  await createManyChunked(
    'students',
    Array.from({ length: N_STUDENTS }, (_, i) => ({
      email: `load-student-${i}@kursly.dev`,
      name: `Yük Öğrenci ${i}`,
      passwordHash: password,
      role: Role.STUDENT,
    })),
    (batch) => prisma.user.createMany({ data: batch, skipDuplicates: true }),
  );
  await createManyChunked(
    'instructors',
    Array.from({ length: N_INSTRUCTORS }, (_, i) => ({
      email: `load-instructor-${i}@kursly.dev`,
      name: `Yük Eğitmen ${i}`,
      passwordHash: password,
      role: Role.INSTRUCTOR,
    })),
    (batch) => prisma.user.createMany({ data: batch, skipDuplicates: true }),
  );
  await createManyChunked(
    'companies',
    Array.from({ length: N_COMPANIES }, (_, i) => ({
      email: `load-company-${i}@kursly.dev`,
      name: `Yük Firma ${i}`,
      passwordHash: password,
      role: Role.COMPANY,
    })),
    (batch) => prisma.user.createMany({ data: batch, skipDuplicates: true }),
  );

  const studentIds = (
    await prisma.user.findMany({ where: { role: Role.STUDENT }, select: { id: true } })
  ).map((u) => u.id);
  const instructorIds = (
    await prisma.user.findMany({ where: { role: Role.INSTRUCTOR }, select: { id: true } })
  ).map((u) => u.id);
  const companyIds = (
    await prisma.user.findMany({ where: { role: Role.COMPANY }, select: { id: true } })
  ).map((u) => u.id);
  const categoryIds = (await prisma.category.findMany({ select: { id: true } })).map((c) => c.id);
  const allUserIds = [...studentIds, ...instructorIds];
  const levels = Object.values(CourseLevel);

  console.log('Courses…');
  await createManyChunked(
    'courses',
    Array.from({ length: N_COURSES }, (_, i) => ({
      slug: `load-course-${i}`,
      title: `Yük Kursu ${i} — ${pick(['React', 'Python', 'SQL', 'Figma', 'Pazarlama', 'Go'])}`,
      subtitle: 'Otomatik üretilmiş yük testi kursu',
      level: pick(levels),
      status: CourseStatus.PUBLISHED,
      format: Math.random() < 0.3 ? CourseFormat.MINI : CourseFormat.FULL,
      price: 0,
      instructorId: pick(instructorIds),
      categoryId: categoryIds.length ? pick(categoryIds) : null,
    })),
    (batch) => prisma.course.createMany({ data: batch, skipDuplicates: true }),
  );
  const courseIds = (
    await prisma.course.findMany({
      where: { slug: { startsWith: 'load-course-' } },
      select: { id: true },
    })
  ).map((c) => c.id);

  console.log('Enrollments + reviews…');
  await createManyChunked(
    'enrollments',
    Array.from({ length: N_ENROLLMENTS }, () => ({
      userId: pick(studentIds),
      courseId: pick(courseIds),
    })),
    (batch) => prisma.enrollment.createMany({ data: batch, skipDuplicates: true }),
  );
  await createManyChunked(
    'reviews',
    Array.from({ length: N_REVIEWS }, () => ({
      userId: pick(studentIds),
      courseId: pick(courseIds),
      rating: 1 + rnd(5),
      comment: 'Otomatik üretilmiş değerlendirme.',
    })),
    (batch) => prisma.review.createMany({ data: batch, skipDuplicates: true }),
  );

  console.log('Posts + comments…');
  await createManyChunked(
    'posts',
    Array.from({ length: N_POSTS }, (_, i) => ({
      authorId: pick(allUserIds),
      content: `Yük testi paylaşımı #${i} — örnek içerik.`,
    })),
    (batch) => prisma.post.createMany({ data: batch, skipDuplicates: true }),
  );
  const postIds = (
    await prisma.post.findMany({
      where: { content: { startsWith: 'Yük testi paylaşımı' } },
      select: { id: true },
      take: 20000,
    })
  ).map((p) => p.id);
  await createManyChunked(
    'comments',
    Array.from({ length: N_COMMENTS }, () => ({
      postId: pick(postIds),
      authorId: pick(allUserIds),
      content: 'Otomatik üretilmiş yorum.',
    })),
    (batch) => prisma.postComment.createMany({ data: batch, skipDuplicates: true }),
  );

  console.log('Follows…');
  await createManyChunked(
    'follows',
    Array.from({ length: N_FOLLOWS }, () => {
      const followerId = pick(allUserIds);
      let followingId = pick(allUserIds);
      if (followingId === followerId) followingId = pick(instructorIds);
      return { followerId, followingId };
    }).filter((f) => f.followerId !== f.followingId),
    (batch) => prisma.follow.createMany({ data: batch, skipDuplicates: true }),
  );

  console.log('Internships + applications…');
  await createManyChunked(
    'internships',
    Array.from({ length: N_INTERNSHIPS }, (_, i) => ({
      companyId: pick(companyIds),
      title: `Yük Stajı ${i} — ${pick(['Frontend', 'Backend', 'Veri', 'Tasarım', 'Mobil'])}`,
      description: 'Otomatik üretilmiş yük testi staj ilanı. Detaylar burada yer alır.',
      field: pick(['Yazılım Geliştirme', 'Tasarım', 'Veri Bilimi', 'Pazarlama']),
      location: pick(['İstanbul', 'Ankara', 'İzmir']),
      isRemote: Math.random() < 0.4,
      durationMonths: 1 + rnd(12),
      status: InternshipStatus.OPEN,
    })),
    (batch) => prisma.internship.createMany({ data: batch, skipDuplicates: true }),
  );
  const internshipIds = (
    await prisma.internship.findMany({
      where: { title: { startsWith: 'Yük Stajı' } },
      select: { id: true },
    })
  ).map((i) => i.id);
  await createManyChunked(
    'applications',
    Array.from({ length: N_APPLICATIONS }, () => ({
      internshipId: pick(internshipIds),
      applicantId: pick(studentIds),
      message: 'Otomatik üretilmiş başvuru.',
    })),
    (batch) => prisma.internshipApplication.createMany({ data: batch, skipDuplicates: true }),
  );

  console.timeEnd('load-seed');
  console.log('Load seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
