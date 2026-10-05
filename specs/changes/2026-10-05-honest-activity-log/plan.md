# 7.3 An honest activity log: plan

1. Make the log read-only in the browser (no `addEntry` or `postActivity`); remove every call with a script that matches each call's closing parenthesis.
2. Clean up what only fed the entries (`openWhy`/`onWhyOpen`, `logReaderOpened`, `docTitle`, `sizeInKb`, stale dependencies and comments).
3. Remove `POST /api/activity`; tests seed entries through the log use case; a POST is a 405.
4. Turn "logs X" tests into "logs nothing in an agent's name"; remove the fake's POST and `expectLogged`.
5. Docs, audit (A-029 fixed), PR.
