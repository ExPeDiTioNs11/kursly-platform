'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2, Pencil, Plus, Users } from 'lucide-react';
import type { InternshipSummary } from '@kursly/shared';
import { clientApi } from '@/lib/client-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { timeAgo } from '@/lib/utils';

export function CompanyDashboard() {
  const [items, setItems] = useState<InternshipSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientApi
      .get<InternshipSummary[]>('internships/mine')
      .then(setItems)
      .catch(() => setError('İlanlar yüklenemedi.'));
  }, []);

  return (
    <div className="container py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Firma Paneli</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Staj ilanlarını yönet ve başvuruları gör.
          </p>
        </div>
        <Link href="/firma/new">
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110">
            <Plus className="h-4 w-4" />
            Yeni İlan
          </Button>
        </Link>
      </div>

      {error ? (
        <p className="text-muted-foreground">{error}</p>
      ) : !items ? (
        <div className="flex items-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Yükleniyor…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">Henüz staj ilanı yayınlamadın.</p>
          <Link
            href="/firma/new"
            className="mt-4 inline-flex items-center gap-1 text-indigo-600 hover:underline"
          >
            <Plus className="h-4 w-4" />
            İlk ilanını oluştur
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <Link key={i.id} href={`/firma/${i.id}`}>
              <Card className="flex items-center gap-4 p-4 transition hover:shadow-md">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{i.title}</span>
                    <Badge
                      variant="secondary"
                      className={
                        i.status === 'OPEN'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {i.status === 'OPEN' ? 'Açık' : 'Kapalı'}
                    </Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {i.applicantCount} başvuru
                    </span>
                    <span>{timeAgo(i.createdAt)}</span>
                  </div>
                </div>
                <Pencil className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
