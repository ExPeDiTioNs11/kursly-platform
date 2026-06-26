import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kursly — Learn anything, on your schedule',
  description: 'Online video courses taught by industry experts.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Kursly
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Courses
              </Link>
              <Link href="/login" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Link>
            </nav>
          </div>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="border-t py-6">
          <div className="container text-sm text-muted-foreground">
            © {new Date().getFullYear()} Kursly. Built with NestJS &amp; Next.js.
          </div>
        </footer>
      </body>
    </html>
  );
}
