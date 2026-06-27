import { PrismaClient, Role, CourseLevel, CourseStatus, CourseFormat } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const avatar = (email: string) => `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`;
const image = (seed: string, w = 800, h = 500) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

async function main() {
  const password = await bcrypt.hash('Password123!', 10);

  // ─────────────────────────  Users  ─────────────────────────
  const upsertUser = (email: string, name: string, role: Role, bio?: string) =>
    prisma.user.upsert({
      where: { email },
      update: { name, role, avatarUrl: avatar(email), ...(bio ? { bio } : {}) },
      create: {
        email,
        name,
        role,
        passwordHash: password,
        avatarUrl: avatar(email),
        ...(bio ? { bio } : {}),
      },
    });

  const admin = await upsertUser('admin@kursly.dev', 'Kursly Admin', Role.ADMIN);
  const instructor = await upsertUser(
    'instructor@kursly.dev',
    'Jane Instructor',
    Role.INSTRUCTOR,
    'Senior engineer turned educator.',
  );
  const instructor2 = await upsertUser(
    'instructor2@kursly.dev',
    'Deniz Yılmaz',
    Role.INSTRUCTOR,
    'Ürün tasarımcısı ve UI/UX eğitmeni.',
  );
  const student = await upsertUser('student@kursly.dev', 'Sam Student', Role.STUDENT);
  const student2 = await upsertUser('student2@kursly.dev', 'Ayşe Demir', Role.STUDENT);
  const company = await upsertUser(
    'company@kursly.dev',
    'Acme Yazılım',
    Role.COMPANY,
    'Yenilikçi yazılım çözümleri geliştiriyoruz. Staj programımıza katıl!',
  );

  // ─────────────────────────  Categories (tree)  ─────────────────────────
  const upsertCategory = (slug: string, name: string, description: string, parentId?: string) =>
    prisma.category.upsert({
      where: { slug },
      update: { name, description, parentId: parentId ?? null },
      create: { slug, name, description, parentId: parentId ?? null },
    });

  const webDev = await upsertCategory(
    'web-development',
    'Web Geliştirme',
    'Modern web uygulamaları geliştir.',
  );
  const frontend = await upsertCategory(
    'frontend',
    'Frontend',
    'Kullanıcı arayüzü geliştirme.',
    webDev.id,
  );
  const backend = await upsertCategory(
    'backend',
    'Backend',
    'Sunucu tarafı geliştirme.',
    webDev.id,
  );

  const design = await upsertCategory('design', 'Tasarım', 'UI/UX ve görsel tasarım.');
  await upsertCategory('ui-ux', 'UI/UX Tasarım', 'Arayüz ve deneyim tasarımı.', design.id);
  await upsertCategory('graphic-design', 'Grafik Tasarım', 'Görsel ve marka tasarımı.', design.id);

  const dataSci = await upsertCategory(
    'data-science',
    'Veri Bilimi',
    'Veri analizi ve makine öğrenmesi.',
  );
  await upsertCategory('data-analysis', 'Veri Analizi', 'Veriyi anlamlandırma.', dataSci.id);
  await upsertCategory(
    'machine-learning',
    'Makine Öğrenmesi',
    'Modeller ve algoritmalar.',
    dataSci.id,
  );

  const marketing = await upsertCategory('marketing', 'Pazarlama', 'Dijital pazarlama ve büyüme.');
  await upsertCategory('seo', 'SEO', 'Arama motoru optimizasyonu.', marketing.id);
  await upsertCategory('social-media', 'Sosyal Medya', 'Sosyal medya pazarlaması.', marketing.id);

  const business = await upsertCategory(
    'business',
    'İş & Girişimcilik',
    'İş dünyası ve girişimcilik.',
  );
  await upsertCategory('entrepreneurship', 'Girişimcilik', 'Sıfırdan iş kurma.', business.id);
  await upsertCategory('finance', 'Finans', 'Finans ve yatırım temelleri.', business.id);

  const personal = await upsertCategory(
    'personal-development',
    'Kişisel Gelişim',
    'Üretkenlik ve kişisel beceriler.',
  );
  await upsertCategory('productivity', 'Üretkenlik', 'Zaman yönetimi ve verimlilik.', personal.id);

  const mobile = await upsertCategory('mobile', 'Mobil Geliştirme', 'iOS ve Android uygulamaları.');
  await upsertCategory('flutter', 'Flutter', 'Çapraz platform mobil geliştirme.', mobile.id);

  // ─────────────────────────  Full course (existing)  ─────────────────────────
  const course = await prisma.course.upsert({
    where: { slug: 'fullstack-typescript' },
    update: { categoryId: webDev.id, format: CourseFormat.FULL },
    create: {
      slug: 'fullstack-typescript',
      title: 'Full-Stack TypeScript',
      subtitle: 'From zero to deployed app',
      description: 'Learn to build a production-grade app with NestJS and Next.js.',
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      format: CourseFormat.FULL,
      price: 0,
      instructorId: instructor.id,
      categoryId: webDev.id,
      thumbnailUrl: image('kursly-fullstack', 600, 400),
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
            lessons: { create: [{ title: 'NestJS Basics', order: 0, durationSeconds: 900 }] },
          },
        ],
      },
    },
  });

  // One more full course for the "recommended" row.
  const nextjsCourse = await prisma.course.upsert({
    where: { slug: 'nextjs-app-router' },
    update: { categoryId: frontend.id, format: CourseFormat.FULL },
    create: {
      slug: 'nextjs-app-router',
      title: 'Next.js App Router ile Modern Web',
      subtitle: 'Sunucu bileşenleri, routing ve veri çekme',
      description: 'Next.js 15 App Router ile uçtan uca modern bir uygulama geliştir.',
      level: CourseLevel.INTERMEDIATE,
      status: CourseStatus.PUBLISHED,
      format: CourseFormat.FULL,
      price: 0,
      instructorId: instructor2.id,
      categoryId: frontend.id,
      thumbnailUrl: image('kursly-nextjs', 600, 400),
      sections: {
        create: [
          {
            title: 'Temeller',
            order: 0,
            lessons: {
              create: [
                { title: 'App Router’a Giriş', order: 0, durationSeconds: 420, isPreview: true },
              ],
            },
          },
        ],
      },
    },
  });

  // ─────────────────────────  Mini courses  ─────────────────────────
  const miniCourses: {
    slug: string;
    title: string;
    subtitle: string;
    categoryId: string;
    instructorId: string;
    seed: string;
  }[] = [
    {
      slug: 'git-temelleri',
      title: 'Git Temelleri',
      subtitle: '10 dakikada sürüm kontrolü',
      categoryId: backend.id,
      instructorId: instructor.id,
      seed: 'kursly-git',
    },
    {
      slug: 'css-flexbox',
      title: 'CSS Flexbox',
      subtitle: 'Esnek yerleşimi 8 dakikada öğren',
      categoryId: frontend.id,
      instructorId: instructor2.id,
      seed: 'kursly-flexbox',
    },
    {
      slug: 'js-async-await',
      title: 'JavaScript async/await',
      subtitle: 'Asenkron kodu basitleştir',
      categoryId: frontend.id,
      instructorId: instructor.id,
      seed: 'kursly-async',
    },
    {
      slug: 'pandas-giris',
      title: 'Pandas’a Hızlı Giriş',
      subtitle: 'Veri çerçeveleriyle ilk adım',
      categoryId: dataSci.id,
      instructorId: instructor2.id,
      seed: 'kursly-pandas',
    },
  ];

  const miniBySlug: Record<string, { id: string }> = {};
  for (const m of miniCourses) {
    const created = await prisma.course.upsert({
      where: { slug: m.slug },
      update: {
        categoryId: m.categoryId,
        format: CourseFormat.MINI,
        status: CourseStatus.PUBLISHED,
      },
      create: {
        slug: m.slug,
        title: m.title,
        subtitle: m.subtitle,
        level: CourseLevel.BEGINNER,
        status: CourseStatus.PUBLISHED,
        format: CourseFormat.MINI,
        price: 0,
        instructorId: m.instructorId,
        categoryId: m.categoryId,
        thumbnailUrl: image(m.seed, 600, 400),
        sections: {
          create: [
            {
              title: 'Mini Ders',
              order: 0,
              lessons: {
                create: [{ title: m.title, order: 0, durationSeconds: 540, isPreview: true }],
              },
            },
          ],
        },
      },
    });
    miniBySlug[m.slug] = created;
  }

  // ─────────────────────────  Feed posts  ─────────────────────────
  const posts: {
    id: string;
    authorId: string;
    content: string;
    imageUrl?: string;
    courseId?: string;
  }[] = [
    {
      id: 'seed-post-1',
      authorId: instructor.id,
      content:
        'NestJS’te modüler mimariyi doğru kurmak, projeniz büyüdükçe hayat kurtarıyor. Yeni Full-Stack TypeScript kursumda bunu adım adım anlatıyorum 👇',
      courseId: course.id,
    },
    {
      id: 'seed-post-2',
      authorId: instructor2.id,
      content:
        'Tasarımda boşluk (whitespace) bir “boşa alan” değil, bir araçtır. Nefes alan arayüzler her zaman daha profesyonel görünür. ✨',
      imageUrl: image('kursly-design-tip', 800, 500),
    },
    {
      id: 'seed-post-3',
      authorId: student.id,
      content:
        'Bugün ilk React projemi tamamladım! 🎉 Kursly’deki mini dersler gerçekten işe yarıyor.',
    },
    {
      id: 'seed-post-4',
      authorId: student2.id,
      content:
        'Veri bilimi yolculuğuma Pandas ile başladım. Küçük adımlarla ilerlemek motivasyonu yüksek tutuyor 📊',
      courseId: miniBySlug['pandas-giris']?.id,
    },
    {
      id: 'seed-post-5',
      authorId: instructor.id,
      content:
        'Yeni mini eğitim yayında: “Git Temelleri”. 10 dakikada commit, branch ve merge mantığını oturtuyoruz. 🚀',
      imageUrl: image('kursly-git-post', 800, 500),
      courseId: miniBySlug['git-temelleri']?.id,
    },
  ];

  for (const p of posts) {
    await prisma.post.upsert({
      where: { id: p.id },
      update: { content: p.content, imageUrl: p.imageUrl ?? null, courseId: p.courseId ?? null },
      create: {
        id: p.id,
        authorId: p.authorId,
        content: p.content,
        imageUrl: p.imageUrl ?? null,
        courseId: p.courseId ?? null,
      },
    });
  }

  // ─────────────────────────  Comments  ─────────────────────────
  const comments: { id: string; postId: string; authorId: string; content: string }[] = [
    {
      id: 'seed-c-1',
      postId: 'seed-post-1',
      authorId: student.id,
      content: 'Tam da ihtiyacım olan konuydu, teşekkürler!',
    },
    {
      id: 'seed-c-2',
      postId: 'seed-post-1',
      authorId: student2.id,
      content: 'Modül sınırlarını nasıl belirliyorsunuz?',
    },
    {
      id: 'seed-c-3',
      postId: 'seed-post-2',
      authorId: student.id,
      content: 'Bu örnekteki boşluk kullanımı çok net olmuş 👏',
    },
    {
      id: 'seed-c-4',
      postId: 'seed-post-3',
      authorId: instructor.id,
      content: 'Tebrikler Sam, harika bir başlangıç!',
    },
  ];
  for (const c of comments) {
    await prisma.postComment.upsert({
      where: { id: c.id },
      update: { content: c.content },
      create: { id: c.id, postId: c.postId, authorId: c.authorId, content: c.content },
    });
  }

  // ─────────────────────────  Likes  ─────────────────────────
  const likes: { postId: string; userId: string }[] = [
    { postId: 'seed-post-1', userId: student.id },
    { postId: 'seed-post-1', userId: student2.id },
    { postId: 'seed-post-1', userId: instructor2.id },
    { postId: 'seed-post-2', userId: student.id },
    { postId: 'seed-post-2', userId: instructor.id },
    { postId: 'seed-post-3', userId: instructor.id },
    { postId: 'seed-post-5', userId: student.id },
    { postId: 'seed-post-5', userId: student2.id },
  ];
  for (const l of likes) {
    await prisma.postLike.upsert({
      where: { postId_userId: { postId: l.postId, userId: l.userId } },
      update: {},
      create: { postId: l.postId, userId: l.userId },
    });
  }

  // ─────────────────────────  Stories (refreshed to "now")  ─────────────────────────
  const stories: { id: string; authorId: string; seed: string; caption?: string }[] = [
    {
      id: 'seed-story-1',
      authorId: instructor.id,
      seed: 'kursly-story-1',
      caption: 'Yeni ders kaydında! 🎬',
    },
    {
      id: 'seed-story-2',
      authorId: instructor.id,
      seed: 'kursly-story-2',
      caption: 'Sahne arkası',
    },
    {
      id: 'seed-story-3',
      authorId: instructor2.id,
      seed: 'kursly-story-3',
      caption: 'Bugünün tasarım ipucu',
    },
    {
      id: 'seed-story-4',
      authorId: student.id,
      seed: 'kursly-story-4',
      caption: 'Çalışma masam 💻',
    },
  ];
  for (const s of stories) {
    const now = new Date();
    await prisma.story.upsert({
      where: { id: s.id },
      update: { mediaUrl: image(s.seed, 720, 1280), caption: s.caption ?? null, createdAt: now },
      create: {
        id: s.id,
        authorId: s.authorId,
        mediaUrl: image(s.seed, 720, 1280),
        caption: s.caption ?? null,
        createdAt: now,
      },
    });
  }

  // ─────────────────────────  Follows  ─────────────────────────
  const follows: { followerId: string; followingId: string }[] = [
    { followerId: student.id, followingId: instructor.id },
    { followerId: student.id, followingId: instructor2.id },
    { followerId: student2.id, followingId: instructor.id },
    { followerId: instructor.id, followingId: instructor2.id },
  ];
  for (const f of follows) {
    await prisma.follow.upsert({
      where: { followerId_followingId: { followerId: f.followerId, followingId: f.followingId } },
      update: {},
      create: { followerId: f.followerId, followingId: f.followingId },
    });
  }

  // ─────────────────────────  Enrollments  ─────────────────────────
  const enrollPairs = [
    { userId: student.id, courseId: course.id },
    { userId: student.id, courseId: nextjsCourse.id },
    { userId: student2.id, courseId: course.id },
    { userId: student2.id, courseId: miniBySlug['git-temelleri'].id },
  ];
  for (const e of enrollPairs) {
    await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: e.userId, courseId: e.courseId } },
      update: {},
      create: e,
    });
  }

  // ─────────────────────────  Reviews (testimonials)  ─────────────────────────
  const reviewData = [
    {
      userId: student.id,
      courseId: course.id,
      rating: 5,
      comment: 'Anlatım çok net, projeyle birlikte ilerlemek harikaydı! Kesinlikle tavsiye ederim.',
    },
    {
      userId: student2.id,
      courseId: course.id,
      rating: 4,
      comment: 'Başlangıç için ideal bir kurs, örnekler çok faydalıydı.',
    },
    {
      userId: student.id,
      courseId: nextjsCourse.id,
      rating: 5,
      comment: 'App Router mantığını en sonunda tam oturttum. Eline sağlık!',
    },
    {
      userId: student2.id,
      courseId: miniBySlug['git-temelleri'].id,
      rating: 5,
      comment: 'Git’i 10 dakikada kaptım, mini eğitimler tam aradığım şeydi.',
    },
  ];
  for (const r of reviewData) {
    await prisma.review.upsert({
      where: { userId_courseId: { userId: r.userId, courseId: r.courseId } },
      update: { rating: r.rating, comment: r.comment },
      create: r,
    });
  }

  // ─────────────────────────  Internships  ─────────────────────────
  const internships = [
    {
      id: 'seed-intern-1',
      title: 'Frontend Geliştirme Stajyeri',
      description:
        'React ve TypeScript ile modern arayüzler geliştireceğin, deneyimli bir ekiple çalışacağın bir staj fırsatı. Git ve temel JavaScript bilgisi yeterli.',
      field: 'Yazılım Geliştirme',
      location: 'İstanbul',
      isRemote: false,
      durationMonths: 3,
    },
    {
      id: 'seed-intern-2',
      title: 'UI/UX Tasarım Stajyeri (Uzaktan)',
      description:
        'Figma ile kullanıcı arayüzleri tasarlayacağın, ürün ekibiyle birlikte çalışacağın uzaktan bir staj. Tasarım portfolyosu artı puan.',
      field: 'Tasarım',
      location: null,
      isRemote: true,
      durationMonths: 6,
    },
    {
      id: 'seed-intern-3',
      title: 'Veri Analizi Stajyeri',
      description:
        'Python ve SQL ile veri analizi yapacağın, raporlama ve görselleştirme süreçlerine destek olacağın bir staj programı.',
      field: 'Veri Bilimi',
      location: 'Ankara',
      isRemote: false,
      durationMonths: 4,
    },
  ];
  for (const i of internships) {
    await prisma.internship.upsert({
      where: { id: i.id },
      update: {
        title: i.title,
        description: i.description,
        field: i.field,
        location: i.location,
        isRemote: i.isRemote,
        durationMonths: i.durationMonths,
      },
      create: { ...i, companyId: company.id },
    });
  }
  await prisma.internshipApplication.upsert({
    where: { internshipId_applicantId: { internshipId: 'seed-intern-1', applicantId: student.id } },
    update: {},
    create: {
      internshipId: 'seed-intern-1',
      applicantId: student.id,
      message: 'Frontend tarafında kendimi geliştirmek istiyorum, başvurmaktan heyecan duyuyorum.',
    },
  });

  console.log('Seed complete:', {
    admin: admin.email,
    instructors: [instructor.email, instructor2.email],
    students: [student.email, student2.email],
    courses: [course.slug, nextjsCourse.slug, ...Object.keys(miniBySlug)],
    posts: posts.length,
    stories: stories.length,
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
