import { redirect } from 'next/navigation';
import { Role } from '@kursly/shared';
import { getSession } from '@/lib/session';
import { CompanyDashboard } from '@/components/company/company-dashboard';

export const metadata = { title: 'Firma Paneli — Kursly' };

export default async function CompanyPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/firma');
  if (session.role !== Role.COMPANY && session.role !== Role.ADMIN) redirect('/');
  return <CompanyDashboard />;
}
