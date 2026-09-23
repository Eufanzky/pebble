# 0.2 Green build: plan

See `requirements.md` for scope and decisions, and `validation.md` for the merge check. All commands run from `pebble/`.

## 1. Prepare

1. Branch `fix/0.2-green-build` from an up-to-date `main`.
2. Run `npm ci`, then `npm run lint`, and confirm the baseline matches the audit: 8 errors and 2 warnings.

## 2. Dependencies (A-001, A-003); commit `fix: bump next to 16.3.6 and apply npm audit fixes (A-001, A-003)`

1. Set `next` and `eslint-config-next` to `16.3.6` in `package.json`, then `npm install`.
2. Run `npm audit fix` (no `--force`).
3. Check that `npm audit` shows only the advisories that come through `@microsoft/immersive-reader-sdk` (A-002).
4. Run `npm run build`. If the new `eslint-config-next` adds new lint findings, record them as new audit rows (A-009 and up) and fix them in group 5 or 6.

## 3. set-state-in-effect (A-004); commit `fix: remove synchronous setState in effects (A-004)`

1. `hooks/useReduceMotion.ts`: switch to `useSyncExternalStore`.
2. `hooks/useTimeOfDay.ts`: switch to `useSyncExternalStore` with an interval subscription.
3. `hooks/useLocalStorage.ts`: switch to `useSyncExternalStore` with a cached snapshot and same-tab notify, keeping the `[value, setValue, isHydrated]` return shape.
4. `components/pebble/PebbleSpeechBubble.tsx`: derive the message from props and key it on `message`.
5. `components/layout/AppShell.tsx`: rework `PageTransition` so it doesn't set state synchronously in its effect.
6. `components/documents/DocumentModal.tsx`: reset the per-open state on open without an effect.
7. Run `npm run lint`: no `set-state-in-effect` errors remain. Run `npm run build`: it passes.

## 4. Purity (A-005); commit `fix: move impure calls out of render (A-005)`

1. `components/documents/ComprehensionCheck.tsx`: lazy `useState` for the random order.
2. `contexts/ToastContext.tsx`: `useRef(0)` for the start time.
3. Run `npm run lint`: no `purity` errors remain.

## 5. Unused vars (A-006); commit `fix: remove unused variables (A-006)`

1. Remove `showToast` (and the `useToast` import if it becomes unused) in `app/focus/page.tsx`.
2. Remove `words` in `components/documents/ImmersiveReader.tsx`.
3. `npm run lint` now reports 0 problems.

## 6. Close out; commit `docs: record 0.2 results in audit and roadmap`

1. In `specs/audit.md`, add a **Status** column (or a status note per row): A-001 and A-003 to A-006 are marked fixed in 0.2. A-002 is marked deferred to 3.3 with its reason. Update the summary.
2. Tick **0.2** in `specs/roadmap.md`.
3. Run through `validation.md`.
4. Push and open the PR.
