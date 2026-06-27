import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import type { ApiError } from '@/lib/api';
import type { CourseReview } from '@kursly/shared';
import { getSession } from '@/lib/session';
import { CourseDetailClient } from '@/components/courses/course-detail-client';

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

  const [reviews, session] = await Promise.all([
    api.listReviews(course.id).catch(() => [] as CourseReview[]),
    getSession(),
  ]);

  return <CourseDetailClient course={course} reviews={reviews} session={session} />;
}
