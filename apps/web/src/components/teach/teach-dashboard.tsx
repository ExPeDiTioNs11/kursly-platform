'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Pencil, Plus } from 'lucide-react';
import type { CourseSummary } from '@kursly/shared';
import { clientApi } from '@/lib/client-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const STATUS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: 'Taslak', className: 'bg-amber-500/10 text-amber-600' },
  PUBLISHED: { label: 'Yayında', className: 'bg-emerald-500/10 text-emerald-600' },
  ARCHIVED: { label: 'Arşiv', className: 'bg-muted text-muted-foreground' },
};

export function TeachDashboard() {
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientApi
      .get<CourseSummary[]>('courses/mine')
      .then(setCourses)
      .catch(() => setError('Kurslar yüklenemedi.'));
  }, []);

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Eğitmen Paneli</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kurslarını oluştur ve yönet.</p>
        </div>
        <Link href="/teach/new">
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110">
            <Plus className="h-4 w-4" />
            Yeni Kurs
          </Button>
        </Link>
      </div>

      {error ? (
        <p className="text-muted-foreground">{error}</p>
      ) : !courses ? (
        <div className="flex items-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Yükleniyor…
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">Henüz kurs oluşturmadın.</p>
          <Link
            href="/teach/new"
            className="mt-4 inline-flex items-center gap-1 text-indigo-600 hover:underline"
          >
            <Plus className="h-4 w-4" />
            İlk kursunu oluştur
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c) => {
            const s = STATUS[c.status] ?? STATUS.DRAFT;
            return (
              <Link key={c.id} href={`/teach/${c.id}`}>
                <Card className="flex items-center gap-4 p-4 transition hover:shadow-md">
                  <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                    {c.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      c.title.charAt(0)
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold">{c.title}</span>
                      <Badge variant="secondary" className={s.className}>
                        {s.label}
                      </Badge>
                      {c.format === 'MINI' && (
                        <Badge variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-600">
                          Mini
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {c.subtitle ?? 'Açıklama yok'}
                    </p>
                  </div>
                  <Pencil className="h-4 w-4 shrink-0 text-muted-foreground" />
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
