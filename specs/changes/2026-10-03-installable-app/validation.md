# 5.8 Installable app: validation

- [x] Chromium reports no installability errors on `/today` (E2E over the DevTools protocol).
- [x] Every manifest icon is served as a PNG without sign-in; the manifest has 192, 512 and maskable 512 icons, starts on `/today`, and uses the app's colours (unit test).
- [x] Offline, a page that can't load shows "Pebble needs a connection", and "Try again" loads the page once back online (E2E).
- [x] The service worker registers only in production builds, and only where supported (unit tests).
- [x] `npm test` with the coverage floor, lint, `tsc`, build; full E2E.
