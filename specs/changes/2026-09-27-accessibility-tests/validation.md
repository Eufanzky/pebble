# 3.6 Accessibility tests: validation

- [x] Axe: no violations in the six views and five interactive states, or in the shell.
- [x] A button without a name makes axe report `button-name`, so the check is live.
- [x] Keyboard: skip link, `aria-current`, focus on navigation (not on first load), modal trap and focus return, reader trap and focus return.
- [x] `npm test`, lint and `tsc --noEmit` pass.
- [x] Three full local runs in a row pass (377 tests). Full-view renders timed out at the default 5 s under parallel load on WSL, so `testTimeout` is 15 s, with the reason in `vitest.config.mts`.
