'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

/** Site footer, hidden on the immersive feed experience. */
export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/feed')) {
    return null;
  }

  return (
    <footer className="border-t bg-secondary/40">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-lg font-bold">
              <GraduationCap className="h-5 w-5 text-primary" />
              Kursly
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Kendi hızında öğren. Alanında uzman eğitmenlerden binlerce video ders, tek platformda.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Keşfet</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/courses" className="hover:text-foreground">
                  Tüm Kurslar
                </Link>
              </li>
              <li>
                <Link href="/#kategoriler" className="hover:text-foreground">
                  Kategoriler
                </Link>
              </li>
              <li>
                <Link href="/#yollar" className="hover:text-foreground">
                  Kariyer Yolları
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Kursly</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#neden-kursly" className="hover:text-foreground">
                  Neden Kursly?
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Giriş Yap
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Eğitmen Ol
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Destek</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/yardim" className="hover:text-foreground">
                  Yardım Merkezi
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="hover:text-foreground">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/gizlilik" className="hover:text-foreground">
                  Gizlilik &amp; Koşullar
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Kursly. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
