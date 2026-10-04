import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// Progress that only adds up (5.6).

signInEachTest();

test('what you finish adds up on the stats page (5.6)', async ({ page }) => {
  await page.getByRole('button', { name: 'Add example tasks' }).click();
  await page.getByRole('button', { name: /Break down "Read Chapter 4/ }).click();
  await page.locator('.step-item', { hasText: 'Skim the chapter headings first' }).getByRole('button', { name: 'Check step' }).click();
  await page.getByRole('button', { name: 'Mark "Read Chapter 4 of the design textbook" as done' }).click();
  // Unticking takes nothing back
  await page.getByRole('region', { name: /Done today/ }).getByRole('button', { name: 'Mark as incomplete' }).click();
  await expect.poll(async () => (await (await page.request.get('/api/tasks')).json())[0].completed).toBe(false);

  await page.getByRole('link', { name: /Stats/ }).click();
  await expect(page.getByText('In the last 7 days you finished 1 step and 1 task.')).toBeVisible();
  await expect(page.getByText('Since you started: 1 step and 1 task.')).toBeVisible();
  const study = page.getByRole('region', { name: 'Tasks finished by tag' }).getByRole('listitem').first();
  await expect(study).toHaveText('Study1');
});
