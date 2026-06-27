import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { GraduationCap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/user-menu';
import { MobileNav } from '@/components/mobile-nav';
import { SiteFooter } from '@/components/site-footer';
import { ToastProvider } from '@/components/ui/toast';
import { getSession } from '@/lib/session';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kursly — Kendi hızında, her şeyi öğren',
  description:
    'Alanında uzman eğitmenlerden video kurslarla yazılım, tasarım, pazarlama ve daha fazlasını öğren. Türkiye’nin online eğitim platformu Kursly.',
};

const navLinks = [
  { href: '/courses', label: 'Kurslar' },
  { href: '/stajlar', label: 'Stajlar' },
  { href: '/#kategoriler', label: 'Kategoriler' },
  { href: '/#yollar', label: 'Kariyer Yolları' },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="tr" className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-background font-sans antialiased">
        <ToastProvider>
          <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center gap-4">
              <Link
                href={session ? '/feed' : '/'}
                className="flex shrink-0 items-center gap-2 text-xl font-bold"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Kursly
                </span>
              </Link>

              {/* Kalıcı arama — her sayfada çalışır */}
              <form
                action="/courses"
                className="hidden flex-1 items-center gap-2 rounded-full border bg-secondary/50 px-3 py-1.5 transition focus-within:bg-background focus-within:ring-2 focus-within:ring-indigo-500/30 md:flex lg:max-w-sm"
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

              <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
                {session && (
                  <Link
                    href="/feed"
                    className="rounded-full px-3 py-2 font-semibold text-indigo-600 transition-colors hover:bg-secondary"
                  >
                    Akışım
                  </Link>
                )}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
                {session ? (
                  <UserMenu user={session} />
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Giriş Yap
                      </Button>
                    </Link>
                    <Link href="/register" className="hidden sm:block">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm transition hover:brightness-110"
                      >
                        Ücretsiz Kaydol
                      </Button>
                    </Link>
                  </>
                )}
                <MobileNav session={session} navLinks={navLinks} />
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
