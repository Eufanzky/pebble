# 0.1 Audit: validation

The PR can be merged when every check below passes.

## Every issue is tagged

- [ ] Every row in `specs/audit.md` has an ID (`A-###`), a severity from the agreed scale, a one-line description, repro steps (a command, or a file and line) and a **Fix in** roadmap item.
- [ ] No issue is missing. Re-run each command from the plan and check that every error it prints appears in `audit.md`:
  - [ ] `npm install`
  - [ ] `npm run build`
  - [ ] `npm run lint` (every rule that fires has a row)
  - [ ] `npx tsc --noEmit`
  - [ ] `pip install -r requirements.txt`
  - [ ] `python -m compileall app`
  - [ ] the per-module import check
- [ ] The summary counts match the rows in the tables.

## PR hygiene (from `CLAUDE.md`)

- [ ] **0.1** is ticked in `specs/roadmap.md` in this PR.
