import { expect, test } from '@playwright/test';
import { signInEachTest, devLogin } from './helpers';

// Your data: the one-time import from before accounts, the download, and deleting the account (4.5, 4.6).

const user = signInEachTest();

test('what this browser kept before sign-in moves into the account, once', async ({ page }) => {
  await page.evaluate(() => {
    const task = { id: 'old-1', title: 'Water the plants', timeEstimate: '~5 min', tag: 'wellbeing', priority: 'low', completed: false };
    window.localStorage.setItem('pebble-tasks', JSON.stringify([task]));
  });
  await page.reload();

  await expect(page.getByText('Water the plants').first()).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('pebble-tasks'))).toBeNull();
  await page.reload();
  await expect(page.locator('.task-card', { hasText: 'Water the plants' })).toHaveCount(1);
});

test('downloading your data, then deleting the account for good', async ({ page }) => {
  await page.getByRole('button', { name: 'Add example tasks' }).click();
  await expect.poll(async () => (await (await page.request.get('/api/tasks')).json()).length).toBeGreaterThan(0);
  await page.getByRole('link', { name: /Settings/ }).click();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download my data' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^pebble-data-\d{4}-\d{2}-\d{2}\.json$/);
  const exported = JSON.parse(await (await import('node:fs/promises')).readFile(await file.path(), 'utf8'));
  expect(exported.userId).toBe(`dev:${user.name}`);
  expect(exported.data.tasks.map((t: { title: string }) => t.title)).toContain('Read Chapter 4 of the design textbook');
  expect(exported.data.task_steps.length).toBeGreaterThan(0);

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Delete my account' }).click();
  await expect(page).toHaveURL(/\/signin/);

  // Signing in again under the same name starts from nothing
  await devLogin(page, '/today', user.name);
  await expect(page.getByRole('button', { name: 'Add example tasks' })).toBeVisible();
  expect(await (await page.request.get('/api/tasks')).json()).toEqual([]);
});
