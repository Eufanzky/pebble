# 6.2 A clearer structure: validation

- [x] `tokens.test.ts`: no colour token outside `tokens.css` (bar the Pebble colour defaults); no undefined `var(--…)` anywhere in `src/`.
- [x] `docs-links.test.ts`: every relative link in the README, CLAUDE.md, the backend READMEs and the specs resolves.
- [x] `npm test` (537), lint, knip, `tsc`, build; E2E 27/27 (every page at three widths with axe).
