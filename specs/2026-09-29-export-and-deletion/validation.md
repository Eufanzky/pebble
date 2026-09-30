# 4.6 Data export and deletion: validation

- [x] Every table has an owner (`user_id` or a foreign key to one); a table without one is refused.
- [x] The export has every table and only the user's rows, and is valid JSON (parametrized over the metadata).
- [x] Deleting an account leaves zero rows for that user in every table and doesn't touch other users (parametrized).
- [x] API: download headers and shape, deletion, 401 signed out, 503 without a database.
- [x] UI: download saves a dated JSON file; delete asks first, then signs out; failures say so gently and nothing is removed.
- [x] E2E: the downloaded file holds the user's tasks and steps; after deleting, the same dev name signs in to an empty account. 10/10 locally.
- [x] Backend 544 passed with floors and ruff; frontend 441 passed with the coverage floor, lint, `tsc`, build.
