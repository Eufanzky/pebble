import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// The demo flow (specs/testing.md): dev login, break a task into steps, finish
// a step, simplify a document, and see the agent and its "why" in the activity log.

async function devLogin(page: Page, path = '/today') {
  await page.goto(path);
  // Signed out: every page sends you to sign in, and back afterwards
  await expect(page).toHaveURL(/\/signin\?callbackUrl=/);
  await page.getByRole('textbox', { name: 'Name' }).fill('e2e');
  await page.getByRole('button', { name: 'Sign in as e2e' }).click();
  await expect(page).toHaveURL(path);
}

async function freshStart(page: Page) {
  await devLogin(page);
  await page.evaluate(() => {
    window.localStorage.clear();
    // Animations off, so the flow doesn't wait on them
    window.localStorage.setItem('pebble-preferences', JSON.stringify({ reduceAnimations: true }));
  });
  await page.reload();
}

test.beforeEach(async ({ page }) => {
  await freshStart(page);
});

test('the demo flow', async ({ page }) => {
  await test.step('break a task into steps with CalmSense, through the real backend', async () => {
    await page.getByRole('button', { name: 'Chat with Pebble' }).click();
    const chat = page.getByRole('dialog', { name: 'Chat with Pebble' });
    await chat.getByRole('textbox', { name: 'Message to Pebble' }).fill('Help me break down writing my essay');
    await chat.getByRole('button', { name: 'Send message' }).click();
    await expect(chat.getByText('CalmSense')).toBeVisible();
    await expect(chat.getByText("Let's do this together.")).toBeVisible();
    await page.getByRole('button', { name: 'Close chat', exact: true }).click();
  });

  await test.step('break a task on Today into steps, and finish one', async () => {
    await page.getByRole('button', { name: /Break down "Read Chapter 4/ }).click();
    const step = page.locator('.subtask-item', { hasText: 'Skim the chapter headings first' });
    await step.getByRole('button', { name: 'Check subtask' }).click();
    await expect(step.getByRole('button', { name: 'Uncheck subtask' })).toBeVisible();
  });

  await test.step('simplify a document', async () => {
    await page.getByRole('link', { name: /Documents/ }).click();
    await page.getByRole('button', { name: /Design Thinking Syllabus/ }).click();
    const doc = page.getByRole('dialog', { name: 'Design Thinking Syllabus' });
    await doc.getByRole('slider', { name: 'Complexity (FK)' }).fill('2');
    await expect(doc.getByTestId('simplified-text')).toContainText("This class is about making things people actually want.");
    await expect(doc.getByText('Showing level 2.')).toBeVisible();
    await doc.getByRole('button', { name: 'Close document' }).click();
  });

  await test.step('see the agent and its "why" in the activity log', async () => {
    await page.getByRole('link', { name: /Activity/ }).click();
    // A new user's log holds only what really happened in this flow (A-022)
    await expect(page.getByText('Showing 4 of 4 entries')).toBeVisible();
    const entry = page.locator('.activity-entry', { hasText: 'Reading level adjusted to 2' });
    await expect(entry.getByText('AdaptLens', { exact: true })).toBeVisible();
    await entry.getByRole('button', { name: 'Show reasoning' }).click();
    await expect(entry.getByText('User manually changed reading level from 5 to 2.')).toBeVisible();

    const chat = page.locator('.activity-entry', { hasText: 'Chat: decompose' });
    await expect(chat.getByText('CalmSense', { exact: true })).toBeVisible();
  });
});

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
  await expect(page.getByText('Signed in as e2e with the dev login.')).toBeVisible();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/signin/);
  await page.goto('/today');
  await expect(page).toHaveURL(/\/signin\?callbackUrl=/);
});

for (const path of ['/today', '/documents', '/activity', '/focus', '/settings']) {
  test(`${path} has no axe violations`, async ({ page }) => {
    await page.goto(path);
    // By role, not `h1`: while Next.js streams a page, a hidden copy of it
    // sits in <body> until it's swapped in
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });
}
