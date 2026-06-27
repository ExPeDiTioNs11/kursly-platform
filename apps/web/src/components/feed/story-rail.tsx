'use client';

import { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import type { StoryGroup } from '@kursly/shared';
import type { SessionUser } from '@/lib/session';
import { clientApi } from '@/lib/client-api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { StoryViewer } from '@/components/feed/story-viewer';

export function StoryRail({
  groups,
  currentUser,
}: {
  groups: StoryGroup[];
  currentUser: SessionUser;
}) {
  const [rail, setRail] = useState<StoryGroup[]>(groups);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  function isUnseen(group: StoryGroup) {
    return group.hasUnseen && !group.stories.every((s) => viewedIds.has(s.id));
  }

  function handleViewed(id: string) {
    setViewedIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    clientApi.post(`stories/${id}/view`).catch(() => undefined);
  }

  async function refreshStories() {
    try {
      const fresh = await clientApi.get<StoryGroup[]>('stories');
      setRail(fresh);
    } catch {
      // keep current rail
    }
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {/* Add-story affordance */}
        <button
          onClick={() => setComposerOpen(true)}
          className="flex w-16 shrink-0 flex-col items-center gap-1.5"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 text-muted-foreground transition hover:border-indigo-500 hover:text-indigo-500">
            <Plus className="h-6 w-6" />
          </span>
          <span className="w-full truncate text-center text-xs text-muted-foreground">
            Story ekle
          </span>
        </button>

        {rail.map((group, index) => {
          const unseen = isUnseen(group);
          return (
            <button
              key={group.author.id}
              onClick={() => setOpenIdx(index)}
              className="flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  'rounded-full p-[2.5px]',
                  unseen
                    ? 'bg-gradient-to-tr from-indigo-500 via-fuchsia-500 to-amber-400'
                    : 'bg-muted',
                )}
              >
                <span className="block rounded-full border-2 border-background">
                  <Avatar name={group.author.name} avatarUrl={group.author.avatarUrl} />
                </span>
              </span>
              <span className="w-full truncate text-center text-xs text-muted-foreground">
                {group.author.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {openIdx !== null && (
        <StoryViewer
          groups={rail}
          startGroup={openIdx}
          onViewed={handleViewed}
          onClose={() => setOpenIdx(null)}
        />
      )}

      {composerOpen && (
        <StoryComposer
          user={currentUser}
          onClose={() => setComposerOpen(false)}
          onCreated={refreshStories}
        />
      )}
    </>
  );
}

/* ─────────────  Story composer modal  ───────────── */

function StoryComposer({
  user,
  onClose,
  onCreated,
}: {
  user: SessionUser;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const toast = useToast();
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sending, setSending] = useState(false);

  async function submit() {
    if (sending) return;
    setSending(true);
    // No upload yet: fall back to a generated cover when no URL is given.
    const mediaUrl = imageUrl.trim() || `https://picsum.photos/seed/story-${Date.now()}/720/1280`;
    try {
      await clientApi.post('stories', { mediaUrl, caption: caption.trim() || undefined });
      await onCreated();
      toast('Story paylaşıldı.', 'success');
      onClose();
    } catch {
      toast('Story paylaşılamadı.', 'error');
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <button
        className="fixed inset-0 cursor-default"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Story ekle</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
          <span>{user.name}</span>
        </div>

        <label className="mb-1 block text-sm font-medium">Görsel URL’si (opsiyonel)</label>
        <input
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://… (boş bırakırsan rastgele kapak)"
          className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />

        <label className="mb-1 block text-sm font-medium">Açıklama (opsiyonel)</label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          placeholder="Bir şeyler yaz…"
          className="mb-4 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            onClick={submit}
            disabled={sending}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Paylaşılıyor…
              </>
            ) : (
              'Paylaş'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={name} className="h-[52px] w-[52px] rounded-full object-cover" />
    );
  }
  return (
    <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
