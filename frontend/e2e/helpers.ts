import { expect, test, type Page } from '@playwright/test';

/** Each test signs in as a new dev user, so it starts from an empty account. */
export async function devLogin(page: Page, path = '/today', name = `e2e-${Date.now()}`) {
  await page.goto(path);
  // Signed out: every page sends you to sign in, and back afterwards
  await expect(page).toHaveURL(/\/signin\?callbackUrl=/);
  await page.getByRole('textbox', { name: 'Name' }).fill(name);
  await page.getByRole('button', { name: `Sign in as ${name}` }).click();
  await expect(page).toHaveURL(path);
  return name;
}

/** Signs in, then turns animations off so the tests don't wait on them (saved in the account, like any setting). */
async function freshStart(page: Page) {
  const name = await devLogin(page);
  expect((await page.request.patch('/api/preferences', { data: { reduceAnimations: true } })).ok()).toBe(true);
  await page.reload();
  return name;
}

/** Signs in as a new dev user before each test in the file; `user.name` is the current one. */
export function signInEachTest() {
  const user = { name: '' };
  test.beforeEach(async ({ page }) => {
    user.name = await freshStart(page);
  });
  return user;
}

/** Elements (outside fixed and decorative layers) that run past the right edge of the screen. */
export function overflowing(page: Page) {
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
