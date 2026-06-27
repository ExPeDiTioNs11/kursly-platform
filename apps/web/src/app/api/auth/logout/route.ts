import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AT_COOKIE, RT_COOKIE, clearSessionCookies } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST() {
  const store = await cookies();
  const accessToken = store.get(AT_COOKIE)?.value;
  const refreshToken = store.get(RT_COOKIE)?.value;

  // Best-effort revoke on the backend; clear local cookies regardless.
  if (accessToken && refreshToken) {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => undefined);
  }

  await clearSessionCookies();
  return NextResponse.json({ ok: true });
}
