# 1.3 Backend characterization tests: validation

Run from `backend/`.

- [ ] `uv run pytest` passes (2 strict `xfail` for A-012), with no warnings.
- [ ] `uv run ruff check` passes.
- [ ] `git diff main -- app` is empty.
- [ ] Each of these hand-made breaks fails at least one test:
  - [ ] `SEVERITY_THRESHOLD = 3`
  - [ ] the classifier gets the raw message instead of the redacted one
  - [ ] the classifier output is no longer PII-redacted
  - [ ] the classifier output is no longer safety-checked
  - [ ] Content Safety runs before Prompt Shields
  - [ ] CalmSense is reported as another agent
  - [ ] distress calls a sub-agent
- [ ] Redacting the message passed to the decompose and simplify sub-agents turns the two A-012 `xfail`s into failures (strict).
- [ ] With no network, the suite still passes (respx blocks unmocked requests to the Content Safety endpoint).
- [ ] A-012 and A-013 are logged in `specs/audit.md`, and 1.3 is ticked in `specs/roadmap.md`.
