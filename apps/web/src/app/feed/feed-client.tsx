'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ImagePlus, Loader2, Sparkles } from 'lucide-react';
import type { CourseSummary, FeedResponse, Paginated, Post, SocialAuthor } from '@kursly/shared';
import type { SessionUser } from '@/lib/session';
import { clientApi } from '@/lib/client-api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { StoryRail } from '@/components/feed/story-rail';
import { PostCard } from '@/components/feed/post-card';

const PAGE_SIZE = 10;

export function FeedClient({ user }: { user: SessionUser }) {
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'following' | 'explore'>('following');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadPosts = useCallback(
    async (which: 'following' | 'explore', pageNum: number, append: boolean) => {
      const res = await clientApi.get<Paginated<Post>>(
        `posts?following=${which === 'following'}&page=${pageNum}&pageSize=${PAGE_SIZE}`,
      );
      setPosts((prev) => {
        if (!append) return res.items;
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...res.items.filter((p) => !seen.has(p.id))];
      });
      setPage(pageNum);
      setHasMore(pageNum < res.totalPages);
    },
    [],
  );

  useEffect(() => {
    (async () => {
      try {
        const [data, following] = await Promise.all([
          clientApi.get<FeedResponse>('feed'),
          clientApi.get<SocialAuthor[]>('follows/following').catch(() => [] as SocialAuthor[]),
        ]);
        setFeed(data);
        const ids = new Set(following.map((u) => u.id));
        setFollowingIds(ids);
        const initial = ids.size > 0 ? 'following' : 'explore';
        setTab(initial);
        await loadPosts(initial, 1, false);
      } catch {
        setError('Akış yüklenemedi. Lütfen tekrar dene.');
      }
    })();
  }, [loadPosts]);

  function changeTab(which: 'following' | 'explore') {
    if (which === tab) return;
    setTab(which);
    setPosts([]);
    setHasMore(false);
    loadPosts(which, 1, false).catch(() => undefined);
  }

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await loadPosts(tab, page + 1, true);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore, tab, loadPosts]);

  // Infinite scroll: load the next page when the sentinel scrolls into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: '300px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  function toggleFollow(authorId: string) {
    const currently = followingIds.has(authorId);
    setFollowingIds((prev) => {
      const next = new Set(prev);
      if (currently) next.delete(authorId);
      else next.add(authorId);
      return next;
    });
    const call = currently
      ? clientApi.del(`follows/${authorId}`)
      : clientApi.post(`follows/${authorId}`);
    call.catch(() => {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (currently) next.add(authorId);
        else next.delete(authorId);
        return next;
      });
    });
  }

  if (error) {
    return <div className="container py-16 text-center text-muted-foreground">{error}</div>;
  }

  if (!feed) {
    return (
      <div className="container flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Akışın yükleniyor…
      </div>
    );
  }

  return (
    <div className="container grid gap-8 py-8 lg:grid-cols-3">
      {/* Main column */}
      <div className="space-y-6 lg:col-span-2">
        <div>
          <h1 className="text-2xl font-bold">Merhaba, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-muted-foreground">Bugün ne öğrenmek istersin?</p>
        </div>

        <Card className="p-4">
          <StoryRail groups={feed.stories} currentUser={user} />
        </Card>

        <Composer user={user} onCreated={(p) => setPosts((prev) => [p, ...prev])} />

        {/* Feed tabs */}
        <div className="flex gap-1 rounded-xl border bg-secondary/40 p-1 text-sm">
          <button
            onClick={() => changeTab('following')}
            className={`flex-1 rounded-lg px-3 py-2 font-medium transition ${
              tab === 'following'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Takip ettiklerin
          </button>
          <button
            onClick={() => changeTab('explore')}
            className={`flex-1 rounded-lg px-3 py-2 font-medium transition ${
              tab === 'explore'
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Keşfet
          </button>
        </div>

        {posts.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {tab === 'following' ? (
              <>
                Takip ettiğin kişilerin paylaşımları burada görünür.{' '}
                <button
                  onClick={() => changeTab('explore')}
                  className="font-medium text-indigo-600 hover:underline"
                >
                  Keşfet’e göz at
                </button>{' '}
                ve yeni kişiler keşfet.
              </>
            ) : (
              'Henüz paylaşım yok. İlk paylaşımı sen yap!'
            )}
          </Card>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
                isFollowing={followingIds.has(post.author.id)}
                onToggleFollow={toggleFollow}
                onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
              />
            ))}
          </div>
        )}

        {/* Infinite-scroll sentinel */}
        <div ref={sentinelRef} className="h-1" />
        {loadingMore && (
          <div className="flex justify-center py-4 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="py-2 text-center text-sm text-muted-foreground">Akışın sonuna geldin 🎉</p>
        )}
      </div>

      {/* Sidebar — stays pinned while the feed scrolls */}
      <aside>
        <div className="space-y-8 lg:sticky lg:top-20">
          <CourseRail
            title="Mini eğitimler"
            eyebrow="Hızlı öğren"
            courses={feed.miniCourses}
            badge="MINI"
          />
          <CourseRail title="Sana önerilenler" eyebrow="Keşfet" courses={feed.recommendedCourses} />
        </div>
      </aside>
    </div>
  );
}

/* ─────────────  Composer  ───────────── */

function Composer({ user, onCreated }: { user: SessionUser; onCreated: (post: Post) => void }) {
  const toast = useToast();
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  async function submit() {
    const text = content.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const post = await clientApi.post<Post>('posts', { content: text });
      onCreated(post);
      setContent('');
      toast('Paylaşıldı.', 'success');
    } catch {
      toast('Paylaşım gönderilemedi.', 'error');
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Bir şeyler paylaş veya bir soru sor…"
            rows={2}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <ImagePlus className="h-4 w-4" />
              Görsel ekleme yakında
            </span>
            <Button
              size="sm"
              onClick={submit}
              disabled={!content.trim() || sending}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
            >
              {sending ? 'Paylaşılıyor…' : 'Paylaş'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ─────────────  Course rail (sidebar)  ───────────── */

function CourseRail({
  title,
  eyebrow,
  courses,
  badge,
}: {
  title: string;
  eyebrow: string;
  courses: CourseSummary[];
  badge?: string;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <Link href="/courses" className="text-sm text-indigo-600 hover:underline">
          Tümü
        </Link>
      </div>
      <div className="space-y-2">
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">Şimdilik içerik yok.</p>
        ) : (
          courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="flex items-center gap-3 rounded-xl border bg-card p-2.5 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
                {course.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  course.title.charAt(0)
                )}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {badge && (
                    <Badge variant="secondary" className="bg-fuchsia-500/10 text-fuchsia-600">
                      {badge}
                    </Badge>
                  )}
                  <span className="truncate text-sm font-medium">{course.title}</span>
                </div>
                <div className="mt-0.5 truncate text-xs text-muted-foreground">
                  {course.instructor.name}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
