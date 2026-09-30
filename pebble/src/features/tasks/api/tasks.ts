import type { ApiSchema } from '@/shared/api';
import { deleteRequest, getJson, patchJson, postJson, putJson } from '@/shared/lib/api';
import type { NewTask, Subtask, Task } from '../types';

type TaskOut = ApiSchema<'TaskOut'>;
type TaskCreate = ApiSchema<'TaskCreate'>;
type TaskUpdate = ApiSchema<'TaskUpdate'>;

const TASKS = '/api/tasks';

/** A task as the UI holds it: a task with no steps has no `subtasks` (no "Break down" button). */
export function fromApi(task: TaskOut): Task {
  const { subtasks, ...rest } = task;
  return subtasks.length > 0 ? { ...rest, subtasks } : rest;
}

export function toCreate(task: NewTask): TaskCreate {
  return {
    title: task.title,
    timeEstimate: task.timeEstimate,
    tag: task.tag,
    priority: task.priority,
    completed: task.completed,
    whyExplanation: task.whyExplanation ?? '',
    subtasks: (task.subtasks ?? []).map((s) => ({ title: s.title, timeEstimate: s.timeEstimate })),
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

export async function replaceSubtasks(id: string, subtasks: Omit<Subtask, 'id' | 'completed'>[]): Promise<Task> {
  const body = { subtasks: subtasks.map((s) => ({ title: s.title, timeEstimate: s.timeEstimate })) };
  return fromApi(await putJson<TaskOut>(`${TASKS}/${encodeURIComponent(id)}/subtasks`, body));
}

export async function updateSubtask(taskId: string, subtaskId: string, completed: boolean): Promise<Task> {
  const path = `${TASKS}/${encodeURIComponent(taskId)}/subtasks/${encodeURIComponent(subtaskId)}`;
  return fromApi(await patchJson<TaskOut>(path, { completed }));
}

export function clearTasks(): Promise<void> {
  return deleteRequest(TASKS);
}
