'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Loader2, MapPin, Users, Wifi } from 'lucide-react';
import { Role } from '@kursly/shared';
import type { InternshipDetail } from '@kursly/shared';
import type { SessionUser } from '@/lib/session';
import { clientApi } from '@/lib/client-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { timeAgo } from '@/lib/utils';

export function InternshipDetailPane({
  internshipId,
  viewer,
  onBack,
  onApplyChange,
}: {
  internshipId: string;
  viewer: SessionUser;
  /** Shown as a mobile "back to list" button when provided. */
  onBack?: () => void;
  /** Notifies the parent list when the applicant count changes. */
  onApplyChange?: (id: string, delta: number) => void;
}) {
  const toast = useToast();
  const [item, setItem] = useState<InternshipDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setItem(null);
    setError(null);
    setShowForm(false);
    setMessage('');
    clientApi
      .get<InternshipDetail>(`internships/${internshipId}`)
      .then((i) => {
        setItem(i);
        setApplied(i.hasApplied);
      })
      .catch(() => setError('İlan yüklenemedi.'));
  }, [internshipId]);

  async function apply() {
    setBusy(true);
    try {
      await clientApi.post(`internships/${internshipId}/apply`, {
        message: message.trim() || undefined,
      });
      setApplied(true);
      setShowForm(false);
      setItem((p) => (p ? { ...p, applicantCount: p.applicantCount + 1 } : p));
      onApplyChange?.(internshipId, 1);
      toast('Başvurun gönderildi 🎉', 'success');
    } catch (e) {
      toast((e as Error).message ?? 'Başvuru gönderilemedi.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function withdraw() {
    setBusy(true);
    try {
      await clientApi.del(`internships/${internshipId}/apply`);
      setApplied(false);
      setItem((p) => (p ? { ...p, applicantCount: Math.max(0, p.applicantCount - 1) } : p));
      onApplyChange?.(internshipId, -1);
      toast('Başvurun geri çekildi.', 'info');
    } catch {
      toast('İşlem başarısız oldu.', 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">{error}</CardContent>
      </Card>
    );
  }
  if (!item) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Yükleniyor…
        </CardContent>
      </Card>
    );
  }

  const isOwner = item.company.id === viewer.id;
  const isStudent = viewer.role === Role.STUDENT;

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            İlan listesi
          </button>
        )}

        <div className="flex items-center gap-3">
          <CompanyLogo name={item.company.name} avatarUrl={item.company.avatarUrl} />
          <div>
            <Link href={`/u/${item.company.id}`} className="font-medium hover:underline">
              {item.company.name}
            </Link>
            <div className="text-xs text-muted-foreground">
              {timeAgo(item.createdAt)} yayınlandı
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold">{item.title}</h1>

        <div className="flex flex-wrap gap-2">
          {item.field && <Badge variant="secondary">{item.field}</Badge>}
          {item.isRemote ? (
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
              <Wifi className="mr-1 h-3 w-3" />
              Uzaktan
            </Badge>
          ) : (
            item.location && (
              <Badge variant="outline">
                <MapPin className="mr-1 h-3 w-3" />
                {item.location}
              </Badge>
            )
          )}
          {item.durationMonths && (
            <Badge variant="outline">
              <Clock className="mr-1 h-3 w-3" />
              {item.durationMonths} ay
            </Badge>
          )}
          <Badge variant="outline">
            <Users className="mr-1 h-3 w-3" />
            {item.applicantCount} başvuru
          </Badge>
        </div>

        {/* Action area — pinned near the top, like LinkedIn */}
        <div className="rounded-xl border bg-secondary/30 p-4">
          {isOwner ? (
            <Link href={`/firma/${item.id}`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Users className="h-4 w-4" />
                Başvuranları yönet
              </Button>
            </Link>
          ) : !isStudent ? (
            <p className="text-sm text-muted-foreground">
              Staj başvuruları yalnızca öğrenci hesaplarıyla yapılabilir.
            </p>
          ) : applied ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                Başvurun alındı
              </span>
              <Button variant="ghost" size="sm" onClick={withdraw} disabled={busy}>
                Geri çek
              </Button>
            </div>
          ) : showForm ? (
            <div className="space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Firmaya kısa bir not (opsiyonel)…"
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="flex gap-2">
                <Button
                  onClick={apply}
                  disabled={busy}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110"
                >
                  {busy ? 'Gönderiliyor…' : 'Başvuruyu Gönder'}
                </Button>
                <Button variant="ghost" onClick={() => setShowForm(false)}>
                  Vazgeç
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 sm:w-auto"
            >
              Bu Staja Başvur
            </Button>
          )}
        </div>

        <div>
          <h2 className="mb-2 font-semibold">İlan açıklaması</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CompanyLogo({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={name} className="h-12 w-12 rounded-lg object-cover" />;
  }
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
