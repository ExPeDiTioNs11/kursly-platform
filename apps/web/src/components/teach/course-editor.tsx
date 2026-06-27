'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Eye,
  Loader2,
  Lock,
  Pencil,
  PlayCircle,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import type { Category, ManageCourse, ManageLesson, ManageSection } from '@kursly/shared';
import { clientApi } from '@/lib/client-api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import { formatDuration } from '@/lib/utils';

const inputCls =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Taslak',
  PUBLISHED: 'Yayında',
  ARCHIVED: 'Arşiv',
};

export function CourseEditor({ courseId }: { courseId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [course, setCourse] = useState<ManageCourse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [level, setLevel] = useState('BEGINNER');
  const [format, setFormat] = useState('FULL');
  const [categoryId, setCategoryId] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  async function load() {
    const c = await clientApi.get<ManageCourse>(`courses/${courseId}/manage`);
    setCourse(c);
    setTitle(c.title);
    setSubtitle(c.subtitle ?? '');
    setDescription(c.description ?? '');
    setThumbnailUrl(c.thumbnailUrl ?? '');
    setLevel(c.level);
    setFormat(c.format);
    setCategoryId(c.categoryId ?? '');
  }

  useEffect(() => {
    load().catch(() => setError('Kurs bulunamadı veya erişim yok.'));
    clientApi
      .get<Category[]>('categories')
      .then(setCategories)
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function saveDetails() {
    setSaving(true);
    try {
      await clientApi.patch(`courses/${courseId}`, {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || undefined,
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        level,
        format,
        categoryId: categoryId || undefined,
      });
      toast('Kurs bilgileri kaydedildi.', 'success');
    } catch (e) {
      toast((e as Error).message ?? 'Kaydedilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(status: string) {
    setStatusBusy(true);
    try {
      await clientApi.patch(`courses/${courseId}`, { status });
      await load();
      toast(status === 'PUBLISHED' ? 'Kurs yayınlandı.' : 'Durum güncellendi.', 'success');
    } catch (e) {
      toast((e as Error).message ?? 'İşlem başarısız.', 'error');
    } finally {
      setStatusBusy(false);
    }
  }

  async function addSection(titleVal: string) {
    try {
      await clientApi.post(`courses/${courseId}/sections`, { title: titleVal });
      await load();
      toast('Bölüm eklendi.', 'success');
    } catch (e) {
      toast((e as Error).message ?? 'Bölüm eklenemedi.', 'error');
    }
  }

  async function renameSection(sectionId: string, titleVal: string) {
    try {
      await clientApi.patch(`courses/sections/${sectionId}`, { title: titleVal });
      await load();
    } catch (e) {
      toast((e as Error).message ?? 'Güncellenemedi.', 'error');
    }
  }

  async function removeSection(sectionId: string) {
    try {
      await clientApi.del(`courses/sections/${sectionId}`);
      await load();
      toast('Bölüm silindi.', 'success');
    } catch (e) {
      toast((e as Error).message ?? 'Silinemedi.', 'error');
    }
  }

  async function addLesson(
    sectionId: string,
    data: { title: string; durationSeconds: number; isPreview: boolean },
  ) {
    try {
      await clientApi.post(`courses/sections/${sectionId}/lessons`, data);
      await load();
      toast('Ders eklendi.', 'success');
    } catch (e) {
      toast((e as Error).message ?? 'Ders eklenemedi.', 'error');
    }
  }

  async function updateLesson(
    lessonId: string,
    data: { title: string; durationSeconds: number; isPreview: boolean },
  ) {
    try {
      await clientApi.patch(`courses/lessons/${lessonId}`, data);
      await load();
    } catch (e) {
      toast((e as Error).message ?? 'Güncellenemedi.', 'error');
    }
  }

  async function removeLesson(lessonId: string) {
    try {
      await clientApi.del(`courses/lessons/${lessonId}`);
      await load();
      toast('Ders silindi.', 'success');
    } catch (e) {
      toast((e as Error).message ?? 'Silinemedi.', 'error');
    }
  }

  async function deleteCourse() {
    try {
      await clientApi.del(`courses/${courseId}`);
      toast('Kurs silindi.', 'success');
      router.push('/teach');
    } catch (e) {
      toast((e as Error).message ?? 'Silinemedi.', 'error');
    }
  }

  if (error) {
    return <div className="container py-16 text-center text-muted-foreground">{error}</div>;
  }
  if (!course) {
    return (
      <div className="container flex items-center gap-2 py-24 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Yükleniyor…
      </div>
    );
  }

  return (
    <div className="container max-w-3xl space-y-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/teach"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Panele dön
        </Link>
        {course.status === 'PUBLISHED' && (
          <Link
            href={`/courses/${course.slug}`}
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
          >
            <Eye className="h-4 w-4" />
            Yayını görüntüle
          </Link>
        )}
      </div>

      <h1 className="text-3xl font-bold">{course.title}</h1>

      {/* Status */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Durum:</span>
            <Badge variant="secondary">{STATUS_LABEL[course.status]}</Badge>
          </div>
          <div className="flex gap-2">
            {course.status !== 'PUBLISHED' ? (
              <Button
                size="sm"
                onClick={() => setStatus('PUBLISHED')}
                disabled={statusBusy}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Yayınla
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatus('DRAFT')}
                  disabled={statusBusy}
                >
                  Yayından kaldır
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setStatus('ARCHIVED')}
                  disabled={statusBusy}
                >
                  Arşivle
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-semibold">Kurs bilgileri</h2>
          <Labeled label="Başlık">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
          </Labeled>
          <Labeled label="Alt başlık">
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className={inputCls}
            />
          </Labeled>
          <Labeled label="Kapak görseli URL’si">
            <input
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
            {thumbnailUrl.trim() && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt=""
                className="mt-2 aspect-video w-40 rounded-lg border object-cover"
              />
            )}
          </Labeled>
          <Labeled label="Açıklama">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className={`${inputCls} resize-none`}
            />
          </Labeled>
          <div className="grid gap-4 sm:grid-cols-3">
            <Labeled label="Seviye">
              <select value={level} onChange={(e) => setLevel(e.target.value)} className={inputCls}>
                <option value="BEGINNER">Başlangıç</option>
                <option value="INTERMEDIATE">Orta</option>
                <option value="ADVANCED">İleri</option>
              </select>
            </Labeled>
            <Labeled label="Tür">
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className={inputCls}
              >
                <option value="FULL">Normal</option>
                <option value="MINI">Mini</option>
              </select>
            </Labeled>
            <Labeled label="Kategori">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={inputCls}
              >
                <option value="">Seçilmedi</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Labeled>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={saveDetails}
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:brightness-110 disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor…' : 'Kaydet'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Curriculum */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="font-semibold">Müfredat</h2>
          {course.sections.length === 0 && (
            <p className="text-sm text-muted-foreground">Henüz bölüm yok. İlk bölümü ekle.</p>
          )}
          {course.sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              onAddLesson={addLesson}
              onUpdateLesson={updateLesson}
              onRemoveLesson={removeLesson}
              onRename={renameSection}
              onRemove={removeSection}
            />
          ))}
          <AddSection onAdd={addSection} />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <div>
            <h2 className="font-semibold text-destructive">Kursu sil</h2>
            <p className="text-sm text-muted-foreground">Bu işlem geri alınamaz.</p>
          </div>
          <DeleteButton label="Kursu sil" onConfirm={deleteCourse} />
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

function SectionBlock({
  section,
  onAddLesson,
  onUpdateLesson,
  onRemoveLesson,
  onRename,
  onRemove,
}: {
  section: ManageSection;
  onAddLesson: (
    sectionId: string,
    data: { title: string; durationSeconds: number; isPreview: boolean },
  ) => Promise<void>;
  onUpdateLesson: (
    lessonId: string,
    data: { title: string; durationSeconds: number; isPreview: boolean },
  ) => Promise<void>;
  onRemoveLesson: (lessonId: string) => Promise<void>;
  onRename: (sectionId: string, title: string) => Promise<void>;
  onRemove: (sectionId: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(section.title);
  const [newTitle, setNewTitle] = useState('');
  const [minutes, setMinutes] = useState('5');
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!newTitle.trim() || busy) return;
    setBusy(true);
    try {
      await onAddLesson(section.id, {
        title: newTitle.trim(),
        durationSeconds: Math.max(0, Math.round(Number(minutes) * 60)) || 0,
        isPreview: preview,
      });
      setNewTitle('');
      setMinutes('5');
      setPreview(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border">
      <div className="flex items-center gap-2 border-b bg-secondary/40 px-3 py-2">
        {editing ? (
          <>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-indigo-500"
            />
            <button
              onClick={async () => {
                await onRename(section.id, title.trim());
                setEditing(false);
              }}
              className="text-emerald-600"
              aria-label="Kaydet"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setTitle(section.title);
                setEditing(false);
              }}
              aria-label="Vazgeç"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 font-medium">{section.title}</span>
            <button
              onClick={() => setEditing(true)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Düzenle"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <DeleteButton small onConfirm={() => onRemove(section.id)} />
          </>
        )}
      </div>

      <div className="space-y-1 p-3">
        {section.lessons.length === 0 ? (
          <p className="px-1 text-sm text-muted-foreground">Bu bölümde ders yok.</p>
        ) : (
          section.lessons.map((l) => (
            <LessonRow key={l.id} lesson={l} onUpdate={onUpdateLesson} onRemove={onRemoveLesson} />
          ))
        )}

        {/* Add lesson */}
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t pt-3">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Ders adı"
            className="min-w-[8rem] flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none focus:border-indigo-500"
          />
          <input
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            type="number"
            min={0}
            className="w-16 rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-indigo-500"
            aria-label="Süre (dakika)"
          />
          <span className="text-xs text-muted-foreground">dk</span>
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={preview}
              onChange={(e) => setPreview(e.target.checked)}
              className="accent-indigo-600"
            />
            Önizleme
          </label>
          <Button size="sm" variant="outline" onClick={add} disabled={busy || !newTitle.trim()}>
            <Plus className="h-4 w-4" />
            Ders
          </Button>
        </div>
      </div>
    </div>
  );
}

function LessonRow({
  lesson,
  onUpdate,
  onRemove,
}: {
  lesson: ManageLesson;
  onUpdate: (
    lessonId: string,
    data: { title: string; durationSeconds: number; isPreview: boolean },
  ) => Promise<void>;
  onRemove: (lessonId: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [minutes, setMinutes] = useState(String(Math.round(lesson.durationSeconds / 60)));
  const [preview, setPreview] = useState(lesson.isPreview);
  const [busy, setBusy] = useState(false);

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-secondary/40 px-2 py-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="min-w-[8rem] flex-1 rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-indigo-500"
        />
        <input
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          type="number"
          min={0}
          className="w-14 rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:border-indigo-500"
        />
        <span className="text-xs text-muted-foreground">dk</span>
        <label className="flex items-center gap-1 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={preview}
            onChange={(e) => setPreview(e.target.checked)}
            className="accent-indigo-600"
          />
          Önizleme
        </label>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onUpdate(lesson.id, {
              title: title.trim(),
              durationSeconds: Math.max(0, Math.round(Number(minutes) * 60)) || 0,
              isPreview: preview,
            });
            setBusy(false);
            setEditing(false);
          }}
          className="text-emerald-600"
          aria-label="Kaydet"
        >
          <Check className="h-4 w-4" />
        </button>
        <button onClick={() => setEditing(false)} aria-label="Vazgeç">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2 rounded-lg px-1 py-1.5 text-sm hover:bg-secondary/40">
      {lesson.isPreview ? (
        <PlayCircle className="h-4 w-4 text-indigo-500" />
      ) : (
        <Lock className="h-4 w-4 text-muted-foreground" />
      )}
      <span className="flex-1">{lesson.title}</span>
      <span className="text-xs text-muted-foreground">
        {formatDuration(lesson.durationSeconds)}
      </span>
      <button
        onClick={() => setEditing(true)}
        className="text-muted-foreground hover:text-foreground"
        aria-label="Düzenle"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <DeleteButton small onConfirm={() => onRemove(lesson.id)} />
    </div>
  );
}

function AddSection({ onAdd }: { onAdd: (title: string) => Promise<void> }) {
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function add() {
    if (title.trim().length < 2 || busy) return;
    setBusy(true);
    try {
      await onAdd(title.trim());
      setTitle('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2 pt-1">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Yeni bölüm başlığı"
        className={inputCls}
      />
      <Button
        onClick={add}
        disabled={busy || title.trim().length < 2}
        variant="outline"
        className="shrink-0"
      >
        <Plus className="h-4 w-4" />
        Bölüm
      </Button>
    </div>
  );
}

function DeleteButton({
  label,
  small,
  onConfirm,
}: {
  label?: string;
  small?: boolean;
  onConfirm: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!confirming) {
    if (small) {
      return (
        <button
          onClick={() => setConfirming(true)}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Sil"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      );
    }
    return (
      <Button
        variant="outline"
        className="border-destructive/40 text-destructive"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="h-4 w-4" />
        {label ?? 'Sil'}
      </Button>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onConfirm();
        }}
        className="rounded bg-destructive px-2 py-0.5 text-xs text-destructive-foreground"
      >
        {busy ? '…' : 'Sil'}
      </button>
      <button onClick={() => setConfirming(false)} className="text-xs text-muted-foreground">
        Vazgeç
      </button>
    </span>
  );
}
