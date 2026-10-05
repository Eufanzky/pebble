# 7.2 SimplifyCore on Documents: plan

1. `DocumentItem.source`; uploads with no levels; `excerptForSimplifying`; `simplifyText`.
2. `useDocumentText` (ask per level after the slider rests, cache, failure and retry), `SimplifiedText` for both views, the toolbar waits for action items, "Example" chips.
3. Backend: a 12,000-character cap; the fake LLM finds action items.
4. Tests: the hook through the modal (each state, once per level, level 10, retry, tasks, the long-text and groundedness notes, the log reload), axe on the new states, the excerpt cut; the E2E uploads a file and adds its action item.
5. Docs, audit, PR.
