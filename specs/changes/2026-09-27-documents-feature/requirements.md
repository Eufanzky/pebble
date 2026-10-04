# 3.3 Documents: requirements

Roadmap item: **3.3** (Phase 3). Branch: `refactor/3.3-documents-feature`.

## Goal

Split `DocumentModal` (436 lines), `ImmersiveReader` (576 lines) and the documents page into `features/documents`, with no file over ~200 lines, and test the reading-level slider, the comprehension check and the built-in reader fallback.

## Scope

In scope:
- `features/documents/`:
  - `types.ts` (`DocumentItem` and its parts, moved out of `lib/types.ts`) and `data/sampleDocuments.ts`
  - `lib/`: `readingLevel.ts`, `syllables.ts`, `partsOfSpeech.ts`, `translation.ts`, `reader.ts`, `upload.ts`
  - `api/immersiveReader.ts`: fetches the token, then loads the SDK
  - `hooks/`: `useReadingLevel`, `useDocumentActions`, `useDocumentUpload`, `useComprehensionCheck`, `useReadAloud`, `useImmersiveReader`
  - `components/`: `DocumentsView`, `DocumentCard`, `UploadZone`, `DocumentModal` with `DocumentHeader`, `DocumentToolbar`, `ReadingLevelSlider`, `SplitView`, `ReaderView`, `LevelNote`, `ComprehensionPrompt`, `ComprehensionCheck`, `MiniPebble`; `ImmersiveReader` with `BuiltInReader`, `ToolButton`, `LanguageMenu`, `ReaderText`, `ReaderBanners`, `LineFocusOverlay`
  - `testing.ts` (`testDocument()`) and `index.ts`
- `shared/`: `getJson` next to `postJson`; `hooks/useFocusTrap` and `hooks/useFadeIn`.
- MSW: `readerHandlers` (`token`, `unavailable`); the token endpoint answers 503 by default.
- `app/documents/page.tsx` renders the background and `DocumentsView`.

Out of scope:
- Copy that credits services the app doesn't use (logged as A-019, fixed next).
- Axe checks and the keyboard suite (3.6).

## Decisions

1. **Modals mount while open.** `DocumentModal` and `ImmersiveReader` lose their `isOpen` props; the parent renders them conditionally. The reset-on-open state juggling goes away.
2. **One focus trap, shared.** `useFocusTrap` focuses the first control, wraps Tab, handles Escape and restores focus on unmount. The built-in reader is now a labelled modal dialog with its own trap, and the document modal's trap is paused while the reader is open. Before, Escape in the reader closed both.
3. **The token comes first, then the SDK.** The SDK is only loaded when the backend can hand out a token.
4. **Behaviour is pinned, not fixed.** The syllable splitter is naive (`pro·to·ty·pe`); its tests record what it does today.
5. **Small accessibility fixes that came with the split:** the reader's toolbar toggles expose `aria-pressed`, the Translate button `aria-expanded`, the text-size buttons have names ("Smaller text", "Bigger text"), the upload input is labelled, decorative glyphs are `aria-hidden`, and the answered comprehension choices are `aria-disabled`.
6. **Reader view padding is no longer doubled** (the scroll area and the view both added it).
