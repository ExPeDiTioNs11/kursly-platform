import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { MyApplicationsClient } from '@/components/internships/my-applications-client';

export const metadata = { title: 'Başvurularım — Kursly' };

export default async function MyApplicationsPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/basvurularim');
  return <MyApplicationsClient />;
}
