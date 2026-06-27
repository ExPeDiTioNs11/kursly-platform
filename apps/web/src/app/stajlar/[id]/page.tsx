import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { InternshipDetailClient } from '@/components/internships/internship-detail-client';

export const metadata = { title: 'Staj İlanı — Kursly' };

export default async function InternshipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/login?next=/stajlar/${id}`);
  return <InternshipDetailClient id={id} viewer={session} />;
}
