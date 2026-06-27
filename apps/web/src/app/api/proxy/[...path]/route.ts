import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import type { AuthTokens } from '@kursly/shared';
import { AT_COOKIE, RT_COOKIE } from '@/lib/session';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const refreshedCookie = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 60 * 60 * 24 * 7,
};

function callBackend(url: string, method: string, token: string | undefined, body?: string) {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body } : {}),
    cache: 'no-store',
  });
}

/**
 * Same-origin proxy for authenticated backend calls. Attaches the access token
 * from the httpOnly cookie and, on a 401, transparently rotates it using the
 * refresh token before retrying once.
 */
async function handle(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const target = `${API_URL}/api/${path.join('/')}${req.nextUrl.search}`;
  const method = req.method;

  const store = await cookies();
  let accessToken = store.get(AT_COOKIE)?.value;
  const refreshToken = store.get(RT_COOKIE)?.value;

  const body = method === 'GET' || method === 'HEAD' ? undefined : await req.text();

  let backendRes = await callBackend(target, method, accessToken, body);
  let rotated: AuthTokens | null = null;

  if (backendRes.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (refreshRes.ok) {
      rotated = (await refreshRes.json()) as AuthTokens;
      accessToken = rotated.accessToken;
      backendRes = await callBackend(target, method, accessToken, body);
    }
  }

  const status = backendRes.status;
  // 204/304 must not carry a body — constructing one would throw.
  const isEmpty = status === 204 || status === 304;
  const response = isEmpty
    ? new NextResponse(null, { status })
    : new NextResponse(await backendRes.text(), {
        status,
        headers: { 'Content-Type': backendRes.headers.get('Content-Type') ?? 'application/json' },
      });

  if (rotated) {
    response.cookies.set(AT_COOKIE, rotated.accessToken, refreshedCookie);
    response.cookies.set(RT_COOKIE, rotated.refreshToken, refreshedCookie);
  }

  return response;
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
