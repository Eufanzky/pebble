# 0.1 Audit: plan

See `requirements.md` for scope and decisions, and `validation.md` for the merge check.

## 1. Prepare

1. Confirm the branch is `docs/0.1-audit` and up to date with `main`.
2. Record the environment: `node -v`, `npm -v`, `python --version`, the OS and today's date.
3. Create `specs/audit.md` with the header, the severity legend, empty section tables and the summary placeholder.

## 2. Frontend install and build

1. In `pebble/`, run a clean `npm install` (delete `node_modules` first) and capture the output to the scratchpad.
2. Record install errors, peer-dependency warnings and `npm audit` notices under **Frontend install**.
3. Run `npm run build` and record each compile or build error under **Frontend build**, with its file and line.

## 3. Frontend lint and types

1. Run `npm run lint`. Group the findings by rule (one row per rule, with the count and the files) under **Frontend lint**.
2. Run `npx tsc --noEmit`. Record each type error under **Frontend types**, deduplicating any that already appear under the build.

## 4. Backend install and imports

1. Create a clean Python 3.12 virtual environment in the scratchpad. Run `pip install -r backend/requirements.txt` and record failures and resolver warnings under **Backend install**.
2. From `backend/`, run `python -m compileall app` and record syntax errors.
3. Import each module under `app/` on its own (a small loop over `agents`, `models`, `routers`, `services`, `config` and `main`) with an empty `.env`, and record each `ImportError` or import-time exception under **Backend imports**.

## 5. Triage

1. Give each row a severity using the scale in `requirements.md`.
2. Fill in **Fix in** for each row: `0.2` for build, lint and type errors, `1.7` for runtime issues, or the later item that deletes or rewrites the code.
3. Fill in the summary count by severity.

## 6. Close out

1. Tick **0.1** in `specs/roadmap.md`.
2. Run through `validation.md`.
3. Commit with `docs: audit current build and import state (0.1)` and open the PR.
