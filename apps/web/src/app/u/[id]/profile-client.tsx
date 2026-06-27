'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarDays, Loader2, Pencil, X } from 'lucide-react';
import { Role } from '@kursly/shared';
import type {
  CourseSummary,
  Paginated,
  Post,
  PublicUser,
  SocialAuthor,
  UserProfile,
} from '@kursly/shared';
import type { SessionUser } from '@/lib/session';
import { clientApi } from '@/lib/client-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/course-card';
import { PostCard } from '@/components/feed/post-card';
import { useToast } from '@/components/ui/toast';

const ROLE_LABEL: Record<Role, string> = {
  [Role.STUDENT]: 'Öğrenci',
  [Role.INSTRUCTOR]: 'Eğitmen',
  [Role.COMPANY]: 'Firma',
  [Role.ADMIN]: 'Yönetici',
};

export function ProfileClient({ userId, viewer }: { userId: string; viewer: SessionUser }) {
  const router = useRouter();
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [listType, setListType] = useState<'followers' | 'following' | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, postsRes] = await Promise.all([
          clientApi.get<UserProfile>(`users/${userId}/profile`),
          clientApi.get<Paginated<Post>>(`posts?authorId=${userId}&pageSize=20`),
        ]);
        if (cancelled) return;
        setProfile(p);
        setPosts(postsRes.items);
        if (p.role === Role.INSTRUCTOR) {
          const c = await clientApi.get<Paginated<CourseSummary>>(`courses?instructorId=${userId}`);
          if (!cancelled) setCourses(c.items);
        }
      } catch {
        if (!cancelled) setError('Kullanıcı bulunamadı.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function toggleFollow() {
    if (!profile || followBusy) return;
    const next = !profile.isFollowing;
    setFollowBusy(true);
    setProfile({
      ...profile,
      isFollowing: next,
      counts: { ...profile.counts, followers: profile.counts.followers + (next ? 1 : -1) },
    });
    const call = next ? clientApi.post(`follows/${userId}`) : clientApi.del(`follows/${userId}`);
    call
      .catch(() => {
        toast('İşlem başarısız oldu.', 'error');
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: !next,
                counts: { ...prev.counts, followers: prev.counts.followers + (next ? -1 : 1) },
              }
            : prev,
        );
      })
      .finally(() => setFollowBusy(false));
  }

  if (error) {
    return <div className="container py-16 text-center text-muted-foreground">{error}</div>;
  }
  if (!profile) {
    return (
      <div className="container flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Profil yükleniyor…
      </div>
    );
  }

  const joined = new Date(profile.createdAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="container py-8">
      <div className="relative mb-8 overflow-hidden rounded-2xl border">
        <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar name={profile.name} avatarUrl={profile.avatarUrl} />
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <Badge
                    variant="secondary"
                    className={
                      profile.role === Role.INSTRUCTOR ? 'bg-indigo-500/10 text-indigo-600' : ''
                    }
                  >
                    {ROLE_LABEL[profile.role]}
                  </Badge>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {joined} tarihinde katıldı
                </p>
              </div>
            </div>

            {profile.isMe ? (
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Profili düzenle
              </Button>
            ) : (
              <Button
                onClick={toggleFollow}
                disabled={followBusy}
                variant={profile.isFollowing ? 'outline' : 'default'}
                className={
                  profile.isFollowing
                    ? ''
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110'
                }
              >
                {profile.isFollowing ? 'Takip ediliyor' : 'Takip et'}
              </Button>
            )}
          </div>

          {profile.bio && (
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">{profile.bio}</p>
          )}

          <div className="mt-4 flex gap-6 text-sm">
            <Stat value={profile.counts.posts} label="Paylaşım" />
            <button onClick={() => setListType('followers')} className="hover:underline">
              <Stat value={profile.counts.followers} label="Takipçi" />
            </button>
            <button onClick={() => setListType('following')} className="hover:underline">
              <Stat value={profile.counts.following} label="Takip" />
            </button>
            {profile.role === Role.INSTRUCTOR && (
              <Stat value={profile.counts.courses} label="Kurs" />
            )}
          </div>
        </div>
      </div>

      {profile.role === Role.INSTRUCTOR && courses.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Kursları</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-2xl">
        <h2 className="mb-4 text-xl font-semibold">Paylaşımlar</h2>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henüz paylaşım yok.</p>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={viewer.id}
                isFollowing={profile.isFollowing}
                onToggleFollow={toggleFollow}
                onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
              />
            ))}
          </div>
        )}
      </section>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={(u) => {
            setProfile((p) => (p ? { ...p, name: u.name, bio: u.bio, avatarUrl: u.avatarUrl } : p));
            toast('Profil güncellendi.', 'success');
            router.refresh();
          }}
        />
      )}

      {listType && (
        <FollowListModal userId={userId} type={listType} onClose={() => setListType(null)} />
      )}
    </div>
  );
}

/* ─────────  Edit profile modal  ───────── */

function EditProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: UserProfile;
  onClose: () => void;
  onSaved: (u: PublicUser) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? '');
  const [saving, setSaving] = useState(false);

  async function save() {
    if (name.trim().length < 2 || saving) return;
    setSaving(true);
    try {
      const updated = await clientApi.patch<PublicUser>('users/me', {
        name: name.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      // Refresh the display cookie so the header updates without re-login.
      await fetch('/api/session/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updated.id,
          name: updated.name,
          avatarUrl: updated.avatarUrl,
          role: updated.role,
        }),
      });
      onSaved(updated);
      onClose();
    } catch (e) {
      toast((e as Error).message ?? 'Güncellenemedi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

  return (
    <Modal title="Profili düzenle" onClose={onClose}>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Ad Soyad</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Avatar URL’si</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Hakkında</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Vazgeç
          </Button>
          <Button
            onClick={save}
            disabled={saving || name.trim().length < 2}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─────────  Followers / following modal  ───────── */

function FollowListModal({
  userId,
  type,
  onClose,
}: {
  userId: string;
  type: 'followers' | 'following';
  onClose: () => void;
}) {
  const [list, setList] = useState<SocialAuthor[] | null>(null);

  useEffect(() => {
    clientApi
      .get<SocialAuthor[]>(`follows/${userId}/${type}`)
      .then(setList)
      .catch(() => setList([]));
  }, [userId, type]);

  return (
    <Modal title={type === 'followers' ? 'Takipçiler' : 'Takip edilenler'} onClose={onClose}>
      {!list ? (
        <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Yükleniyor…
        </div>
      ) : list.length === 0 ? (
        <p className="py-6 text-sm text-muted-foreground">Liste boş.</p>
      ) : (
        <div className="max-h-80 space-y-1 overflow-y-auto">
          {list.map((u) => (
            <Link
              key={u.id}
              href={`/u/${u.id}`}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-secondary"
            >
              <SmallAvatar name={u.name} avatarUrl={u.avatarUrl} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">{ROLE_LABEL[u.role]}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ─────────  Shared bits  ───────── */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
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
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <span>
      <span className="font-bold">{value}</span>{' '}
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        className="h-24 w-24 rounded-2xl border-4 border-background object-cover shadow-md"
      />
    );
  }
  return (
    <span className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-background bg-gradient-to-br from-indigo-500 to-violet-500 text-3xl font-bold text-white shadow-md">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

function SmallAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt={name} className="h-9 w-9 rounded-full object-cover" />;
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
