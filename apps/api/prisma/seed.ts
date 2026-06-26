import { PrismaClient, Role, CourseLevel, CourseStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@kursly.dev' },
    update: {},
    create: {
      email: 'admin@kursly.dev',
      name: 'Kursly Admin',
      passwordHash: password,
      role: Role.ADMIN,
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@kursly.dev' },
    update: {},
    create: {
      email: 'instructor@kursly.dev',
      name: 'Jane Instructor',
      passwordHash: password,
      role: Role.INSTRUCTOR,
      bio: 'Senior engineer turned educator.',
    },
  });

  await prisma.user.upsert({
    where: { email: 'student@kursly.dev' },
    update: {},
    create: {
      email: 'student@kursly.dev',
      name: 'Sam Student',
      passwordHash: password,
      role: Role.STUDENT,
    },
  });

  const webDev = await prisma.category.upsert({
    where: { slug: 'web-development' },
    update: {},
    create: {
      name: 'Web Development',
      slug: 'web-development',
      description: 'Build modern web applications.',
    },
  });

  const course = await prisma.course.upsert({
    where: { slug: 'fullstack-typescript' },
    update: {},
    create: {
      slug: 'fullstack-typescript',
      title: 'Full-Stack TypeScript',
      subtitle: 'From zero to deployed app',
      description: 'Learn to build a production-grade app with NestJS and Next.js.',
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      price: 0,
      instructorId: instructor.id,
      categoryId: webDev.id,
      sections: {
        create: [
          {
            title: 'Getting Started',
            order: 0,
            lessons: {
              create: [
                { title: 'Welcome', order: 0, durationSeconds: 120, isPreview: true },
                { title: 'Project Setup', order: 1, durationSeconds: 600 },
              ],
            },
          },
          {
            title: 'Building the API',
            order: 1,
            lessons: {
              create: [{ title: 'NestJS Basics', order: 0, durationSeconds: 900 }],
            },
          },
        ],
      },
    },
  });

  console.log('Seed complete:', {
    admin: admin.email,
    instructor: instructor.email,
    course: course.slug,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
