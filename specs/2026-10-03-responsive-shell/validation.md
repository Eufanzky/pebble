# 5.3 Responsive shell: validation

- [x] Every page at 360, 768 and 1280px: nothing runs past the right edge, no horizontal scroll, axe passes (15 E2E tests).
- [x] Phones: the tab bar sits at the bottom, moves between pages, marks the current one, and each tab is at least 44 by 44px.
- [x] The sidebar collapses to a named icon rail and back, and remembers it on the device.
- [x] Page changes fade, and swap at once with reduced motion.
- [x] Skip link, `aria-current` and focus on navigation still pass; axe on the shell passes.
- [x] E2E 21/21; `npm test` with the coverage floor, lint, `tsc`, build.
