# 10.1 Backend Dockerfile: plan

1. `backend/Dockerfile` (two stages, uv, non-root, migrate then serve, health check) and `.dockerignore`.
2. `tests/unit/test_dockerfile.py`: secrets stay out, locked deps without dev, the health check names a real route, migrate before serve on `$PORT`.
3. The `backend` service in `docker-compose.yml`.
4. CI: a Docker job, and E2E against the image (`E2E_BACKEND_IMAGE` in `playwright.config.ts`).
5. Docs (READMEs, CLAUDE.md, testing and tech-stack specs), roadmap, PR.
