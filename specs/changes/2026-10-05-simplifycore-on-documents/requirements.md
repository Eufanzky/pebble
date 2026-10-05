# 7.2 SimplifyCore on Documents: requirements

Roadmap item: **7.2** (Phase 7), the second item fixing A-029. Branch: `feat/7.2-simplifycore-on-documents`.

## Before

An upload got the same text at every reading level and no action items. Only the four built-in documents had simpler versions, written in advance. SimplifyCore was never called from Documents, but the screen credited it ("SimplifyCore: user uploaded…").

## Now

- **Uploads ask SimplifyCore.** A document is an `example` or an `upload`. For an upload, SimplifyCore (`POST /api/agents/simplify`) writes each level the user picks:
  - It asks once the slider rests on a level for 300 ms, so dragging doesn't send a request per step.
  - It keeps each answer while the document is open, so going back to a level doesn't ask again.
  - Level 10 is the original and needs no asking.
- **The screen says what's happening:**
  - "SimplifyCore is writing this at level N…" while it works.
  - "SimplifyCore couldn't simplify this just now. The original is still here." plus "Try again" if it can't answer.
  - When a long document was only simplified in part, or when the groundedness check flags the version, a note says so.
- **Action items come from SimplifyCore.** "Tasks" and "Study Plan" use them, and wait for them. The reader reads what's on screen.
- **The examples say they're examples** (an "Example" chip).
- **The activity log is reloaded** after SimplifyCore answers, and after a CalmSense breakdown on Today. The backend writes those entries, and the page's copy didn't show them until a reload (missed in 7.1).

## Decisions

1. **A long upload is simplified from its start.** The free Groq tier allows about 8,000 tokens a minute, so the browser sends about 6,000 characters, cut at a paragraph or sentence break, and says so. The API refuses text over 12,000 characters (422). Simplifying a long document part by part could be a later item.
2. **The browser calls the existing SimplifyCore endpoint**, which screens the text, checks groundedness and logs the result. No new endpoint was needed.
3. **The fake LLM finds action items** (sentences with "must", "need to" or "should"), so the E2E can add one to Today through the real backend.
4. **Hard-coded entries stay until 7.3.** The browser still writes some made-up entries ("Extracted N tasks", "AdaptLens: reading level adjusted"); 7.3 removes them.
