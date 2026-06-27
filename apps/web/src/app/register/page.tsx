'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AuthField, AuthShell } from '@/components/auth/auth-shell';

type AccountType = 'STUDENT' | 'INSTRUCTOR' | 'COMPANY';

const ACCOUNT_TYPES: { value: AccountType; label: string; icon: typeof User }[] = [
  { value: 'STUDENT', label: 'Öğrenci', icon: GraduationCap },
  { value: 'INSTRUCTOR', label: 'Eğitmen', icon: Briefcase },
  { value: 'COMPANY', label: 'Firma', icon: Building2 },
];

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı.');
      return;
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (!terms) {
      setError('Devam etmek için kullanım koşullarını kabul etmelisin.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: accountType }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
        const msg = Array.isArray(body.message) ? body.message[0] : body.message;
        setError(
          res.status === 409
            ? 'Bu e-posta zaten kayıtlı. Giriş yapmayı dene.'
            : (msg ?? 'Kayıt oluşturulamadı. Lütfen tekrar dene.'),
        );
        return;
      }
      // Register logs the user in and sets the session cookies on the server.
      setSuccess(true);
      const dest =
        accountType === 'COMPANY' ? '/firma' : accountType === 'INSTRUCTOR' ? '/teach' : '/feed';
      router.push(dest);
      router.refresh();
    } catch {
      setError('Bağlantı hatası. API çalışıyor mu?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      panelTitle="Öğrenmeye bugün başla 🚀"
      panelSubtitle="Ücretsiz hesabını oluştur, binlerce kursa anında eriş."
      bullets={[
        'Binlerce video kursa erişim',
        'Kendi hızında, dilediğin cihazdan öğren',
        'Tamamladığın kurslar için sertifika kazan',
      ]}
    >
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold">Hesap oluştur</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Zaten hesabın var mı?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Giriş yap
          </Link>
        </p>

        {/* Account type selector */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {ACCOUNT_TYPES.map((t) => {
            const Icon = t.icon;
            const active = accountType === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setAccountType(t.value)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition',
                  active
                    ? 'border-indigo-500 bg-indigo-500/10 font-medium text-indigo-600'
                    : 'hover:bg-secondary',
                )}
              >
                <Icon className="h-5 w-5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <AuthField
            id="name"
            label={accountType === 'COMPANY' ? 'Firma adı' : 'Ad Soyad'}
            icon={accountType === 'COMPANY' ? Building2 : User}
            type="text"
            autoComplete={accountType === 'COMPANY' ? 'organization' : 'name'}
            required
            minLength={2}
            placeholder={accountType === 'COMPANY' ? 'Firma adınız' : 'Adın Soyadın'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <div>
            <AuthField
              id="password"
              label="Şifre"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="En az 8 karakter"
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
            {passwordTooShort && (
              <p className="mt-1 text-xs text-amber-600">Şifre en az 8 karakter olmalı.</p>
            )}
          </div>

          <div>
            <AuthField
              id="confirm"
              label="Şifre (tekrar)"
              icon={Lock}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              placeholder="Şifreni tekrar gir"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {mismatch && <p className="mt-1 text-xs text-amber-600">Şifreler eşleşmiyor.</p>}
          </div>

          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input accent-indigo-600"
            />
            <span>
              <span className="font-medium text-foreground">Kullanım koşulları</span> ve{' '}
              <span className="font-medium text-foreground">gizlilik politikasını</span> kabul
              ediyorum.
            </span>
          </label>

          {error && (
            <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
          {success && (
            <p className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Hesabın oluşturuldu, yönlendiriliyorsun…
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md transition hover:brightness-110 disabled:opacity-70"
          >
            {loading ? 'Hesap oluşturuluyor…' : 'Ücretsiz Kaydol'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Kaydolarak öğrenci olarak katılırsın. Eğitmen olmak istersen profilinden yükseltebilirsin.
        </p>
      </div>
    </AuthShell>
  );
}
