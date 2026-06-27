'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { SessionUser } from '@/lib/session';
import { InternshipDetailPane } from '@/components/internships/internship-detail-pane';

export function InternshipDetailClient({ id, viewer }: { id: string; viewer: SessionUser }) {
  return (
    <div className="container max-w-3xl py-10">
      <Link
        href="/stajlar"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Tüm ilanlar
      </Link>
      <InternshipDetailPane internshipId={id} viewer={viewer} />
    </div>
  );
}
