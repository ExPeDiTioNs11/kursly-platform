import { cookies } from 'next/headers';
import type { AuthResponse, Role } from '@kursly/shared';

/** Cookie names. Tokens are httpOnly; the profile cookie drives the header UI. */
export const AT_COOKIE = 'kursly_at';
export const RT_COOKIE = 'kursly_rt';
export const USER_COOKIE = 'kursly_user';

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days (matches refresh-token lifetime)

const baseCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};

export interface SessionUser {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
}

/**
 * Persist the token pair + a small profile cookie after login/register.
 * When `remember` is false the cookies are session-scoped (cleared on browser
 * close); otherwise they last 7 days.
 */
export async function setSessionCookies(auth: AuthResponse, remember = true): Promise<void> {
  const store = await cookies();
  const opts = remember ? { ...baseCookieOptions, maxAge: MAX_AGE } : baseCookieOptions;
  store.set(AT_COOKIE, auth.accessToken, opts);
  store.set(RT_COOKIE, auth.refreshToken, opts);
  store.set(
    USER_COOKIE,
    JSON.stringify({
      id: auth.user.id,
      name: auth.user.name,
      avatarUrl: auth.user.avatarUrl,
      role: auth.user.role,
    } satisfies SessionUser),
    opts,
  );
}

export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  for (const name of [AT_COOKIE, RT_COOKIE, USER_COOKIE]) {
    store.delete(name);
  }
}

/** Returns the current user from the profile cookie, or null if signed out. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const raw = store.get(USER_COOKIE)?.value;
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}
