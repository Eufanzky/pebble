# 0.2 Green build: requirements

Roadmap item: **0.2 Green build** (Phase 0: Baseline). Branch: `fix/0.2-green-build`.

## Goal

Fix every issue that `specs/audit.md` assigns to 0.2, so the frontend's static gates pass with no errors and no warnings. That gives phase 1 (tests and CI) a clean baseline to lock in.

## Context

- The 0.1 audit (#6) found that `npm run build` and `npx tsc --noEmit` already pass. The failing gate is `npm run lint`: 8 errors and 2 warnings.
- 0.2 also owns three dependency advisories (A-001 to A-003).
- There is no test suite yet (that's 1.2), so this item is checked with the static gates only (see `validation.md`). Behaviour changes are kept to the minimum the lint rules need.
- Everything here is frontend (`pebble/`). The backend has no 0.2 items.
- See `mission.md` for the product principles and `tech-stack.md` for the target structure. Phase 3 moves these files into `features/`; 0.2 fixes them where they are now.

## Scope

In scope: audit items A-001 to A-006.

| ID | Issue | Fix |
|:--|:--|:--|
| A-001 | `next@16.2.1` critical advisory | Bump `next` and `eslint-config-next` to `16.3.6`. |
| A-002 | `@microsoft/immersive-reader-sdk` high advisory (only fix is a downgrade) | **Deferred** to 3.3. Record the reason in `audit.md`. |
| A-003 | 9 transitive advisories | `npm audit fix` (non-force). |
| A-004 | `react-hooks/set-state-in-effect` × 6 | Refactor (see Decisions). |
| A-005 | `react-hooks/purity` × 2 | Refactor (see Decisions). |
| A-006 | `no-unused-vars` × 2 | Remove the unused bindings. |

Out of scope:
- A-007 (backend lockfile, 1.1) and A-008 (Semantic Kernel warning, 2.7).
- Any new features, restyling, or moving files into `features/`.
- Tests: the tooling arrives in 1.2, and characterization tests in 1.4.

## Decisions

1. **Refactor first; `eslint-disable` only as a last resort.** Use the idiomatic React 19 pattern for each lint error. A `// eslint-disable-next-line <rule> -- <reason>` is allowed only where an effect really is syncing with something outside React, and each one must give its reason. The rules stay at `error` in `eslint.config.mjs`.
2. **Planned fix per file:**
   - `hooks/useReduceMotion.ts`: read `matchMedia` through `useSyncExternalStore`, with a `false` server snapshot. Note: nothing currently imports this hook.
   - `hooks/useTimeOfDay.ts`: `useSyncExternalStore` with a 60 s interval subscription and a `'day'` server snapshot, so SSR output doesn't change.
   - `hooks/useLocalStorage.ts`: `useSyncExternalStore` over `localStorage`. The server snapshot is `defaultValue`. The client snapshot is cached against the raw string, so the parsed value stays referentially stable and doesn't loop. `setValue` writes the value and notifies subscribers in the same tab. It must still return `[value, setValue, isHydrated]`, because `PreferencesContext` exposes `isHydrated`.
   - `components/layout/AppShell.tsx` (`PageTransition`): drop the effect's synchronous `setDisplayChildren` in the unchanged-path branch. Render `children` directly when there is no transition, and keep the timed swap only for the fade-out on navigation.
   - `components/pebble/PebbleSpeechBubble.tsx`: derive `displayMessage` from props and key the bubble on `message`, so a new message remounts it and replays the animation.
   - `components/documents/DocumentModal.tsx`: reset the per-open state (`showCheck`, `showOriginal`, `level`) when the modal opens, not in an effect. Use either the "adjust state while rendering" pattern keyed on `isOpen` or a `key` from the parent. Keep `requestAnimationFrame(() => setVisible(true))`, which is async and not flagged.
   - `components/documents/ComprehensionCheck.tsx`: `useState(() => Math.random() > 0.5)`.
   - `contexts/ToastContext.tsx`: `useRef(0)` for `startTimeRef`. `startTimer` already sets it before it is read.
3. **Hydration must not regress.** Server snapshots match what the server renders today (`defaultValue`, `'day'`, `false`), so the first client render still matches the HTML, then updates.
4. **Dependencies:** pin `next` and `eslint-config-next` to the exact version `16.3.6`, as they are pinned today. Commit the updated `package-lock.json`. Run `npm audit fix` without `--force`.
5. **Commits:** one per audit ID group (see `plan.md`). The PR is squash-merged.

## Open questions

- None. If a refactor turns out to need a real behaviour change, stop and fall back to a justified `eslint-disable` for that line, and record it in `audit.md`.
