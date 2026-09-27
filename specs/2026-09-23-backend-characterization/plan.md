# 1.3 Backend characterization tests: plan

All commands run from `backend/`.

1. Branch `test/1.3-backend-characterization` from `main`.
2. Check whether respx can intercept the `openai` SDK. It can't (vendored `httpx2`), so fake the LLM at `get_openai_client` / `get_kernel`.
3. Add `tests/fakes.py` (`FakeLLM`, `FakeContentSafety`) and the `llm`, `content_safety` and `content_safety_http` fixtures in `tests/conftest.py`.
4. Add `tests/api/test_chat.py` and `tests/unit/test_pii_detector.py`; `uv run pytest` passes on untouched `app/` code.
5. Break the code by hand (threshold, redaction, routing, safety order, output check, distress routing) and check that tests fail each time, then revert.
6. Log A-012 and A-013 in `specs/audit.md`; update `backend/README.md` and `CLAUDE.md`; tick 1.3 in `specs/roadmap.md`.
7. Run through `validation.md`, push, and open the PR.
