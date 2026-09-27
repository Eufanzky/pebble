# 2.9 Backend coverage floor: validation

- [x] `uv run pytest --cov` passes at 96.7% (334 passed).
- [x] With only `tests/api/test_health.py`, `pytest --cov` exits 1 ("Required test coverage of 80.0% not reached"), and the layer report exits 2.
- [x] CI runs both floors and is green on this PR.
