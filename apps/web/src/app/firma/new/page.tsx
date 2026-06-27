import { redirect } from 'next/navigation';
import { Role } from '@kursly/shared';
import { getSession } from '@/lib/session';
import { CreateInternshipForm } from '@/components/company/create-internship-form';

export const metadata = { title: 'Yeni İlan — Kursly' };

export default async function NewInternshipPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/firma/new');
  if (session.role !== Role.COMPANY && session.role !== Role.ADMIN) redirect('/');
  return <CreateInternshipForm />;
}
