import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// AdaptLens (7.6): it notices a pattern in what you really did, and changes a preference only when you accept.

signInEachTest();

test('finishing broken-down tasks without their steps leads AdaptLens to suggest larger steps', async ({ page }) => {
  for (const title of ['Tidy the desk', 'Reply to Sam', 'Plan the week']) {
    await page.getByRole('textbox', { name: 'Add a new task' }).fill(title);
    await page.getByRole('textbox', { name: 'Add a new task' }).press('Enter');
    const card = page.getByRole('article', { name: title });
    await card.getByRole('button', { name: `Break down "${title}" into steps` }).click();
    await expect(card.getByText('0 of 3 steps')).toBeVisible();
    // Done, with every step still open
    await card.getByRole('button', { name: 'Mark as complete' }).click();
    await expect(page.getByRole('region', { name: /Done today/ }).getByRole('article', { name: title })).toBeVisible();
  }

  await page.reload();
  const suggestion = page.getByRole('region', { name: 'A suggestion from AdaptLens' });
  await expect(suggestion).toContainText('You finished 3 of your last 3 broken-down tasks with most of their steps');
  expect((await (await page.request.get('/api/preferences')).json()).stepSize).toBe('medium');

  await suggestion.getByRole('button', { name: 'Use large steps' }).click();

  await expect(suggestion).not.toBeVisible();
  await expect.poll(async () => (await (await page.request.get('/api/preferences')).json()).stepSize).toBe('large');
  await page.getByRole('link', { name: /Activity/ }).click();
  await expect(page.locator('.activity-entry', { hasText: 'Set your default step size to large, as you accepted' })).toBeVisible();
});
