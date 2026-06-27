import { redirect } from 'next/navigation';
import { Role } from '@kursly/shared';
import { getSession } from '@/lib/session';
import { CreateCourseForm } from '@/components/teach/create-course-form';

export const metadata = { title: 'Yeni Kurs — Kursly' };

export default async function NewCoursePage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/teach/new');
  if (session.role === Role.STUDENT) redirect('/');
  return <CreateCourseForm />;
}
