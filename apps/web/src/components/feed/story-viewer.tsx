'use client';

import { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { StoryGroup } from '@kursly/shared';
import { timeAgo } from '@/lib/utils';

const DURATION = 5000; // ms per story

export function StoryViewer({
  groups,
  startGroup,
  onViewed,
  onClose,
}: {
  groups: StoryGroup[];
  startGroup: number;
  onViewed: (storyId: string) => void;
  onClose: () => void;
}) {
  const [groupIdx, setGroupIdx] = useState(startGroup);
  const [storyIdx, setStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  const group = groups[groupIdx];
  const story = group?.stories[storyIdx];

  const advance = useCallback(() => {
    setProgress(0);
    if (storyIdx < group.stories.length - 1) {
      setStoryIdx(storyIdx + 1);
    } else if (groupIdx < groups.length - 1) {
      setGroupIdx(groupIdx + 1);
      setStoryIdx(0);
    } else {
      onClose();
    }
  }, [storyIdx, groupIdx, group, groups, onClose]);

  const back = useCallback(() => {
    setProgress(0);
    if (storyIdx > 0) {
      setStoryIdx(storyIdx - 1);
    } else if (groupIdx > 0) {
      const pg = groupIdx - 1;
      setGroupIdx(pg);
      setStoryIdx(groups[pg].stories.length - 1);
    }
  }, [storyIdx, groupIdx, groups]);

  // Mark viewed + drive the progress bar for the current story.
  useEffect(() => {
    if (!story) return;
    onViewed(story.id);
    setProgress(0);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(((now - start) / DURATION) * 100, 100);
      setProgress(p);
      if (p >= 100) {
        advance();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIdx, storyIdx]);

  // Keyboard controls + lock background scroll.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') advance();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [advance, back, onClose]);

  if (!group || !story) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <button
        onClick={onClose}
        aria-label="Kapat"
        className="absolute right-4 top-4 z-20 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative flex h-full max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-none sm:rounded-2xl">
        {/* Progress bars */}
        <div className="absolute inset-x-0 top-0 z-20 flex gap-1 p-3">
          {group.stories.map((st, i) => (
            <div key={st.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: i < storyIdx ? '100%' : i === storyIdx ? `${progress}%` : '0%',
                }}
              />
            </div>
          ))}
        </div>

        {/* Author header */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-3 px-4 pb-6 pt-7">
          <Avatar name={group.author.name} avatarUrl={group.author.avatarUrl} />
          <div className="text-white">
            <div className="text-sm font-semibold drop-shadow">{group.author.name}</div>
            <div className="text-xs text-white/80 drop-shadow">{timeAgo(story.createdAt)}</div>
          </div>
        </div>

        {/* Media */}
        <div className="relative flex flex-1 items-center justify-center bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={story.mediaUrl} alt="" className="max-h-full max-w-full object-contain" />

          {/* Tap zones */}
          <button
            aria-label="Önceki"
            onClick={back}
            className="absolute inset-y-0 left-0 w-1/3 cursor-default focus:outline-none"
          />
          <button
            aria-label="Sonraki"
            onClick={advance}
            className="absolute inset-y-0 right-0 w-2/3 cursor-default focus:outline-none"
          />
        </div>

        {/* Caption */}
        {story.caption && (
          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-5 pt-12">
            <p className="text-center text-sm text-white drop-shadow">{story.caption}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="h-9 w-9 rounded-full object-cover ring-2 ring-white/60"
      />
    );
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white ring-2 ring-white/60">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
