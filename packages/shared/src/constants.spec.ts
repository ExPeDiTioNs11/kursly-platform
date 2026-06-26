import { describe, expect, it } from 'vitest';
import { MAX_RATING, MIN_RATING, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from './constants.js';
import { Role } from './enums.js';

describe('shared constants', () => {
  it('defines a sane rating range', () => {
    expect(MIN_RATING).toBeLessThan(MAX_RATING);
    expect(MIN_RATING).toBe(1);
    expect(MAX_RATING).toBe(5);
  });

  it('caps page size above the default', () => {
    expect(DEFAULT_PAGE_SIZE).toBeLessThanOrEqual(MAX_PAGE_SIZE);
  });

  it('exposes the three roles', () => {
    expect(Object.values(Role)).toEqual(['STUDENT', 'INSTRUCTOR', 'ADMIN']);
  });
});
