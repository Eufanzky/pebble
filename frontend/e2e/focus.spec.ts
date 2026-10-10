import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// A focus session on one step (9.2), through the real backend: start it from Today, stop early, mark the step done.

signInEachTest();

test('a focus session starts from a step, can stop early, and can mark the step done', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Add a new task' }).fill('Write the report');
  await page.getByRole('textbox', { name: 'Add a new task' }).press('Enter');
  const card = page.getByRole('article', { name: 'Write the report' });
  await card.getByRole('button', { name: 'Break down "Write the report" into steps' }).click();
  await expect(card.getByText('0 of 3 steps')).toBeVisible();

  await card.getByRole('link', { name: 'Focus on "Get what you need for: Write the report"' }).click();
  await expect(page).toHaveURL(/\/focus\?task=.+&step=.+/);
  const focus = page.getByRole('region', { name: 'Focus timer' });
  await expect(focus.getByText('Get what you need for: Write the report')).toBeVisible();

  await focus.getByRole('button', { name: 'Start focus session' }).click();
  await focus.getByRole('button', { name: 'Stop' }).click();
  await expect(focus.getByText('Stopped. Come back whenever you like.')).toBeVisible();
  await expect(focus.getByRole('timer', { name: 'Time left' })).toHaveText('25:00');

  await focus.getByRole('button', { name: 'Mark this step done' }).click();
  await expect(focus.getByText('Step done.')).toBeVisible();
  await focus.getByRole('link', { name: 'Back to Today' }).click();
  await expect(page.getByRole('article', { name: 'Write the report' }).getByText('1 of 3 steps')).toBeVisible();
});
