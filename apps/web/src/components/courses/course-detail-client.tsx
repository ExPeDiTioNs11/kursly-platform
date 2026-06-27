'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Clock, Loader2, Lock, PlayCircle, Star, Users } from 'lucide-react';
import type {
  CourseDetail,
  CourseReview,
  EnrollmentItem,
  LessonSummary,
  ProgressRow,
} from '@kursly/shared';
import type { SessionUser } from '@/lib/session';
import { clientApi } from '@/lib/client-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { CourseReviews } from '@/components/courses/course-reviews';

// Heavy player (video.js + hls.js) — only loaded when a lesson is actually played.
const VideoPlayer = dynamic(() => import('@/components/video-player').then((m) => m.VideoPlayer), {
  ssr: false,
});
import { useToast } from '@/components/ui/toast';
import { cn, formatDuration, formatPrice } from '@/lib/utils';

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: 'Başlangıç',
  INTERMEDIATE: 'Orta',
  ADVANCED: 'İleri',
};

export function CourseDetailClient({
  course,
  reviews,
  session,
}: {
  course: CourseDetail;
  reviews: CourseReview[];
  session: SessionUser | null;
}) {
  const toast = useToast();
  const totalLessons = course.sections.reduce((n, s) => n + s.lessons.length, 0);

  const [enrolled, setEnrolled] = useState<boolean | null>(session ? null : false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const [active, setActive] = useState<LessonSummary | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [playbackMsg, setPlaybackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      try {
        const enr = await clientApi.get<EnrollmentItem[]>('enrollments');
        const isEnrolled = enr.some((e) => e.courseId === course.id);
        if (cancelled) return;
        setEnrolled(isEnrolled);
        if (isEnrolled) {
          const prog = await clientApi
            .get<ProgressRow[]>(`progress/courses/${course.id}`)
            .catch(() => [] as ProgressRow[]);
          if (!cancelled) {
            setCompleted(new Set(prog.filter((p) => p.completed).map((p) => p.lessonId)));
          }
        }
      } catch {
        if (!cancelled) setEnrolled(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, course.id]);

  async function enroll() {
    setBusy(true);
    try {
      await clientApi.post(`enrollments/${course.id}`);
      setEnrolled(true);
      toast('Kursa kaydoldun 🎉', 'success');
    } catch {
      toast('Kayıt başarısız oldu.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function unenroll() {
    setBusy(true);
    try {
      await clientApi.del(`enrollments/${course.id}`);
      setEnrolled(false);
      setCompleted(new Set());
      setActive(null);
      toast('Kayıt kaldırıldı.', 'info');
    } catch {
      toast('İşlem başarısız oldu.', 'error');
    } finally {
      setBusy(false);
    }
  }

  function toggleComplete(lessonId: string) {
    if (!enrolled) return;
    const has = completed.has(lessonId);
    setCompleted((prev) => {
      const next = new Set(prev);
      if (has) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
    clientApi.put(`progress/lessons/${lessonId}`, { completed: !has }).catch(() => {
      setCompleted((prev) => {
        const next = new Set(prev);
        if (has) next.add(lessonId);
        else next.delete(lessonId);
        return next;
      });
    });
  }

  function watchable(lesson: LessonSummary) {
    return Boolean(session) && (lesson.isPreview || enrolled === true);
  }

  function selectLesson(lesson: LessonSummary) {
    if (!watchable(lesson)) return;
    setActive(lesson);
    setPlaybackUrl(null);
    setPlaybackMsg(null);
    clientApi
      .get<{ url: string }>(`storage/lessons/${lesson.id}/playback-url`)
      .then((r) => setPlaybackUrl(r.url))
      .catch(() =>
        setPlaybackMsg('Bu ders için video henüz yüklenmedi (R2 yapılandırması gerekli).'),
      );
  }

  const progressPct = totalLessons > 0 ? Math.round((completed.size / totalLessons) * 100) : 0;

  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Header */}
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{LEVEL_LABEL[course.level] ?? course.level}</Badge>
            {course.format === 'MINI' && (
              <Badge className="bg-fuchsia-500/10 text-fuchsia-600">Mini eğitim</Badge>
            )}
            {course.category && <Badge variant="outline">{course.category.name}</Badge>}
          </div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          {course.subtitle && <p className="mt-2 text-muted-foreground">{course.subtitle}</p>}
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>Eğitmen: {course.instructor.name}</span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {course.averageRating.toFixed(1)} ({course.reviewCount} değerlendirme)
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.enrollmentCount} öğrenci
            </span>
          </p>
        </div>

        {/* Player */}
        {active && (
          <Card className="overflow-hidden">
            {playbackUrl ? (
              <VideoPlayer src={playbackUrl} className="aspect-video w-full bg-black" />
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-center text-white">
                <PlayCircle className="h-14 w-14 opacity-90" />
                <div className="px-6">
                  <div className="font-semibold">{active.title}</div>
                  <div className="mt-1 text-sm text-white/80">
                    {playbackMsg ?? 'Video yükleniyor…'}
                  </div>
                </div>
              </div>
            )}
            {enrolled && (
              <div className="flex items-center justify-between p-4">
                <span className="text-sm font-medium">{active.title}</span>
                <Button
                  size="sm"
                  variant={completed.has(active.id) ? 'secondary' : 'default'}
                  onClick={() => toggleComplete(active.id)}
                >
                  {completed.has(active.id) ? 'Tamamlandı ✓' : 'Tamamlandı olarak işaretle'}
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Description */}
        {course.description && (
          <section>
            <h2 className="mb-2 text-xl font-semibold">Bu kurs hakkında</h2>
            <p className="whitespace-pre-line text-muted-foreground">{course.description}</p>
          </section>
        )}

        {/* Curriculum */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Müfredat{' '}
            <span className="text-sm font-normal text-muted-foreground">· {totalLessons} ders</span>
          </h2>
          <div className="space-y-4">
            {course.sections.map((section) => (
              <Card key={section.id}>
                <div className="border-b px-5 py-3 font-semibold">{section.title}</div>
                <CardContent className="space-y-1 py-2">
                  {section.lessons.map((lesson) => {
                    const canWatch = watchable(lesson);
                    const isDone = completed.has(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-2 py-2 text-sm',
                          canWatch && 'cursor-pointer hover:bg-secondary',
                          active?.id === lesson.id && 'bg-secondary',
                        )}
                        onClick={() => selectLesson(lesson)}
                      >
                        {enrolled ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleComplete(lesson.id);
                            }}
                            aria-label="Tamamlandı"
                            className="shrink-0"
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </button>
                        ) : lesson.isPreview ? (
                          <PlayCircle className="h-5 w-5 shrink-0 text-indigo-500" />
                        ) : (
                          <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
                        )}

                        <span className="flex-1">{lesson.title}</span>

                        {lesson.isPreview && !enrolled && (
                          <Badge variant="outline" className="text-indigo-600">
                            Önizleme
                          </Badge>
                        )}
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(lesson.durationSeconds)}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <CourseReviews
          courseId={course.id}
          initialReviews={reviews}
          currentUserId={session?.id ?? null}
          canReview={enrolled === true}
        />
      </div>

      {/* Sidebar */}
      <aside className="lg:col-span-1">
        <Card className="sticky top-20">
          <CardContent className="space-y-4 pt-6">
            <p className="text-3xl font-bold">{formatPrice(course.price)}</p>

            {!session ? (
              <>
                <Link href={`/login?next=/courses/${course.slug}`} className="block">
                  <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110">
                    Kayıt olmak için giriş yap
                  </Button>
                </Link>
                <p className="text-center text-xs text-muted-foreground">
                  Ömür boyu erişim · Kendi hızında öğren
                </p>
              </>
            ) : enrolled === null ? (
              <Button disabled className="w-full">
                <Loader2 className="h-4 w-4 animate-spin" />
                Kontrol ediliyor…
              </Button>
            ) : enrolled ? (
              <>
                <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-center text-sm font-medium text-emerald-600">
                  ✓ Bu kursa kayıtlısın
                </div>
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>İlerleme</span>
                    <span>
                      {completed.size}/{totalLessons} ders
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={unenroll}
                  disabled={busy}
                  className="w-full text-muted-foreground"
                >
                  Kaydı kaldır
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={enroll}
                  disabled={busy}
                  className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
                >
                  {busy ? 'Kaydolunuyor…' : 'Kursa Kayıt Ol'}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  Ömür boyu erişim · Kendi hızında öğren
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
