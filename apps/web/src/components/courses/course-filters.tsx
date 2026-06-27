'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import type { CategoryNode } from '@kursly/shared';
import { cn } from '@/lib/utils';

export interface ActiveFilters {
  search?: string;
  category?: string;
  subcategory?: string;
  level?: string;
  format?: string;
}

const LEVELS = [
  { value: 'BEGINNER', label: 'Başlangıç' },
  { value: 'INTERMEDIATE', label: 'Orta' },
  { value: 'ADVANCED', label: 'İleri' },
];

const FORMATS = [
  { value: 'FULL', label: 'Normal' },
  { value: 'MINI', label: 'Mini' },
];

export function CourseFilters({ tree, active }: { tree: CategoryNode[]; active: ActiveFilters }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState<string | null>(active.category ?? null);

  function navigate(next: Partial<ActiveFilters>) {
    const merged: ActiveFilters = { ...active, ...next };
    const params = new URLSearchParams();
    (Object.keys(merged) as (keyof ActiveFilters)[]).forEach((k) => {
      const v = merged[k];
      if (v) params.set(k, v);
    });
    const qs = params.toString();
    router.push(qs ? `/courses?${qs}` : '/courses');
  }

  const hasFilters = Boolean(
    active.category || active.subcategory || active.level || active.format,
  );

  return (
    <div className="space-y-6 lg:sticky lg:top-20">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-indigo-600" />
          Filtreler
        </h2>
        {hasFilters && (
          <button
            onClick={() =>
              navigate({
                category: undefined,
                subcategory: undefined,
                level: undefined,
                format: undefined,
              })
            }
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Temizle
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Kategoriler</h3>
        <div className="space-y-0.5">
          <button
            onClick={() => navigate({ category: undefined, subcategory: undefined })}
            className={cn(
              'w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-secondary',
              !active.category && 'bg-secondary font-medium',
            )}
          >
            Tüm kategoriler
          </button>

          {tree.map((cat) => {
            const isActive = active.category === cat.slug && !active.subcategory;
            const isOpen = expanded === cat.slug;
            return (
              <div key={cat.id}>
                <div className="flex items-center">
                  <button
                    onClick={() => navigate({ category: cat.slug, subcategory: undefined })}
                    className={cn(
                      'flex-1 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-secondary',
                      isActive && 'bg-indigo-500/10 font-medium text-indigo-600',
                    )}
                  >
                    {cat.name}
                  </button>
                  {cat.children.length > 0 && (
                    <button
                      onClick={() => setExpanded(isOpen ? null : cat.slug)}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
                      aria-label="Alt kategoriler"
                    >
                      <ChevronDown
                        className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
                      />
                    </button>
                  )}
                </div>

                {isOpen && cat.children.length > 0 && (
                  <div className="ml-3 border-l pl-2">
                    {cat.children.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => navigate({ category: cat.slug, subcategory: sub.slug })}
                        className={cn(
                          'block w-full rounded-lg px-3 py-1.5 text-left text-sm transition hover:bg-secondary',
                          active.subcategory === sub.slug &&
                            'bg-indigo-500/10 font-medium text-indigo-600',
                        )}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Level */}
      <FilterGroup
        title="Seviye"
        options={LEVELS}
        activeValue={active.level}
        onSelect={(v) => navigate({ level: v })}
      />

      {/* Format */}
      <FilterGroup
        title="Tür"
        options={FORMATS}
        activeValue={active.format}
        onSelect={(v) => navigate({ format: v })}
      />
    </div>
  );
}

function FilterGroup({
  title,
  options,
  activeValue,
  onSelect,
}: {
  title: string;
  options: { value: string; label: string }[];
  activeValue?: string;
  onSelect: (value: string | undefined) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        <Chip active={!activeValue} onClick={() => onSelect(undefined)}>
          Tümü
        </Chip>
        {options.map((opt) => (
          <Chip
            key={opt.value}
            active={activeValue === opt.value}
            onClick={() => onSelect(activeValue === opt.value ? undefined : opt.value)}
          >
            {opt.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition',
        active
          ? 'border-indigo-500 bg-indigo-500/10 font-medium text-indigo-600'
          : 'hover:bg-secondary',
      )}
    >
      {children}
    </button>
  );
}
