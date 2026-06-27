'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Loader2, MessageCircle, MoreHorizontal, Pencil, Send, Trash2 } from 'lucide-react';
import { Role } from '@kursly/shared';
import type { Paginated, Post, PostComment } from '@kursly/shared';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { clientApi } from '@/lib/client-api';
import { useToast } from '@/components/ui/toast';
import { cn, timeAgo } from '@/lib/utils';

export function PostCard({
  post,
  currentUserId,
  isFollowing,
  onToggleFollow,
  onDeleted,
}: {
  post: Post;
  currentUserId: string;
  isFollowing: boolean;
  onToggleFollow: (authorId: string) => void;
  onDeleted: (postId: string) => void;
}) {
  const toast = useToast();
  const isOwn = post.author.id === currentUserId;

  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [likePending, setLikePending] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);

  const [editingPost, setEditingPost] = useState(false);
  const [content, setContent] = useState(post.content);
  const [postDraft, setPostDraft] = useState(post.content);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState('');

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  async function toggleLike() {
    if (likePending) return;
    const next = !liked;
    setLiked(next);
    setLikeCount((c) => c + (next ? 1 : -1));
    setLikePending(true);
    try {
      const res = await (next
        ? clientApi.post<{ likeCount: number }>(`posts/${post.id}/like`)
        : clientApi.del<{ likeCount: number }>(`posts/${post.id}/like`));
      if (res?.likeCount !== undefined) setLikeCount(res.likeCount);
    } catch {
      setLiked(!next);
      setLikeCount((c) => c + (next ? -1 : 1));
    } finally {
      setLikePending(false);
    }
  }

  async function toggleComments() {
    const next = !showComments;
    setShowComments(next);
    if (next && !commentsLoaded) {
      setLoadingComments(true);
      try {
        const data = await clientApi.get<Paginated<PostComment>>(
          `posts/${post.id}/comments?pageSize=50`,
        );
        setComments(data.items);
        setCommentsLoaded(true);
      } catch {
        // leave closed-ish; user can retry
      } finally {
        setLoadingComments(false);
      }
    }
  }

  async function submitComment() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const created = await clientApi.post<PostComment>(`posts/${post.id}/comments`, {
        content: text,
      });
      setComments((prev) => [...prev, created]);
      setCommentCount((c) => c + 1);
      setDraft('');
    } catch {
      toast('Yorum gönderilemedi.', 'error');
    } finally {
      setSending(false);
    }
  }

  async function deleteComment(id: string) {
    const prev = comments;
    setComments((c) => c.filter((x) => x.id !== id));
    setCommentCount((c) => c - 1);
    try {
      await clientApi.del(`posts/comments/${id}`);
    } catch {
      setComments(prev);
      setCommentCount((c) => c + 1);
    }
  }

  async function savePostEdit() {
    const text = postDraft.trim();
    if (!text) return;
    try {
      const updated = await clientApi.patch<Post>(`posts/${post.id}`, { content: text });
      setContent(updated.content);
      setEditingPost(false);
      toast('Paylaşım güncellendi.', 'success');
    } catch {
      toast('Güncellenemedi.', 'error');
    }
  }

  async function saveCommentEdit(id: string) {
    const text = commentDraft.trim();
    if (!text) return;
    try {
      const updated = await clientApi.patch<PostComment>(`posts/comments/${id}`, { content: text });
      setComments((cs) => cs.map((c) => (c.id === id ? updated : c)));
      setEditingCommentId(null);
      toast('Yorum güncellendi.', 'success');
    } catch {
      toast('Güncellenemedi.', 'error');
    }
  }

  async function deletePost() {
    setMenuOpen(false);
    onDeleted(post.id);
    try {
      await clientApi.del(`posts/${post.id}`);
      toast('Paylaşım silindi.', 'success');
    } catch {
      toast('Paylaşım silinemedi.', 'error');
    }
  }

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/u/${post.author.id}`}>
          <Avatar name={post.author.name} avatarUrl={post.author.avatarUrl} size={44} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/u/${post.author.id}`} className="truncate font-semibold hover:underline">
              {post.author.name}
            </Link>
            {post.author.role === Role.INSTRUCTOR && (
              <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600">
                Eğitmen
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
        </div>

        {!isOwn && (
          <Button
            variant={isFollowing ? 'ghost' : 'outline'}
            size="sm"
            onClick={() => onToggleFollow(post.author.id)}
            className={cn(isFollowing && 'text-muted-foreground')}
          >
            {isFollowing ? 'Takip ediliyor' : 'Takip et'}
          </Button>
        )}

        {isOwn && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-full p-1.5 text-muted-foreground transition hover:bg-secondary"
              aria-label="Seçenekler"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            {menuOpen && (
              <>
                <button
                  className="fixed inset-0 z-40 cursor-default"
                  aria-hidden
                  tabIndex={-1}
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-1 w-40 overflow-hidden rounded-lg border bg-card shadow-lg">
                  <button
                    onClick={() => {
                      setPostDraft(content);
                      setEditingPost(true);
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm transition hover:bg-secondary"
                  >
                    <Pencil className="h-4 w-4" />
                    Düzenle
                  </button>
                  <button
                    onClick={deletePost}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive transition hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Paylaşımı sil
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {editingPost ? (
        <div className="mt-4 space-y-2">
          <textarea
            value={postDraft}
            onChange={(e) => setPostDraft(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setPostDraft(content);
                setEditingPost(false);
              }}
            >
              Vazgeç
            </Button>
            <Button
              size="sm"
              onClick={savePostEdit}
              disabled={!postDraft.trim()}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
            >
              Kaydet
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed">{content}</p>
      )}

      {post.imageUrl && (
        <div className="mt-4 overflow-hidden rounded-xl border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt="" className="max-h-[28rem] w-full object-cover" />
        </div>
      )}

      {post.course && (
        <Link
          href={`/courses/${post.course.slug}`}
          className="mt-4 flex items-center gap-3 rounded-xl border bg-secondary/40 p-3 transition hover:bg-secondary"
        >
          <span className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            {post.course.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              post.course.title.charAt(0)
            )}
          </span>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">İlgili kurs</div>
            <div className="truncate text-sm font-medium">{post.course.title}</div>
          </div>
        </Link>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-4 border-t pt-3 text-sm text-muted-foreground">
        <button
          onClick={toggleLike}
          className={cn(
            'flex items-center gap-1.5 transition hover:text-rose-500',
            liked && 'text-rose-500',
          )}
        >
          <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
          {likeCount}
        </button>
        <button
          onClick={toggleComments}
          className={cn(
            'flex items-center gap-1.5 transition hover:text-foreground',
            showComments && 'text-foreground',
          )}
        >
          <MessageCircle className="h-5 w-5" />
          {commentCount}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {loadingComments ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Yorumlar yükleniyor…
            </div>
          ) : comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">İlk yorumu sen yaz.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="group flex gap-3">
                <Avatar name={c.author.name} avatarUrl={c.author.avatarUrl} size={32} />
                <div className="min-w-0 flex-1">
                  {editingCommentId === c.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            saveCommentEdit(c.id);
                          }
                        }}
                        className="flex-1 rounded-full border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => saveCommentEdit(c.id)}
                        className="text-emerald-600"
                        aria-label="Kaydet"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-muted-foreground"
                        aria-label="Vazgeç"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-secondary/60 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{c.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(c.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{c.content}</p>
                    </div>
                  )}
                </div>
                {c.author.id === currentUserId && editingCommentId !== c.id && (
                  <div className="mt-1 flex shrink-0 gap-2">
                    <button
                      onClick={() => {
                        setCommentDraft(c.content);
                        setEditingCommentId(c.id);
                      }}
                      className="text-muted-foreground transition hover:text-foreground"
                      aria-label="Yorumu düzenle"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="text-muted-foreground transition hover:text-destructive"
                      aria-label="Yorumu sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
              placeholder="Yorum yaz…"
              className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <Button
              size="icon"
              onClick={submitComment}
              disabled={!draft.trim() || sending}
              className="shrink-0 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
              aria-label="Gönder"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function Avatar({
  name,
  avatarUrl,
  size,
}: {
  name: string;
  avatarUrl: string | null;
  size: number;
}) {
  const style = { width: size, height: size };
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name}
        style={style}
        className="shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <span
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
