import { describe, expect, it } from 'vitest';
import { cn, formatDuration, formatPrice } from './utils';

describe('cn', () => {
  it('merges and dedupes conflicting tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

describe('formatPrice', () => {
  it('shows Free for zero', () => {
    expect(formatPrice(0)).toBe('Free');
  });

  it('formats minor units as currency', () => {
    expect(formatPrice(1999)).toBe('$19.99');
  });
});

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('2:05');
  });

  it('formats hours when present', () => {
    expect(formatDuration(3661)).toBe('1:01:01');
  });
});
