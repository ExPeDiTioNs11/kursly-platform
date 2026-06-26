import { api } from '@/lib/api';
import { CourseCard } from '@/components/course-card';
import type { CourseSummary } from '@kursly/shared';

export default async function HomePage() {
  let courses: CourseSummary[] = [];
  let error: string | null = null;

  try {
    const result = await api.listCourses();
    courses = result.items;
  } catch {
    error = 'Could not load courses. Is the API running?';
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-secondary px-6 py-12 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Learn anything, on your schedule</h1>
        <p className="mt-3 text-muted-foreground">
          Video courses taught by industry experts. Start learning today.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">Explore courses</h2>
        {error ? (
          <p className="text-muted-foreground">{error}</p>
        ) : courses.length === 0 ? (
          <p className="text-muted-foreground">No courses published yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
