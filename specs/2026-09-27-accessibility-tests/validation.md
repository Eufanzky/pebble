# 3.6 Accessibility tests: validation

- [x] Axe: no violations in the six views and five interactive states, or in the shell.
- [x] A button without a name makes axe report `button-name`, so the check is live.
- [x] Keyboard: skip link, `aria-current`, focus on navigation (not on first load), modal trap and focus return, reader trap and focus return.
- [x] `npm test`, lint and `tsc --noEmit` pass.
