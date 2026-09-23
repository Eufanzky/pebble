# 0.2 Green build: validation

The PR can be merged when every check below passes. Run the checks from `pebble/` after a clean `npm ci`.

## Static gates

- [ ] `npm run build` exits 0.
- [ ] `npm run lint` exits 0 and reports **0 errors and 0 warnings**.
- [ ] `npx tsc --noEmit` exits 0.
- [ ] `npm audit` reports **no critical advisories**. Any remaining high or lower advisories come only through `@microsoft/immersive-reader-sdk` (A-002, deferred).
- [ ] `package.json` pins `next` and `eslint-config-next` to `16.3.6`, and `package-lock.json` is committed.

## Lint rules not weakened

- [ ] `eslint.config.mjs` is unchanged: no rule has been turned off or downgraded.
- [ ] Every `eslint-disable` added in this PR is `-next-line`, names its rule, and gives a `-- reason`. Check with `git diff main -- src | grep eslint-disable`. Ideally there are none.

## Scope and bookkeeping

- [ ] The diff touches only `pebble/` and `specs/`. `backend/` and `demo/` are untouched.
- [ ] `specs/audit.md` gives the status of A-001 to A-006 (fixed, or deferred with a reason), and the summary is updated.
- [ ] **0.2** is ticked in `specs/roadmap.md`.
