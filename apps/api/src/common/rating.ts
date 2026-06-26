/** Average of a rating list, rounded to one decimal. Returns 0 for empty input. */
export function averageRating(ratings: number[]): number {
  if (ratings.length === 0) {
    return 0;
  }
  const sum = ratings.reduce((a, b) => a + b, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}
