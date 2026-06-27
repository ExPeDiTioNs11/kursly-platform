import { redirect } from 'next/navigation';
import { Role } from '@kursly/shared';
import { getSession } from '@/lib/session';
import { InternshipManager } from '@/components/company/internship-manager';

export const metadata = { title: 'İlanı Yönet — Kursly' };

export default async function ManageInternshipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/firma/${id}`);
  if (session.role !== Role.COMPANY && session.role !== Role.ADMIN) redirect('/');
  return <InternshipManager id={id} />;
}
