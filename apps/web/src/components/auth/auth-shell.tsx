import Link from 'next/link';
import { Check, GraduationCap } from 'lucide-react';

/**
 * Two-pane auth layout: a decorative gradient brand panel (hidden on small
 * screens) beside the form. Shared by the login & register pages.
 */
export function AuthShell({
  panelTitle,
  panelSubtitle,
  bullets,
  children,
}: {
  panelTitle: string;
  panelSubtitle: string;
  bullets: string[];
  children: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Dekoratif arka plan */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-0 h-72 w-72 animate-aurora rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 animate-float-slow rounded-full bg-fuchsia-500/15 blur-3xl" />
      </div>
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-50" />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-indigo-500/10 md:grid-cols-2">
        {/* Marka paneli */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-10 text-white md:flex">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 animate-float rounded-full bg-white/10 blur-2xl"
          />
          <Link href="/" className="relative flex items-center gap-2 text-xl font-bold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
              <GraduationCap className="h-5 w-5" />
            </span>
            Kursly
          </Link>

          <div className="relative">
            <h2 className="text-3xl font-bold leading-tight">{panelTitle}</h2>
            <p className="mt-3 text-white/85">{panelSubtitle}</p>
            <ul className="mt-8 space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <p className="relative text-sm text-white/70">
            “Kursly ile öğrenmek hiç bu kadar kolay olmamıştı.”
          </p>
        </aside>

        {/* Form alanı */}
        <div className="p-8 sm:p-10">{children}</div>
      </div>
    </section>
  );
}

/** Styled input with a leading icon, used across auth forms. */
export function AuthField({
  id,
  label,
  icon: Icon,
  trailing,
  ...props
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  trailing?: React.ReactNode;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id={id}
          className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          {...props}
        />
        {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>
    </div>
  );
}
