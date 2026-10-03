# 5.2 Ambient backgrounds: validation

- [x] The background is decorative (`aria-hidden`), has no images, and drifts by default.
- [x] It holds still with reduce animations and with calm mode (component tests), and with the OS setting (CSS media query).
- [x] No page requests a picture (E2E, every page); axe passes on every page.
- [x] The sign-in page renders (the E2E caught a crash from a missing provider, now fixed).
- [x] E2E 10/10 twice; `npm test`, lint, `tsc`, build.
