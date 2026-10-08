import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// Neutral deadlines (8.3): a due day shows as a calm bar, and near it Pebble offers CalmSense.

signInEachTest();

test('a task due tomorrow shows its time left and an offer to make it smaller', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Add a new task' }).fill('Write the report');
  await page.getByRole('textbox', { name: 'Add a new task' }).press('Enter');
  const card = page.getByRole('article', { name: 'Write the report' });

  const tomorrow = await page.evaluate(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
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
