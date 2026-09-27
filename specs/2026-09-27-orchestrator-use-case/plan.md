# 2.4 Orchestrator and CalmSense as use cases: plan

1. Move the prompts to `application/`; add the domain types.
2. Write `parse_json_object`, `DecomposeTask` and `HandleChat`.
3. Wire them in `api/dependencies.py`; add `api/errors.py`; make the router thin; point the legacy LLM and safety helpers at the ports; adapt the legacy SimplifyCore and PebbleVoice behind protocols.
4. Delete the legacy orchestrator, CalmSense, Semantic Kernel glue and the PII shim.
5. Port the 1.3 tests; add use-case, CalmSense and `/decompose` tests.
6. Break the pipeline by hand, one mutation at a time, with file backups.
7. Run the server with `LLM_PROVIDER=fake`; update the docs, the audit and the roadmap.
