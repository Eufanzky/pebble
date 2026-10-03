# 5.8 Installable app: requirements

Roadmap item: **5.8** (Phase 5). Branch: `feat/5.8-installable-app`.

## Goal

Pebble can be installed on a phone or desktop like an app, with its own icon, and says calmly when there's no connection instead of showing the browser's error page.

## Scope

- `app/manifest.ts`: name, standalone display, start on Today, the app's background and theme colour, icons (192, 512 and a maskable 512).
- Icons drawn from Pebble with rounded shapes and rendered to PNG at build time (`next/og`), plus an Apple touch icon and `appleWebApp` metadata.
- `public/sw.js` and `public/offline.html`; `useServiceWorker` registers it in production builds.
- Tests: the manifest, the registration hook, and an E2E for installability and the offline page.

## Decisions

1. **No image files.** Like the character and the backgrounds, the icon is shapes, rendered once at build time. The routes are static.
2. **The service worker caches only the offline page.** Caching the app would show stale tasks after a change on another device; Pebble needs the server for everything else anyway.
3. **Offline copy is calm and true:** "Pebble needs a connection. Your list is safe in your account. It'll be right here once you're back online." It's self-contained, so it works with nothing else loaded.
4. **Chromium's own check instead of Lighthouse.** Lighthouse 12 removed its PWA audits. The E2E asks the browser for `Page.getInstallabilityErrors`, which decides whether "Install" is offered; the roadmap's done text is updated.
5. **The service worker is registered in production builds only**, so it doesn't interfere with hot reloading.
6. **Icon routes have a dot in their names** (`pebble-192.png`), so the sign-in proxy lets them through, as browsers fetch them without a session.
