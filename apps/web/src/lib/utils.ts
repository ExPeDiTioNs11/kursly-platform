import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a price stored in minor units (cents) as a display string. */
export function formatPrice(minorUnits: number): string {
  if (minorUnits === 0) {
    return 'Ücretsiz';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    minorUnits / 100,
  );
}

/** Turn a title into a URL-safe slug (handles Turkish characters). */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
    â: 'a',
    î: 'i',
    û: 'u',
  };
  return input
    .toLowerCase()
    .replace(/[çğıöşüâîû]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Relative time in Turkish, e.g. "az önce", "3 sa önce", "2 gün önce". */
export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'az önce';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} sa önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} hafta önce`;
  return new Date(iso).toLocaleDateString('tr-TR');
}

/** Format a duration in seconds as `H:MM:SS` or `M:SS`. */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}
