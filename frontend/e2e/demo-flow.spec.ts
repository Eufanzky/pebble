import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// The demo flow (specs/testing.md): dev login, break a task into steps, finish
// a step, simplify a document, and see the agent and its "why" in the activity log.

/** Each test signs in as a new dev user, so it starts from an empty account. */
async function devLogin(page: Page, path = '/today', name = `e2e-${Date.now()}`) {
  await page.goto(path);
  // Signed out: every page sends you to sign in, and back afterwards
  await expect(page).toHaveURL(/\/signin\?callbackUrl=/);
  await page.getByRole('textbox', { name: 'Name' }).fill(name);
  await page.getByRole('button', { name: `Sign in as ${name}` }).click();
  await expect(page).toHaveURL(path);
  return name;
}

async function freshStart(page: Page) {
  const name = await devLogin(page);
  // Animations off, so the flow doesn't wait on them (saved in the account, like any setting)
  expect((await page.request.patch('/api/preferences', { data: { reduceAnimations: true } })).ok()).toBe(true);
  await page.reload();
  return name;
}

/** The dev user the current test signed in as. */
let userName = '';

test.beforeEach(async ({ page }) => {
  userName = await freshStart(page);
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

  await test.step('a new list is empty and offers example tasks', async () => {
    await page.getByRole('button', { name: 'Add example tasks' }).click();
    await expect(page.getByRole('button', { name: /Break down "Read Chapter 4/ })).toBeVisible();
  });

  await test.step('break a task on Today into steps, and finish one', async () => {
    await page.getByRole('button', { name: /Break down "Read Chapter 4/ }).click();
    const step = page.locator('.subtask-item', { hasText: 'Skim the chapter headings first' });
    await step.getByRole('button', { name: 'Check subtask' }).click();
    await expect(step.getByRole('button', { name: 'Uncheck subtask' })).toBeVisible();

    // Saved in the backend: a reload shows the same list, with the step still done
    await expect
      .poll(async () => (await (await page.request.get('/api/tasks')).json())[0].subtasks[0].completed)
      .toBe(true);
    await page.reload();
    await page.getByRole('button', { name: /Break down "Read Chapter 4/ }).click();
    await expect(
      page.locator('.subtask-item', { hasText: 'Skim the chapter headings first' }).getByRole('button', {
        name: 'Uncheck subtask',
      }),
    ).toBeVisible();
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
    // A new user's log holds only what really happened in this flow (A-022),
    // including the second break-down after the reload
    await expect(page.getByText('Showing 5 of 5 entries')).toBeVisible();
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
  expect(exported.userId).toBe(`dev:${userName}`);
  expect(exported.data.tasks.map((t: { title: string }) => t.title)).toContain('Read Chapter 4 of the design textbook');
  expect(exported.data.task_steps.length).toBeGreaterThan(0);

  page.once('dialog', (dialog) => void dialog.accept());
  await page.getByRole('button', { name: 'Delete my account' }).click();
  await expect(page).toHaveURL(/\/signin/);

  // Signing in again under the same name starts from nothing
  await devLogin(page, '/today', userName);
  await expect(page.getByRole('button', { name: 'Add example tasks' })).toBeVisible();
  expect(await (await page.request.get('/api/tasks')).json()).toEqual([]);
});

test('editing, reordering and filtering the list (5.5)', async ({ page }) => {
  // Tall enough that every card is on screen: the drag below uses raw mouse moves, which don't scroll
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.getByRole('button', { name: 'Add example tasks' }).click();
  const todo = page.getByRole('region', { name: /To do/ });
  await expect(todo.getByRole('article')).toHaveCount(4);
  const titles = () => todo.getByRole('article').evaluateAll((cards) => cards.map((c) => c.getAttribute('aria-label')));

  // Edit
  await page.getByRole('button', { name: 'Edit "Take a 10-minute walk"' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit task' });
  await dialog.getByRole('textbox', { name: 'Title' }).fill('Take a short walk');
  await dialog.getByRole('button', { name: 'Save' }).click();
  await expect(todo.getByRole('article', { name: 'Take a short walk' })).toBeVisible();

  // Reorder by keyboard: the walk to the top
  await page.getByRole('button', { name: 'Move "Take a short walk"' }).focus();
  await page.keyboard.press('Home');
  await expect.poll(titles).toEqual([
    'Take a short walk',
    'Read Chapter 4 of the design textbook',
    "Reply to Professor Martinez's email",
    'Work on group project proposal',
  ]);

  // Reorder by dragging the handle: the email to the bottom
  const handle = page.getByRole('button', { name: `Move "Reply to Professor Martinez's email"` });
  const from = (await handle.boundingBox())!;
  const last = (await todo.getByRole('article').last().boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2, last.y + last.height - 4, { steps: 8 });
  await page.mouse.up();
  await expect.poll(titles).toEqual([
    'Take a short walk',
    'Read Chapter 4 of the design textbook',
    'Work on group project proposal',
    "Reply to Professor Martinez's email",
  ]);

  // Saved: the same order after a reload
  await page.reload();
  await expect.poll(titles).toEqual([
    'Take a short walk',
    'Read Chapter 4 of the design textbook',
    'Work on group project proposal',
    "Reply to Professor Martinez's email",
  ]);

  // Filter
  await page.getByRole('searchbox', { name: 'Search tasks' }).fill('walk');
  await expect.poll(titles).toEqual(['Take a short walk']);
});

test('what you finish adds up on the stats page (5.6)', async ({ page }) => {
  await page.getByRole('button', { name: 'Add example tasks' }).click();
  await page.getByRole('button', { name: /Break down "Read Chapter 4/ }).click();
  await page.locator('.subtask-item', { hasText: 'Skim the chapter headings first' }).getByRole('button', { name: 'Check subtask' }).click();
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

test('Pebble can be installed as an app, and has a calm offline page (5.8)', async ({ page, context }) => {
  // Chromium's own installability check (what decides whether "Install" is offered)
  const cdp = await context.newCDPSession(page);
  await page.goto('/today');
  await expect.poll(async () => (await cdp.send('Page.getInstallabilityErrors')).installabilityErrors).toEqual([]);

  const manifest = await (await page.request.get('/manifest.webmanifest')).json();
  for (const icon of manifest.icons) {
    const response = await page.request.get(icon.src);
    expect(response.headers()['content-type']).toBe('image/png');
  }

  // Once the service worker is in charge, a page that can't load shows the offline page
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.goto('/focus').catch(() => undefined);
  await expect(page.getByRole('heading', { name: 'Pebble needs a connection' })).toBeVisible();
  await context.setOffline(false);
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page).toHaveURL('/focus');
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

/** Elements (outside fixed and decorative layers) that run past the right edge of the screen. */
function overflowing(page: Page) {
  return page.evaluate(() => {
    const width = document.documentElement.clientWidth;
    return Array.from(document.querySelectorAll('body *'))
      .filter((el) => {
        if (el.closest('[aria-hidden="true"], [hidden]')) return false;
        const box = el.getBoundingClientRect();
        let node: Element | null = el;
        while (node) {
          if (getComputedStyle(node).position === 'fixed') return false;
          node = node.parentElement;
        }
        return box.width > 0 && box.height > 0 && box.right > width + 1;
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`);
  });
}

// Phone, tablet and laptop (roadmap 5.3)
const WIDTHS = [
  { width: 360, height: 780 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];

for (const path of ['/today', '/documents', '/stats', '/activity', '/focus', '/settings']) {
  for (const viewport of WIDTHS) {
    test(`${path} at ${viewport.width}px fits the screen, with no axe violations`, async ({ page }) => {
      await page.setViewportSize(viewport);
      // The backgrounds are drawn in CSS (5.2): no page loads a picture for them
      const pictures: string[] = [];
      page.on('request', (request) => {
        if (request.resourceType() === 'image' && !/favicon|icon/.test(request.url())) pictures.push(request.url());
      });
      await page.goto(path);
      // By role, not `h1`: while Next.js streams a page, a hidden copy of it
      // sits in <body> until it's swapped in
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      expect(await overflowing(page)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
      expect(pictures).toEqual([]);
    });
  }
}

test('phones get a bottom tab bar that moves between pages', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/today');
  const tabs = page.getByRole('navigation', { name: 'App sections' });
  const box = await tabs.boundingBox();
  expect(box!.y + box!.height).toBeGreaterThan(844 - 100);

  await tabs.getByRole('link', { name: 'Focus' }).click();
  await expect(page).toHaveURL('/focus');
  await expect(tabs.getByRole('link', { name: 'Focus' })).toHaveAttribute('aria-current', 'page');
  // Each tab is a comfortable target
  const tab = await tabs.getByRole('link', { name: 'Today' }).boundingBox();
  expect(tab!.height).toBeGreaterThanOrEqual(44);
  expect(tab!.width).toBeGreaterThanOrEqual(44);
});
