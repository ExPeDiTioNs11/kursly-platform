import Link from 'next/link';
import type { CourseSummary } from '@kursly/shared';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

export function CourseCard({ course }: { course: CourseSummary }) {
  return (
    <Link href={`/courses/${course.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5">
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {course.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-4xl font-bold text-white/90">
              {course.title.charAt(0)}
            </div>
          )}
        </div>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{course.level}</Badge>
            {course.category && <Badge variant="outline">{course.category.name}</Badge>}
          </div>
          <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p className="line-clamp-2">{course.subtitle}</p>
          <p className="mt-2">Eğitmen: {course.instructor.name}</p>
        </CardContent>
        <CardFooter className="justify-between">
          <span className="text-sm">
            ⭐ {course.averageRating.toFixed(1)} ({course.reviewCount})
          </span>
          <span className="font-semibold">{formatPrice(course.price)}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
