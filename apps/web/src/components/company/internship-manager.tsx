'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2, Trash2, X } from 'lucide-react';
import type { ApplicationStatus, InternshipApplicant, InternshipDetail } from '@kursly/shared';
import { clientApi } from '@/lib/client-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApplicationStatusBadge } from '@/components/internships/application-status-badge';
import { useToast } from '@/components/ui/toast';
import { timeAgo } from '@/lib/utils';

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

export function InternshipManager({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [item, setItem] = useState<InternshipDetail | null>(null);
  const [applicants, setApplicants] = useState<InternshipApplicant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [field, setField] = useState('');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [durationMonths, setDurationMonths] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [detail, apps] = await Promise.all([
          clientApi.get<InternshipDetail>(`internships/${id}`),
          clientApi.get<InternshipApplicant[]>(`internships/${id}/applications`).catch(() => []),
        ]);
        setItem(detail);
        setApplicants(apps);
        setTitle(detail.title);
        setDescription(detail.description);
        setField(detail.field ?? '');
        setLocation(detail.location ?? '');
        setIsRemote(detail.isRemote);
        setDurationMonths(detail.durationMonths ? String(detail.durationMonths) : '');
        setStatus(detail.status);
      } catch {
        setError('İlan bulunamadı veya erişim yok.');
      }
    })();
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      await clientApi.patch(`internships/${id}`, {
        title: title.trim(),
        description: description.trim(),
        field: field.trim() || undefined,
        location: location.trim() || undefined,
        isRemote,
        durationMonths: durationMonths ? Number(durationMonths) : undefined,
        status,
      });
      toast('İlan güncellendi.', 'success');
    } catch (e) {
      toast((e as Error).message ?? 'Kaydedilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function setApplicationStatus(appId: string, next: ApplicationStatus) {
    const prev = applicants;
    setApplicants((a) => a.map((x) => (x.id === appId ? { ...x, status: next } : x)));
    try {
      await clientApi.patch(`internships/applications/${appId}`, { status: next });
      toast(next === 'ACCEPTED' ? 'Başvuru kabul edildi.' : 'Başvuru reddedildi.', 'success');
    } catch {
      setApplicants(prev);
      toast('İşlem başarısız oldu.', 'error');
    }
  }

  async function remove() {
    try {
      await clientApi.del(`internships/${id}`);
      toast('İlan silindi.', 'success');
      router.push('/firma');
    } catch {
      toast('Silinemedi.', 'error');
    }
  }

  if (error)
    return <div className="container py-16 text-center text-muted-foreground">{error}</div>;
  if (!item)
    return (
      <div className="container flex items-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Yükleniyor…
      </div>
    );

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <Link
        href="/firma"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Panele dön
      </Link>

      {/* Edit */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">İlan bilgileri</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Durum:</span>
              <button
                onClick={() => setStatus(status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                className="rounded-full"
                aria-label="Durumu değiştir"
              >
                <Badge
                  variant="secondary"
                  className={
                    status === 'OPEN'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-muted text-muted-foreground'
                  }
                >
                  {status === 'OPEN' ? 'Açık' : 'Kapalı'} · değiştir
                </Badge>
              </button>
            </div>
          </div>
          <Labeled label="Pozisyon başlığı">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </Labeled>
          <Labeled label="Açıklama">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className={`${inputCls} resize-none`}
            />
          </Labeled>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Alan">
              <input
                value={field}
                onChange={(e) => setField(e.target.value)}
                className={inputCls}
              />
            </Labeled>
            <Labeled label="Konum">
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isRemote}
                className={inputCls}
              />
            </Labeled>
          </div>
          <div className="grid items-end gap-4 sm:grid-cols-2">
            <Labeled label="Süre (ay)">
              <input
                value={durationMonths}
                onChange={(e) => setDurationMonths(e.target.value)}
                type="number"
                min={1}
                max={24}
                className={inputCls}
              />
            </Labeled>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <input
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
                className="accent-indigo-600"
              />
              Uzaktan (remote)
            </label>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={save}
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applicants */}
      <Card>
        <CardContent className="space-y-3 pt-6">
          <h2 className="font-semibold">Başvuranlar ({applicants.length})</h2>
          {applicants.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz başvuru yok.</p>
          ) : (
            applicants.map((a) => (
              <div key={a.id} className="flex flex-wrap items-start gap-3 rounded-xl border p-3">
                <Avatar name={a.applicant.name} avatarUrl={a.applicant.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/u/${a.applicant.id}`} className="font-medium hover:underline">
                      {a.applicant.name}
                    </Link>
                    <ApplicationStatusBadge status={a.status} />
                    <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                  </div>
                  {a.message && <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>}
                </div>
                {a.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setApplicationStatus(a.id, 'ACCEPTED' as ApplicationStatus)}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Check className="h-4 w-4" />
                      Kabul
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setApplicationStatus(a.id, 'REJECTED' as ApplicationStatus)}
                    >
                      <X className="h-4 w-4" />
                      Reddet
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Danger */}
      <Card className="border-destructive/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div>
            <h2 className="font-semibold text-destructive">İlanı sil</h2>
            <p className="text-sm text-muted-foreground">Bu işlem geri alınamaz.</p>
          </div>
          <DeleteButton onConfirm={remove} />
        </CardContent>
      </Card>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img src={avatarUrl} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  if (!confirming) {
    return (
      <Button
        variant="outline"
        className="border-destructive/40 text-destructive"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="h-4 w-4" />
        İlanı sil
      </Button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Emin misin?</span>
      <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
        Vazgeç
      </Button>
      <Button
        size="sm"
        disabled={busy}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={async () => {
          setBusy(true);
          await onConfirm();
        }}
      >
        {busy ? 'Siliniyor…' : 'Evet, sil'}
      </Button>
    </div>
  );
}
