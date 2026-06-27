'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Briefcase,
  Building2,
  ChevronDown,
  GraduationCap,
  LayoutGrid,
  LogOut,
  User,
} from 'lucide-react';
import { Role } from '@kursly/shared';

const roleLabel: Record<Role, string> = {
  [Role.STUDENT]: 'Öğrenci',
  [Role.INSTRUCTOR]: 'Eğitmen',
  [Role.COMPANY]: 'Firma',
  [Role.ADMIN]: 'Yönetici',
};

export function UserMenu({
  user,
}: {
  user: { id: string; name: string; avatarUrl: string | null; role: Role };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    setOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border bg-background py-1 pl-1 pr-2 text-sm transition hover:bg-secondary"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={user.name} avatarUrl={user.avatarUrl} />
        <span className="hidden max-w-[8rem] truncate font-medium sm:block">{user.name}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 z-40 cursor-default"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border bg-card shadow-xl">
            <div className="flex items-center gap-3 border-b p-3">
              <Avatar name={user.name} avatarUrl={user.avatarUrl} />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{user.name}</div>
                <div className="text-xs text-muted-foreground">{roleLabel[user.role]}</div>
              </div>
            </div>
            <div className="p-1">
              <Link
                href={`/u/${user.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Profilim
              </Link>
              <Link
                href="/feed"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary"
              >
                <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                Akışım
              </Link>
              <Link
                href="/my-courses"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary"
              >
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                Kurslarım
              </Link>
              {user.role === Role.STUDENT && (
                <Link
                  href="/basvurularim"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary"
                >
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Başvurularım
                </Link>
              )}
              {(user.role === Role.INSTRUCTOR || user.role === Role.ADMIN) && (
                <Link
                  href="/teach"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary"
                >
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  Eğitmen Paneli
                </Link>
              )}
              {(user.role === Role.COMPANY || user.role === Role.ADMIN) && (
                <Link
                  href="/firma"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary"
                >
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  Firma Paneli
                </Link>
              )}
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={name} className="h-8 w-8 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
