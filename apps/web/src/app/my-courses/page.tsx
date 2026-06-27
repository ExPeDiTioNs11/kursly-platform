import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { MyCoursesClient } from '@/components/courses/my-courses-client';

export const metadata = {
  title: 'Kurslarım — Kursly',
};

export default async function MyCoursesPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/my-courses');
  }
  return <MyCoursesClient />;
}
