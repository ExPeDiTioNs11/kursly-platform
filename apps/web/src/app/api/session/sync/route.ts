import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AT_COOKIE, USER_COOKIE } from '@/lib/session';

/**
 * Refreshes the display-only profile cookie (name/avatar/role) so the header
 * reflects profile edits without a re-login. Requires an active session.
 */
export async function POST(req: Request) {
  const store = await cookies();
  if (!store.get(AT_COOKIE)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    id?: string;
    name?: string;
    avatarUrl?: string | null;
    role?: string;
  } | null;
  if (!body?.id || !body.name || !body.role) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  store.set(
    USER_COOKIE,
    JSON.stringify({
      id: body.id,
      name: body.name,
      avatarUrl: body.avatarUrl ?? null,
      role: body.role,
    }),
    {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    },
  );
  return NextResponse.json({ ok: true });
}
