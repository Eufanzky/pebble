# 2.6 Local document parsing: plan

1. `uv add pypdf python-docx`.
2. Add the domain types, the port, the use case and the adapter.
3. Write `make_fixtures.py` and generate the fixtures.
4. Wire the endpoint and the error mapping.
5. Add contract, use-case, domain and API tests; run them offline (`unshare -rn`).
6. Update the docs; tick 2.6.
