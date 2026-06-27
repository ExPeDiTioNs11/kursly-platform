import { api } from '@/lib/api';
import { CourseCard } from '@/components/course-card';
import { CourseFilters } from '@/components/courses/course-filters';
import type { ActiveFilters } from '@/components/courses/course-filters';
import type { CategoryNode, CourseSummary } from '@kursly/shared';

export const metadata = {
  title: 'Keşfet — Kursly',
  description: 'Kategori, alt kategori, seviye ve türe göre kursları keşfet.',
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<ActiveFilters>;
}) {
  const sp = await searchParams;
  const active: ActiveFilters = {
    search: sp.search,
    category: sp.category,
    subcategory: sp.subcategory,
    level: sp.level,
    format: sp.format,
  };

  // Only forward defined params to the API.
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(active)) {
    if (v) params[k] = v;
  }

  let courses: CourseSummary[] = [];
  let tree: CategoryNode[] = [];
  let error: string | null = null;

  try {
    const [coursesRes, treeRes] = await Promise.all([
      api.listCourses(params),
      api.listCategoryTree(),
    ]);
    courses = coursesRes.items;
    tree = treeRes;
  } catch {
    error = 'Kurslar yüklenemedi. API çalışıyor mu?';
  }

  const heading = active.search ? `“${active.search}” için sonuçlar` : 'Kursları keşfet';

  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-4">
      <aside className="lg:col-span-1">
        <CourseFilters tree={tree} active={active} />
      </aside>

      <div className="lg:col-span-3">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{heading}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {courses.length > 0
              ? `${courses.length} kurs listeleniyor`
              : 'Filtrelerine uygun kurs ara'}
          </p>
        </div>

        {error ? (
          <p className="text-muted-foreground">{error}</p>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
            Filtrelerine uygun kurs bulunamadı. Filtreleri değiştirip tekrar dene.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
