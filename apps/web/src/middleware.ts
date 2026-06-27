import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Guards the logged-in area: redirect to /login when no session cookie. */
export function middleware(req: NextRequest) {
  const hasSession = Boolean(req.cookies.get('kursly_at')?.value);
  if (!hasSession) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/feed/:path*',
    '/my-courses/:path*',
    '/teach/:path*',
    '/stajlar/:path*',
    '/firma/:path*',
    '/basvurularim/:path*',
  ],
};
