import { redirect } from 'next/navigation';
import { Role } from '@kursly/shared';
import { getSession } from '@/lib/session';
import { CourseEditor } from '@/components/teach/course-editor';

export const metadata = { title: 'Kursu Düzenle — Kursly' };

export default async function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/teach/${id}`);
  if (session.role === Role.STUDENT) redirect('/');
  return <CourseEditor courseId={id} />;
}
