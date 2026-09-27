# 2.5 SimplifyCore and PebbleVoice as use cases: plan

1. Add the domain types.
2. Write `SimplifyDocument` and `Encourage`; type the `HandleChat` protocols with them.
3. Wire them; make `/simplify` and `/motivate` thin; move the mappers to `api/presenters.py`; point the documents and focus routers at the use cases.
4. Delete `app/agents/` and `services/openai_client.py`.
5. Add use-case and API tests; run the server with the fake LLM.
6. Update the docs; tick 2.5.
