# 3.3 Documents: plan

1. Move the document components, sample data and types into `features/documents`.
2. Pull the text logic into `lib/`, the state and side effects into hooks, and the token call into `api/`. Add `getJson`, `useFocusTrap` and `useFadeIn` to `shared/`.
3. Split the modal, the reader and the document card into small components; add `DocumentsView`; make the page thin.
4. Add the MSW reader handlers with a 503 default.
5. Tests: every `lib/` module and hook; `DocumentModal` (slider, views, comprehension, tasks, Escape, the reader fallback), `ComprehensionCheck`, `ImmersiveReader` (loading, fallback, Azure, each tool), `DocumentsView` (open, upload, rejected file); `useFocusTrap` and `useFadeIn`.
6. Run lint, typecheck, tests and the build; load `/documents` from `next start`.
7. Log A-019; update CLAUDE.md and the README; tick 3.3.
