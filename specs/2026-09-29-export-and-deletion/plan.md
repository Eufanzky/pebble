# 4.6 Data export and deletion: plan

1. Port, use cases and `SqlAccountDataStore` walking the metadata; endpoints; an in-memory fake for API tests.
2. Integration tests parametrized over every table: ownership, export, deletion, isolation; the outage test covers the new store.
3. `useAccountData` and the "Your data" section; MSW fakes; tests.
4. E2E: download the file, check its contents, delete, sign in again to an empty account. Docs; roadmap tick.
