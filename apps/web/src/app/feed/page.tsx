import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { FeedClient } from './feed-client';

export const metadata = {
  title: 'Akışım — Kursly',
};

export default async function FeedPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login?next=/feed');
  }
  return <FeedClient user={session} />;
}
