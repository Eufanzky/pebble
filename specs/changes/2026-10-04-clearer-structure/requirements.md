# 6.2 A clearer structure: requirements

Roadmap item: **6.2** (Phase 6). Branch: `refactor/6.2-clearer-structure`.

## Goal

The repo is easy to find your way in, and the styles have one source of truth.

## Scope

- The 42 dated spec folders move from `specs/` to `specs/changes/`, with an index (`specs/changes/README.md`: date, item, link). `specs/` itself now holds only the five living documents and `changes/`.
- The old global tokens (`--accent-*`, `--text-primary/secondary/muted`, `--bg-deep`, `--bg-surface`, `--border-soft`, `--glass-*`) are replaced by the design tokens in 43 files and removed. `--color-sky` joins `tokens.css` for the one agent mark that used it. `globals.css` keeps only app-wide rules and the Pebble colour defaults.
- The roadmap's phone rules move from `globals.css` into the tasks feature (`Roadmap.css`).
- Two new tests: `tokens.test.ts` (colours defined only in `tokens.css`; every `var(--…)` used is defined somewhere) and `docs-links.test.ts` (relative links in the repo's Markdown resolve).

## Decisions

1. **Old tokens map onto the new ones, not one by one onto the same values.** `--accent-lavender` becomes `--color-accent` (the user's Pebble colour, which was lavender by default), the four accent hues become the tag colours they already matched, and text, surfaces and lines take the new three-step scales. With the default colour nothing looks different.
2. **`--pebble-light` is now a tint of the user's Pebble colour.** It used to be a fixed lavender tint whatever colour Pebble was; the usage test found it when the old definition was removed.
3. **The root stays as is.** After 6.1 it holds only what a newcomer needs: the two apps, the specs, the compose file, the CI, the licence and the docs.
