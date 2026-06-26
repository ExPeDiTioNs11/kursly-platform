import { test, expect } from '@playwright/test';

test('home page renders the hero and navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Learn anything/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Kursly' })).toBeVisible();
});
