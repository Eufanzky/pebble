# 2.7 Remove dead services: plan

1. Delete `app/services/`, the dead routers and schemas, `deploy.ps1` and `requirements.txt`.
2. Move request logging to `api/middleware.py`; put the Immersive Reader token behind a port.
3. Rewrite `main.py` and the settings; `uv remove` the dead dependencies.
4. Make warnings errors; add the architecture, app and reader tests.
5. Start the server with only `LLM_API_KEY` in an empty environment.
6. Rewrite `backend/README.md` and `.env.example`; fix the root README and `CLAUDE.md`; close A-008; tick 2.7.
