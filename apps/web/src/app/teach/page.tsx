import { redirect } from 'next/navigation';
import { Role } from '@kursly/shared';
import { getSession } from '@/lib/session';
import { TeachDashboard } from '@/components/teach/teach-dashboard';

export const metadata = { title: 'Eğitmen Paneli — Kursly' };

export default async function TeachPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/teach');
  if (session.role === Role.STUDENT) redirect('/');
  return <TeachDashboard />;
}
