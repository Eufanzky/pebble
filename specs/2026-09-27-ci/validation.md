# 1.6 CI: validation

- [x] The workflow runs on the PR, and both jobs are green.
- [x] The frontend job runs lint, `tsc --noEmit`, tests (with the guilt scan) and the build.
- [x] The backend job runs `uv sync --locked`, `ruff check` and `pytest`.
- [x] The README badge points at the workflow, and 1.6 is ticked in `specs/roadmap.md`.
