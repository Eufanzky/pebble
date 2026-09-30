# 4.6 Data export and deletion: requirements

Roadmap item: **4.6** (Phase 4). Branch: `feat/4.6-export-and-deletion`.

## Goal

Principle 3 (privacy first): users can download everything Pebble stores about them, and delete their account.

## Scope

- Backend: the `AccountDataStore` port, `ExportAccountData` and `DeleteAccount`, `SqlAccountDataStore`, `GET /api/account/export` and `DELETE /api/account`.
- Frontend: "Your data" in the settings account section: download as a JSON file, delete after asking, then sign out.
- Tests from the ORM metadata, per `testing.md`: export includes every user-owned table; deletion leaves zero rows for the user in each.

## Decisions

1. **Driven by the table metadata, not a hand-kept list.** A table belongs to a user through `user_id` or a foreign key to a table that has it. A table with neither is refused at run time and fails the integration test, so a new table can't be left out of export or deletion.
2. **The export is every row, as stored.** Table by table, JSON-ready (UUIDs and times as strings), with `exportedAt` and `userId`. It's complete and machine-readable rather than pretty. Documents aren't in it because they're never stored.
3. **Deletion is one transaction.** Children first, then parents. If it fails, nothing is removed, and the UI says so.
4. **Delete asks first, then signs out.** The confirmation says plainly what goes and that it can't be undone, without alarm styling (principle 1). Signing in again with the same provider starts a fresh, empty account.
5. **The download happens in the browser.** The JSON comes through the signed proxy like any call and is saved as `pebble-data-<date>.json`; the response is `no-store`.
