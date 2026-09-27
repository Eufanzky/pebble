# 3.4 Settings, activity, and companion: plan

1. Move the old folders into `features/` and `shared/` with `git mv`; split `lib/types.ts` and `lib/constants.ts` into each feature's types; rewrite the imports; add each feature's `index.ts`.
2. Add `reduceMotion` to the preferences context and switch every component to it (A-010); remove `useReduceMotion`.
3. Split the activity, settings and focus pages into views, components, hooks and `lib/`; make every page thin.
4. Pull the companion's mood and message logic into `lib/`.
5. Tests: the settings toggles and screen, the hooks (with fake timers), the `lib/` modules, the views, and A-010.
6. Run lint, typecheck, tests and the build; load every page from `next start`.
7. Update CLAUDE.md, the README, `tech-stack.md` and the audit; tick 3.4.
