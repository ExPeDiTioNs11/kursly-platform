import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a price stored in minor units (cents) as a display string. */
export function formatPrice(minorUnits: number): string {
  if (minorUnits === 0) {
    return 'Free';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    minorUnits / 100,
  );
}

/** Format a duration in seconds as `H:MM:SS` or `M:SS`. */
export function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}
