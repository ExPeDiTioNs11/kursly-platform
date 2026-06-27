import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { ProfileClient } from './profile-client';

export const metadata = {
  title: 'Profil — Kursly',
};

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    redirect(`/login?next=/u/${id}`);
  }
  return <ProfileClient userId={id} viewer={session} />;
}
