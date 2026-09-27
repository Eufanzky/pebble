# 1.6 CI: plan

1. Branch `chore/1.6-ci` from `main`.
2. Look up the current action versions (`gh api repos/<action>/releases/latest`).
3. Write `.github/workflows/ci.yml` with the frontend and backend jobs.
4. Open the PR and watch the run; fix until both jobs are green.
5. Add the README badge; update `CLAUDE.md`; tick 1.6.
