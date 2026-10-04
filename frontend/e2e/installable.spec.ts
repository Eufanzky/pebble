import { expect, test } from '@playwright/test';
import { signInEachTest } from './helpers';

// Installable, with a calm offline page (5.8).

signInEachTest();

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
