'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { MyApplication } from '@kursly/shared';
import { clientApi } from '@/lib/client-api';
import { Card } from '@/components/ui/card';
import { ApplicationStatusBadge } from '@/components/internships/application-status-badge';
import { timeAgo } from '@/lib/utils';

export function MyApplicationsClient() {
  const [items, setItems] = useState<MyApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientApi
      .get<MyApplication[]>('internships/my-applications')
      .then(setItems)
      .catch(() => setError('Başvurular yüklenemedi.'));
  }, []);

  if (error)
    return <div className="container py-16 text-center text-muted-foreground">{error}</div>;
  if (!items)
    return (
      <div className="container flex items-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Yükleniyor…
      </div>
    );

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Başvurularım</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {items.length > 0 ? `${items.length} staj başvurusu` : 'Henüz başvuru yapmadın.'}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">Staj ilanlarına göz at ve başvur.</p>
          <Link
            href="/stajlar"
            className="mt-4 inline-flex items-center gap-1 text-indigo-600 hover:underline"
          >
            Staj ilanları
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Link key={a.id} href={`/stajlar/${a.internship.id}`}>
              <Card className="flex items-center gap-4 p-4 transition hover:shadow-md">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{a.internship.title}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {a.internship.company.name} · {timeAgo(a.createdAt)}
                  </div>
                </div>
                <ApplicationStatusBadge status={a.status} />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
