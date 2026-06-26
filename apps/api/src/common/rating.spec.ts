import { averageRating } from './rating';

describe('averageRating', () => {
  it('returns 0 for an empty list', () => {
    expect(averageRating([])).toBe(0);
  });

  it('averages and rounds to one decimal', () => {
    expect(averageRating([5, 4, 4])).toBe(4.3);
  });

  it('handles a single rating', () => {
    expect(averageRating([3])).toBe(3);
  });
});
