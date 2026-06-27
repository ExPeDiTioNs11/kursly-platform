import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { CourseCard } from '@/components/course-card';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/landing/motion';
import {
  Categories,
  Features,
  FinalCta,
  Hero,
  HowItWorks,
  LearningPaths,
  Stats,
  Testimonials,
} from '@/components/landing/landing-sections';
import type { CategoryNode, CourseSummary, PlatformStats } from '@kursly/shared';

const EMPTY_STATS: PlatformStats = {
  courses: 0,
  students: 0,
  instructors: 0,
  enrollments: 0,
  featuredReviews: [],
};

export default async function HomePage() {
  let courses: CourseSummary[] = [];
  let categories: CategoryNode[] = [];
  let stats: PlatformStats = EMPTY_STATS;
  let error: string | null = null;

  try {
    const [coursesRes, treeRes, statsRes] = await Promise.all([
      api.listCourses({ pageSize: '6' }),
      api.listCategoryTree(),
      api.getStats(),
    ]);
    courses = coursesRes.items;
    categories = treeRes;
    stats = statsRes;
  } catch {
    error = 'Kurslar yüklenemedi. API çalışıyor mu?';
  }

  return (
    <>
      <Hero />
      <Stats stats={stats} />
      <Categories categories={categories} />

      {/* Öne çıkan kurslar — gerçek verilerle */}
      <section id="populer" className="scroll-mt-20 bg-secondary/30 py-20">
        <div className="container">
          <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="inline-block rounded-full bg-gradient-to-r from-indigo-500/10 to-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Kurslar
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Öne çıkan kurslar
              </h2>
              <p className="mt-3 text-muted-foreground">
                Öğrencilerin en çok tercih ettiği kurslarla öğrenmeye başla.
              </p>
            </div>
            <Link href="/courses">
              <Button variant="outline" className="group">
                Tümünü Gör
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </Reveal>

          {error ? (
            <p className="text-muted-foreground">{error}</p>
          ) : courses.length === 0 ? (
            <p className="text-muted-foreground">Henüz yayınlanmış kurs yok.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, i) => (
                <Reveal key={course.id} delay={i * 80}>
                  <CourseCard course={course} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <LearningPaths />
      <Features />
      <HowItWorks />
      <Testimonials reviews={stats.featuredReviews} />
      <FinalCta />
    </>
  );
}
