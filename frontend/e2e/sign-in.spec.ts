import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// Signed out, pages ask you to sign in and the API refuses; signing out works.

signInEachTest();

test('signed out, the API refuses and pages ask you to sign in', async ({ browser }) => {
  const page = await (await browser.newContext()).newPage();

  const api = await page.request.get('/api/preferences');
  expect(api.status()).toBe(401);

  await page.goto('/documents');
  await expect(page).toHaveURL('/signin?callbackUrl=%2Fdocuments');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Pebble is here when you're ready.");
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test('signing out goes back to the sign-in page', async ({ page }) => {
  await page.goto('/settings');
  // By role: while Next.js streams the page, a hidden copy of it can sit in <body>
  const account = page.getByRole('region', { name: 'Your account' });
  await expect(account.getByText(/^Signed in as e2e-\d+ with the dev login\.$/)).toBeVisible();
  await account.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/signin/);
  await page.goto('/today');
  await expect(page).toHaveURL(/\/signin\?callbackUrl=/);
});
