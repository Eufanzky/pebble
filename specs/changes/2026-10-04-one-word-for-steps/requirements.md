# 6.6 One word for steps: requirements

Roadmap item: **6.6** (Phase 6), from the naming review ("make sure every naming is made to understand easily"); it was logged as A-027. Branch: `refactor/6.6-one-word-for-steps`.

## Goal

A part of a task is a **step** everywhere, and how big CalmSense makes them is the **step size**.

Before, the UI and the domain said "steps" (`Step`, `TaskStep`, the `task_steps` table), but the API, the frontend types and CalmSense's prompt said `subtasks`, and even the screen-reader labels said "Check subtask". Settings called the step size "Task chunk size", and the code `chunkSize`.

## Changes

| Was | Now |
|:--|:--|
| `GET /api/tasks` → `subtasks`; `PUT /api/tasks/{id}/subtasks`; `PATCH /api/tasks/{id}/subtasks/{subtaskId}` | `steps`; `/api/tasks/{id}/steps`; `/api/tasks/{id}/steps/{stepId}` |
| Schemas `SubtaskIn`, `SubtaskOut`, `SubtaskUpdate`, `SubtasksReplace`, `SubtaskResult` | `StepIn`, `StepOut`, `StepUpdate`, `StepsReplace`, `StepResult` |
| CalmSense's reply `{"subtasks": [...]}` | `{"steps": [...]}` (prompt, parser, fake LLM) |
| Frontend `Subtask`, `subtasks`, `showSubtasks`, `toggleSubtask`, `SubtaskList`, `.subtask-item` | `Step`, `steps`, `showSteps`, `toggleStep`, `StepList`, `.step-item` |
| "Check subtask" / "Uncheck subtask" | "Check step" / "Uncheck step" |
| "Task chunk size", `chunkSize`, `chunk_size`, `ChunkSize`, `ChunkSizeSetting` | "Step size", `stepSize`, `step_size`, `StepSize`, `StepSizeSetting` |

## Old data stays readable

- **Saved preferences:** migration 0005 renames `chunk_size` to `step_size` in every saved row (and back on downgrade).
- **A browser's data from before accounts:** `importLocalData` still reads `subtasks` and `chunkSize`, and sends `steps` and `stepSize`.
- The device's preference cache may still hold `chunkSize` until the account's copy arrives, which happens on the first load; an unknown key is ignored, so nothing breaks.

## Kept

- "chunks" in the Content Safety adapter (splitting long text for the API) and in the Immersive Reader request (`chunks` is that SDK's field): a different meaning.

## Checks

- `names.test.ts` fails on `subtask` or `chunk size` in the code, except in the two readers of old data.
- A migration test checks 0005 both ways and that other saved values stay.
- The CalmSense prompt changed, so the evals run again.
