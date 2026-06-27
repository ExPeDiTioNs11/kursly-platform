'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { Category, CourseSummary } from '@kursly/shared';
import { clientApi } from '@/lib/client-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { slugify } from '@/lib/utils';

export function CreateCourseForm() {
  const router = useRouter();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [format, setFormat] = useState('FULL');
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    clientApi
      .get<Category[]>('categories')
      .then(setCategories)
      .catch(() => undefined);
  }, []);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (title.trim().length < 3) {
      setError('Başlık en az 3 karakter olmalı.');
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(effectiveSlug)) {
      setError('Geçersiz URL adı (slug). Küçük harf, rakam ve tire kullan.');
      return;
    }
    setSaving(true);
    try {
      const created = await clientApi.post<CourseSummary>('courses', {
        title: title.trim(),
        slug: effectiveSlug,
        subtitle: subtitle.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        description: description.trim() || undefined,
        level,
        format,
        categoryId: categoryId || undefined,
      });
      toast('Kurs oluşturuldu.', 'success');
      router.push(`/teach/${created.id}`);
    } catch (err) {
      const msg = (err as Error).message ?? 'Kurs oluşturulamadı.';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container max-w-2xl py-10">
      <Link
        href="/teach"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Panele dön
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Yeni kurs oluştur</h1>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            <Field label="Başlık">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn. React ile Modern Web Geliştirme"
                className={inputCls}
                required
              />
            </Field>

            <Field label="URL adı (slug)" hint="Boş bırakırsan başlıktan otomatik oluşur.">
              <input
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
                placeholder="react-ile-modern-web"
                className={inputCls}
              />
            </Field>

            <Field label="Alt başlık">
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Kısa bir tanıtım cümlesi"
                className={inputCls}
              />
            </Field>

            <Field label="Kapak görseli URL’si" hint="Boş bırakırsan gradient kapak gösterilir.">
              <input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://…"
                className={inputCls}
              />
            </Field>

            <Field label="Açıklama">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Kurs içeriğini anlat…"
                className={`${inputCls} resize-none`}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Seviye">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className={inputCls}
                >
                  <option value="BEGINNER">Başlangıç</option>
                  <option value="INTERMEDIATE">Orta</option>
                  <option value="ADVANCED">İleri</option>
                </select>
              </Field>
              <Field label="Tür">
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className={inputCls}
                >
                  <option value="FULL">Normal</option>
                  <option value="MINI">Mini</option>
                </select>
              </Field>
              <Field label="Kategori">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={inputCls}
                >
                  <option value="">Seçilmedi</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {error && (
              <p className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/teach">
                <Button type="button" variant="ghost">
                  Vazgeç
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
              >
                {saving ? 'Oluşturuluyor…' : 'Oluştur ve Devam Et'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
