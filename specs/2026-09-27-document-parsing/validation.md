# 2.6 Local document parsing: validation

- [x] Contract tests read the PDF (2 pages), the .docx (paragraphs and a table) and text in three encodings, and reject the corrupt, encrypted and unsupported files.
- [x] API tests: each format parses; unusable files get 422, unsupported 415, too large 413.
- [x] The parsing tests pass with no network (`unshare -rn uv run --offline pytest ...`).
- [x] Parsing writes nothing to disk.
- [x] `uv run pytest` (302 passed) and `ruff check` pass; `uv.lock` is updated.
