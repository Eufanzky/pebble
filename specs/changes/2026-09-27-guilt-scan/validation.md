# 1.5 Guilt scan: validation

Run from `pebble/`.

- [x] `npm test` passes and includes the guilt scan.
- [x] `npm run lint` and `npx tsc --noEmit` pass.
- [x] Each planted violation fails the scan with its file and line:
  - [x] "overdue" in a sample task title
  - [x] `color: 'crimson'` in a component
  - [x] `color: red` in `globals.css`
  - [x] "keep your streak" in `prompts.py`
- [x] Rewording the excepted `prompts.py` line fails the stale-exception check.
- [x] A-015 is logged in `specs/audit.md`, and 1.5 is ticked in `specs/roadmap.md`.
