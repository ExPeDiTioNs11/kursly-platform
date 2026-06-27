import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { InternshipsClient } from '@/components/internships/internships-client';

export const metadata = { title: 'Staj İlanları — Kursly' };

export default async function InternshipsPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/stajlar');
  return <InternshipsClient viewer={session} />;
}
