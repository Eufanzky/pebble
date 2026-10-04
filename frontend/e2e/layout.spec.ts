import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { signInEachTest, overflowing } from './helpers';

// Every page fits phone, tablet and laptop widths with no axe violations, and phones get a tab bar (5.3).

signInEachTest();

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
