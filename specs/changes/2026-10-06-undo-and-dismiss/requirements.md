# 7.5 Undo and dismiss: requirements

Roadmap item: **7.5** (Phase 7). Branch: `feat/7.5-undo-and-dismiss`.

## Goal

Every change an agent makes to the user's list can be undone right after it, and a breakdown can be dismissed later.

## The AI changes, and how each is undone

| Change | Undo, right after (a toast) | Later |
|:--|:--|:--|
| CalmSense breaks a task down on Today | "Undo": the steps and the "why" go, and the task offers "Break it down" again | "Remove the steps" in the edit dialog |
| A CalmSense breakdown from chat is added to Today | "Undo": the task goes, and the chat offers "Add to Today" again | Delete the task, as any task |
| SimplifyCore's action items or study plan are added from a document | "Undo": those tasks go | Delete them, as any task |

## Pieces

- **Backend:** `DELETE /api/tasks/{id}/breakdown` (`Tasks.remove_breakdown`) removes the steps and the "why" in one save, and keeps everything else. Progress already made isn't taken back: counts only add up.
- **Frontend:**
  - `removeBreakdown` in the tasks context.
  - `addTask` and `addTaskFromDocument` return the new task's id, so it can be undone.
  - `showToast(message, action?)`: a toast can carry one button. It lasts 10 s with a button (5 s without), and hovering or focusing it pauses the timer.
- **Clicks pass through the toast.** Only its button takes clicks. The E2E found the toast blocking a button underneath ("intercepts pointer events"), which people would hit too.
- **Undo by the original id.** An undo holds the id a task had when it was added. If the server has named the task since, `deleteTask` and `removeBreakdown` still find it (`idFor`). A test catches the bug that the document undo exposed.

## Not here

- Undo isn't logged: it's the user's action, and only agents write the log (7.3).
- Editing a breakdown's steps one by one isn't part of this item.
