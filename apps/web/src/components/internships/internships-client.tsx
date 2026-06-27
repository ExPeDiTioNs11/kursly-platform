'use client';

import { useCallback, useEffect, useState } from 'react';
import { Clock, Loader2, MapPin, Search, Users, Wifi } from 'lucide-react';
import type { InternshipSummary, Paginated } from '@kursly/shared';
import type { SessionUser } from '@/lib/session';
import { clientApi } from '@/lib/client-api';
import { cn, timeAgo } from '@/lib/utils';
import { InternshipDetailPane } from '@/components/internships/internship-detail-pane';

export function InternshipsClient({ viewer }: { viewer: SessionUser }) {
  const [items, setItems] = useState<InternshipSummary[] | null>(null);
  const [search, setSearch] = useState('');
  const [remote, setRemote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const load = useCallback(async () => {
    setItems(null);
    setError(null);
    try {
      const params = new URLSearchParams({ pageSize: '50' });
      if (search.trim()) params.set('search', search.trim());
      if (remote) params.set('remote', 'true');
      const res = await clientApi.get<Paginated<InternshipSummary>>(`internships?${params}`);
      setItems(res.items);
      setSelectedId(res.items[0]?.id ?? null);
    } catch {
      setError('Staj ilanları yüklenemedi.');
    }
  }, [search, remote]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remote]);

  function adjustCount(id: string, delta: number) {
    setItems((prev) =>
      prev
        ? prev.map((i) =>
            i.id === id ? { ...i, applicantCount: Math.max(0, i.applicantCount + delta) } : i,
          )
        : prev,
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Staj İlanları</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Firmaların yayınladığı staj fırsatlarını keşfet ve başvur.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            load();
          }}
          className="flex flex-1 items-center gap-2 rounded-full border bg-secondary/50 px-3 py-2"
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pozisyon, alan veya anahtar kelime…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
        <label className="flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm">
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => setRemote(e.target.checked)}
            className="accent-indigo-600"
          />
          Sadece uzaktan
        </label>
      </div>

      {error ? (
        <p className="text-muted-foreground">{error}</p>
      ) : !items ? (
        <div className="flex items-center gap-2 py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Yükleniyor…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          Aramana uygun staj ilanı bulunamadı.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(340px,400px)_1fr]">
          {/* List */}
          <div className={cn('space-y-2', mobileOpen && 'hidden lg:block')}>
            {items.map((item) => (
              <ListRow
                key={item.id}
                item={item}
                active={item.id === selectedId}
                onClick={() => {
                  setSelectedId(item.id);
                  setMobileOpen(true);
                }}
              />
            ))}
          </div>

          {/* Detail */}
          <div className={cn(!mobileOpen && 'hidden lg:block')}>
            {selectedId ? (
              <div className="lg:sticky lg:top-20">
                <InternshipDetailPane
                  internshipId={selectedId}
                  viewer={viewer}
                  onBack={() => setMobileOpen(false)}
                  onApplyChange={adjustCount}
                />
              </div>
            ) : (
              <div className="hidden h-full items-center justify-center rounded-xl border border-dashed text-muted-foreground lg:flex">
                Detayını görmek için bir ilan seç
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ListRow({
  item,
  active,
  onClick,
}: {
  item: InternshipSummary;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-xl border p-3 text-left transition hover:bg-secondary/60',
        active && 'border-indigo-500 bg-indigo-500/5 ring-1 ring-indigo-500/20',
      )}
    >
      <div className="flex gap-3">
        <Logo name={item.company.name} avatarUrl={item.company.avatarUrl} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold leading-tight">{item.title}</div>
          <div className="truncate text-sm text-muted-foreground">{item.company.name}</div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {item.isRemote ? (
              <span className="flex items-center gap-1 text-emerald-600">
                <Wifi className="h-3 w-3" />
                Uzaktan
              </span>
            ) : (
              item.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </span>
              )
            )}
            {item.durationMonths && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {item.durationMonths} ay
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {item.applicantCount}
            </span>
            <span>· {timeAgo(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

function Logo({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img src={avatarUrl} alt={name} className="h-11 w-11 shrink-0 rounded-lg object-cover" />
    );
  }
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
