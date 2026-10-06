import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// BridgeBot (7.7): a task's steps as a calendar file, through the real backend.

signInEachTest();

test('a broken-down task can be saved as a calendar file with one event per step', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Add a new task' }).fill('Write the report');
  await page.getByRole('textbox', { name: 'Add a new task' }).press('Enter');
  const card = page.getByRole('article', { name: 'Write the report' });
  await card.getByRole('button', { name: 'Break down "Write the report" into steps' }).click();
  await expect(card.getByText('0 of 3 steps')).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    card.getByRole('button', { name: 'Add the steps of "Write the report" to your calendar' }).click(),
  ]);

  expect(download.suggestedFilename()).toBe('write-the-report.ics');
  const ics = await readFile(await download.path(), 'utf8');
  expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
  expect(ics).toContain('SUMMARY:Get what you need for: Write the report');
  await expect(page.getByText(/Saved "Write the report" as a calendar file, starting at/)).toBeVisible();
});
