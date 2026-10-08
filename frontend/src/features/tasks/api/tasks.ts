import type { ApiSchema } from '@/shared/api';
import { deleteRequest, getBlob, getJson, patchJson, postJson, putJson } from '@/shared/lib/api';
import type { NewTask, Task } from '../types';

type TaskOut = ApiSchema<'TaskOut'>;
type TaskCreate = ApiSchema<'TaskCreate'>;
type TaskUpdate = ApiSchema<'TaskUpdate'>;

const TASKS = '/api/tasks';

/** A task as the UI holds it: a task with no steps has no `steps`. */
function fromApi(task: TaskOut): Task {
  const { steps, ...rest } = task;
  return steps.length > 0 ? { ...rest, steps } : rest;
}

function toCreate(task: NewTask): TaskCreate {
  return {
    title: task.title,
    timeEstimate: task.timeEstimate,
    tag: task.tag,
    priority: task.priority,
    completed: task.completed,
    whyExplanation: task.whyExplanation ?? '',
    due: task.due ?? null,
    steps: (task.steps ?? []).map((s) => ({ title: s.title, timeEstimate: s.timeEstimate, completed: s.completed })),
  };
}

export async function listTasks(): Promise<Task[]> {
  return (await getJson<TaskOut[]>(TASKS)).map(fromApi);
}

export async function createTask(task: NewTask): Promise<Task> {
  return fromApi(await postJson<TaskOut>(TASKS, toCreate(task)));
}

export async function updateTask(id: string, changes: TaskUpdate): Promise<Task> {
  return fromApi(await patchJson<TaskOut>(`${TASKS}/${encodeURIComponent(id)}`, changes));
}

/** CalmSense breaks the saved task into steps of the user's step size; the task comes back with them. */
export async function breakDownTask(id: string, timeOfDay: string): Promise<Task> {
  return fromApi(await postJson<TaskOut>(`${TASKS}/${encodeURIComponent(id)}/breakdown`, { timeOfDay }));
}

/** Undo or dismiss a breakdown: the steps and the "why" go, the task stays (7.5). */
export function removeBreakdown(id: string): Promise<void> {
  return deleteRequest(`${TASKS}/${encodeURIComponent(id)}/breakdown`);
}

/** BridgeBot: the task's open steps back to back from `start` (with its UTC offset), as an .ics file (7.7). */
export function calendarFile(id: string, start: string): Promise<Blob> {
  return getBlob(`${TASKS}/${encodeURIComponent(id)}/calendar.ics?start=${encodeURIComponent(start)}`);
}

export async function updateStep(taskId: string, stepId: string, completed: boolean): Promise<Task> {
  const path = `${TASKS}/${encodeURIComponent(taskId)}/steps/${encodeURIComponent(stepId)}`;
  return fromApi(await patchJson<TaskOut>(path, { completed }));
}

export function clearTasks(): Promise<void> {
  return deleteRequest(TASKS);
}

export function deleteTask(id: string): Promise<void> {
  return deleteRequest(`${TASKS}/${encodeURIComponent(id)}`);
}

/** Every task on the list, in the new order. */
export async function reorderTasks(ids: string[]): Promise<Task[]> {
  return (await putJson<TaskOut[]>(`${TASKS}/order`, { taskIds: ids })).map(fromApi);
}
