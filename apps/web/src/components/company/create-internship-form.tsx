'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { InternshipSummary } from '@kursly/shared';
import { clientApi } from '@/lib/client-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

export function CreateInternshipForm() {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [field, setField] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [durationMonths, setDurationMonths] = useState('3');
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3 || description.trim().length < 10) {
      toast('Başlık ve açıklamayı doldur (açıklama en az 10 karakter).', 'error');
      return;
    }
    setSaving(true);
    try {
      const created = await clientApi.post<InternshipSummary>('internships', {
        title: title.trim(),
        description: description.trim(),
        field: field.trim() || undefined,
        location: location.trim() || undefined,
        isRemote,
        durationMonths: durationMonths ? Number(durationMonths) : undefined,
      });
      toast('Staj ilanı yayınlandı.', 'success');
      router.push(`/firma/${created.id}`);
    } catch (e) {
      toast((e as Error).message ?? 'İlan oluşturulamadı.', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Link
        href="/firma"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Panele dön
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Yeni staj ilanı</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Pozisyon başlığı">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn. Frontend Geliştirme Stajyeri"
                className={inputCls}
                required
              />
            </Field>
            <Field label="Açıklama">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Stajın içeriği, beklentiler, aranan nitelikler…"
                className={`${inputCls} resize-none`}
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Alan">
                <input
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  placeholder="Yazılım Geliştirme"
                  className={inputCls}
                />
              </Field>
              <Field label="Konum">
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="İstanbul"
                  className={inputCls}
                  disabled={isRemote}
                />
              </Field>
            </div>
            <div className="grid items-end gap-4 sm:grid-cols-2">
              <Field label="Süre (ay)">
                <input
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(e.target.value)}
                  type="number"
                  min={1}
                  max={24}
                  className={inputCls}
                />
              </Field>
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  className="accent-indigo-600"
                />
                Uzaktan (remote) staj
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/firma">
                <Button type="button" variant="ghost">
                  Vazgeç
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
              >
                {saving ? 'Yayınlanıyor…' : 'İlanı Yayınla'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
