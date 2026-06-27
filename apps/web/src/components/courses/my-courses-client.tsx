'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { EnrollmentItem } from '@kursly/shared';
import { clientApi } from '@/lib/client-api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: 'Başlangıç',
  INTERMEDIATE: 'Orta',
  ADVANCED: 'İleri',
};

export function MyCoursesClient() {
  const [items, setItems] = useState<EnrollmentItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clientApi
      .get<EnrollmentItem[]>('enrollments')
      .then(setItems)
      .catch(() => setError('Kurslarımız yüklenemedi.'));
  }, []);

  if (error) {
    return <div className="container py-16 text-center text-muted-foreground">{error}</div>;
  }

  if (!items) {
    return (
      <div className="container flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Kurslarım</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {items.length > 0
            ? `${items.length} kursa kayıtlısın`
            : 'Henüz bir kursa kayıtlı değilsin.'}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">Keşfet sayfasından ilgini çeken bir kursa kaydol.</p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-1 text-indigo-600 hover:underline"
          >
            Kursları keşfet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <Link key={e.id} href={`/courses/${e.course.slug}`} className="group block">
              <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {e.course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.course.thumbnailUrl}
                      alt={e.course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-4xl font-bold text-white/90">
                      {e.course.title.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {LEVEL_LABEL[e.course.level] ?? e.course.level}
                    </Badge>
                    {e.course.format === 'MINI' && (
                      <Badge className="bg-fuchsia-500/10 text-fuchsia-600">Mini</Badge>
                    )}
                  </div>
                  <h3 className="line-clamp-2 font-semibold">{e.course.title}</h3>
                  <p className="text-sm text-muted-foreground">{e.course.instructor.name}</p>
                  <span className="inline-flex items-center gap-1 pt-1 text-sm font-medium text-indigo-600">
                    Derslere git
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
