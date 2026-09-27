# 3.3 Documents: validation

- [x] No file in `features/documents` or `shared` is over 200 lines (largest: `lib/translation.ts`, 123, mostly the word lists; `BuiltInReader.tsx`, 122). The page is 13 lines.
- [x] Reading-level slider: each band shows its text and note, `aria-valuetext` updates, and the change is logged as AdaptLens.
- [x] Comprehension check: both answers, Pebble's reply, only the first answer counts, random order.
- [x] Built-in reader fallback: loading message, fallback on 503 and on an SDK error, nothing drawn when Azure launches, every tool, Exit and Escape (which no longer closes the document too).
- [x] `npm test` (270 passed), lint, `tsc --noEmit` and `npm run build` pass.
- [x] `next start` serves `/documents` with the sample documents and the upload zone.
