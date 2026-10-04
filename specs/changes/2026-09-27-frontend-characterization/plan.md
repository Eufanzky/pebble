# 1.4 Frontend characterization tests: plan

All commands run from `pebble/`.

1. Branch `test/1.4-frontend-characterization` from `main`.
2. Add the shared chat handlers and the `scrollIntoView` stub in `src/test/`.
3. Add `contexts/TasksContext.test.tsx`, extend `contexts/PreferencesContext.test.tsx`, and add `components/chat/PebbleChat.test.tsx` and `app/today/page.test.tsx`.
4. Break the code by hand (mood threshold, flash length, reduce-animations class, chat error, step toggle) and check that tests fail each time, then revert.
5. Log A-014 in `specs/audit.md`; update `CLAUDE.md`; tick 1.4 in `specs/roadmap.md`.
6. Run through `validation.md`, push, and open the PR.
