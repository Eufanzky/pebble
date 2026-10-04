# 2.9 Backend coverage floor: plan

1. Measure: 100% on domain + application, 96% overall, with `api/auth.py` the only real gap.
2. Add auth tests.
3. Set `fail_under = 80`; add the layer-floor step to CI.
4. Show both floors failing on a thin run (only `test_health.py`) and passing on the full suite.
5. Update the docs; tick 2.9.
