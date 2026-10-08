import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// Neutral deadlines (8.3): a due day shows as a calm bar, and near it Pebble offers CalmSense.
// Once the day is over (8.4), the task is still open: move it, make it smaller, or let it go.

signInEachTest();

/** A day relative to today in the browser's calendar, as YYYY-MM-DD. */
function day(page: import('@playwright/test').Page, offset: number) {
  return page.evaluate((n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, offset);
}

test('a task due tomorrow shows its time left and an offer to make it smaller', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Add a new task' }).fill('Write the report');
  await page.getByRole('textbox', { name: 'Add a new task' }).press('Enter');
  const card = page.getByRole('article', { name: 'Write the report' });

  const tomorrow = await day(page, 1);
  await page.getByRole('button', { name: 'Edit "Write the report"' }).click();
  await page.getByRole('dialog', { name: 'Edit task' }).getByLabel('Due day').fill(tomorrow);
  await page.getByRole('dialog', { name: 'Edit task' }).getByRole('button', { name: 'Save' }).click();

  await expect(card.getByRole('meter', { name: 'Time left' })).toHaveAttribute('aria-valuetext', 'Due tomorrow');
  await card.getByRole('button', { name: 'Make it smaller' }).click();
  await expect(card.getByText('0 of 3 steps')).toBeVisible();
  await expect(card.getByRole('group', { name: 'Make it smaller' })).toHaveCount(0);

  // Saved: the due day comes back after a reload
  await page.reload();
  await expect(card.getByRole('meter', { name: 'Time left' })).toHaveAttribute('aria-valuetext', 'Due tomorrow');
});

test('a task whose day is over can be moved, or let go and stays gone after a reload', async ({ page }) => {
  for (const title of ['Essay', 'Walk']) {
    await page.getByRole('textbox', { name: 'Add a new task' }).fill(title);
    await page.getByRole('textbox', { name: 'Add a new task' }).press('Enter');
    await page.getByRole('button', { name: `Edit "${title}"` }).click();
    await page.getByRole('dialog', { name: 'Edit task' }).getByLabel('Due day').fill(await day(page, -2));
    await page.getByRole('dialog', { name: 'Edit task' }).getByRole('button', { name: 'Save' }).click();
  }
  const essay = page.getByRole('article', { name: 'Essay' });
  const walk = page.getByRole('article', { name: 'Walk' });
  await expect(essay.getByRole('group', { name: 'Still open' })).toBeVisible();

  // Move it
  await walk.getByRole('button', { name: 'Move "Walk" to another day' }).click();
  await walk.getByRole('button', { name: 'Next week' }).click();
  await expect(walk.getByRole('meter', { name: 'Time left' })).toHaveAttribute('aria-valuetext', '7 days left');

  // Let it go
  await essay.getByRole('button', { name: 'Let "Essay" go' }).click();
  await expect(page.getByText('You let "Essay" go. Letting go is fine.')).toBeVisible();
  await expect(essay).toHaveCount(0);

  await page.reload();
  await expect(walk).toBeVisible();
  await expect(essay).toHaveCount(0);
});
