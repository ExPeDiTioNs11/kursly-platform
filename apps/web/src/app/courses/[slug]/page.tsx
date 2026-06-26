import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration, formatPrice } from '@/lib/utils';
import type { ApiError } from '@/lib/api';

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let course;
  try {
    course = await api.getCourse(slug);
  } catch (err) {
    if ((err as ApiError).status === 404) {
      notFound();
    }
    throw err;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary">{course.level}</Badge>
            {course.category && <Badge variant="outline">{course.category.name}</Badge>}
          </div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          {course.subtitle && <p className="mt-2 text-muted-foreground">{course.subtitle}</p>}
          <p className="mt-3 text-sm text-muted-foreground">
            Taught by {course.instructor.name} · ⭐ {course.averageRating.toFixed(1)} (
            {course.reviewCount} reviews) · {course.enrollmentCount} students
          </p>
        </div>

        {course.description && (
          <section>
            <h2 className="mb-2 text-xl font-semibold">About this course</h2>
            <p className="whitespace-pre-line text-muted-foreground">{course.description}</p>
          </section>
        )}

        <section>
          <h2 className="mb-4 text-xl font-semibold">Curriculum</h2>
          <div className="space-y-4">
            {course.sections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {section.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between text-sm">
                      <span>
                        {lesson.title}
                        {lesson.isPreview && (
                          <Badge variant="outline" className="ml-2">
                            Preview
                          </Badge>
                        )}
                      </span>
                      <span className="text-muted-foreground">
                        {formatDuration(lesson.durationSeconds)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>

      <aside className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardContent className="space-y-4 pt-6">
            <p className="text-3xl font-bold">{formatPrice(course.price)}</p>
            <Button className="w-full">Enroll now</Button>
            <p className="text-center text-xs text-muted-foreground">
              Full lifetime access · Learn at your own pace
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
