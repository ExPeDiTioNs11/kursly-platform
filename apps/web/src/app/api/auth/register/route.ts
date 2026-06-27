import { NextResponse } from 'next/server';
import type { AuthResponse } from '@kursly/shared';
import { setSessionCookies } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message[0] : data.message;
    return NextResponse.json(
      { message: message ?? 'Kayıt oluşturulamadı' },
      { status: res.status },
    );
  }
  await setSessionCookies(data as AuthResponse);
  return NextResponse.json({ user: (data as AuthResponse).user });
}
