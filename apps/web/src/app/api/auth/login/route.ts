import { NextResponse } from 'next/server';
import type { AuthResponse } from '@kursly/shared';
import { setSessionCookies } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    remember?: boolean;
  };
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { message: data.message ?? 'Giriş başarısız' },
      { status: res.status },
    );
  }
  await setSessionCookies(data as AuthResponse, body.remember !== false);
  return NextResponse.json({ user: (data as AuthResponse).user });
}
