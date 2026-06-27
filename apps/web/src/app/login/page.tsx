'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthField, AuthShell } from '@/components/auth/auth-shell';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });
      if (!res.ok) {
        setError('E-posta veya şifre hatalı. Lütfen tekrar dene.');
        return;
      }
      setSuccess(true);
      const next = new URLSearchParams(window.location.search).get('next') || '/feed';
      router.push(next);
      router.refresh();
    } catch {
      setError('Bağlantı hatası. API çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail('student@kursly.dev');
    setPassword('Password123!');
  }

  return (
    <AuthShell
      panelTitle="Tekrar hoş geldin 👋"
      panelSubtitle="Kaldığın yerden devam et ve öğrenme hedeflerine ulaş."
      bullets={[
        'Tüm kurslarına tek yerden eriş',
        'İlerlemen otomatik kaydedilir',
        'Yeni içerikler ve önerilerden haberdar ol',
      ]}
    >
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold">Giriş yap</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hesabın yok mu?{' '}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">
            Hemen kaydol
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <AuthField
            id="email"
            label="E-posta"
            icon={Mail}
            type="email"
            autoComplete="email"
            required
            placeholder="ornek@eposta.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AuthField
            id="password"
            label="Şifre"
            icon={Lock}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />

          <div className="flex items-center text-sm">
            <label className="flex items-center gap-2 text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-input accent-indigo-600"
              />
              Beni hatırla
            </label>
          </div>

          {error && (
            <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          {success && (
            <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Giriş başarılı, yönlendiriliyorsun…
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md transition hover:brightness-110 disabled:opacity-70"
          >
            {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </Button>
        </form>

        <button
          type="button"
          onClick={fillDemo}
          className="mt-6 w-full rounded-lg border border-dashed bg-secondary/40 px-3 py-2.5 text-center text-xs text-muted-foreground transition hover:bg-secondary"
        >
          Demo hesabıyla dene:{' '}
          <span className="font-medium text-foreground">student@kursly.dev</span> · doldurmak için
          tıkla
        </button>
      </div>
    </AuthShell>
  );
}
