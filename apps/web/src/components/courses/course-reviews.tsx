'use client';

import { useMemo, useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import type { CourseReview, Paginated } from '@kursly/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { clientApi } from '@/lib/client-api';
import { useToast } from '@/components/ui/toast';
import { cn, timeAgo } from '@/lib/utils';

export function CourseReviews({
  courseId,
  initialReviews,
  currentUserId,
  canReview,
}: {
  courseId: string;
  initialReviews: CourseReview[];
  currentUserId: string | null;
  canReview: boolean;
}) {
  const toast = useToast();
  const [reviews, setReviews] = useState<CourseReview[]>(initialReviews);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const myReview = useMemo(
    () => reviews.find((r) => r.user.id === currentUserId) ?? null,
    [reviews, currentUserId],
  );

  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  async function refresh() {
    const fresh = await clientApi.get<Paginated<CourseReview>>(
      `courses/${courseId}/reviews?pageSize=50`,
    );
    setReviews(fresh.items);
  }

  function startEdit() {
    setRating(myReview?.rating ?? 5);
    setComment(myReview?.comment ?? '');
    setEditing(true);
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await clientApi.put(`courses/${courseId}/reviews`, {
        rating,
        comment: comment.trim() || undefined,
      });
      await refresh();
      setEditing(false);
      toast('Değerlendirmen kaydedildi.', 'success');
    } catch (e) {
      toast((e as Error).message ?? 'Kaydedilemedi.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove() {
    try {
      await clientApi.del(`courses/${courseId}/reviews`);
      await refresh();
      setEditing(false);
      toast('Değerlendirme silindi.', 'info');
    } catch {
      toast('Silinemedi.', 'error');
    }
  }

  const showForm = canReview && (editing || !myReview);

  return (
    <section className="pt-2">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-semibold">Değerlendirmeler</h2>
        {reviews.length > 0 && (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {average.toFixed(1)} · {reviews.length} değerlendirme
          </span>
        )}
      </div>

      {/* Write / edit form */}
      {showForm && (
        <Card className="mb-4">
          <CardContent className="space-y-3 pt-5">
            <div>
              <div className="mb-1 text-sm font-medium">Puanın</div>
              <StarInput value={rating} onChange={setRating} />
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Bu kurs hakkındaki düşüncelerini paylaş (opsiyonel)…"
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="flex justify-end gap-2">
              {editing && (
                <Button variant="ghost" onClick={() => setEditing(false)}>
                  Vazgeç
                </Button>
              )}
              <Button
                onClick={submit}
                disabled={submitting}
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
              >
                {submitting ? 'Kaydediliyor…' : myReview ? 'Güncelle' : 'Değerlendir'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!canReview && currentUserId && !myReview && (
        <p className="mb-4 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
          Değerlendirme yapmak için bu kursa kayıt olmalısın.
        </p>
      )}

      {/* List */}
      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Henüz değerlendirme yok. İlk değerlendirmeyi sen yap!
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3">
              <Avatar name={r.user.name} avatarUrl={r.user.avatarUrl} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{r.user.name}</span>
                  {r.user.id === currentUserId && (
                    <span className="text-xs text-indigo-600">(sen)</span>
                  )}
                  <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                </div>
                <Stars value={r.rating} />
                {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
                {r.user.id === currentUserId && (
                  <div className="mt-1 flex gap-3 text-xs">
                    <button onClick={startEdit} className="text-indigo-600 hover:underline">
                      Düzenle
                    </button>
                    <button
                      onClick={remove}
                      className="flex items-center gap-1 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Sil
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
          )}
        />
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const filled = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} yıldız`}
          >
            <Star
              className={cn(
                'h-7 w-7 transition',
                filled ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
    );
  }
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
