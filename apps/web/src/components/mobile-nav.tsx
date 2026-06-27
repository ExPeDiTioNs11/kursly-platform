'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Search, X } from 'lucide-react';
import type { Role } from '@kursly/shared';
import { Button } from '@/components/ui/button';

export function MobileNav({
  session,
  navLinks,
}: {
  session: { id: string; role: Role } | null;
  navLinks: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary"
        aria-label="Menü"
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          <button
            className="fixed inset-0 top-16 z-40 cursor-default bg-black/20"
            aria-hidden
            onClick={close}
          />
          <div className="fixed inset-x-0 top-16 z-50 border-b bg-background p-4 shadow-lg">
            {/* Search */}
            <form
              action="/courses"
              onSubmit={close}
              className="mb-3 flex items-center gap-2 rounded-full border bg-secondary/50 px-3 py-2"
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                type="text"
                name="search"
                placeholder="Kurs ara…"
                aria-label="Kurs ara"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </form>

            {/* Nav links */}
            <nav className="flex flex-col">
              {session && (
                <Link
                  href="/feed"
                  onClick={close}
                  className="rounded-lg px-3 py-2.5 font-medium text-indigo-600 hover:bg-secondary"
                >
                  Akışım
                </Link>
              )}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {!session && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3">
                <Link href="/login" onClick={close}>
                  <Button variant="outline" className="w-full">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/register" onClick={close}>
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110">
                    Kaydol
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
