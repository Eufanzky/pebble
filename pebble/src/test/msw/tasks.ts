import { http, HttpResponse } from 'msw';
import type { ApiSchema } from '@/shared/api';

// A fake /api/tasks with the backend's rules (server ids, insertion order, the
// last open step finishes a task, unticking never reopens it), so the tasks
// feature can be tested against state that persists across renders.
type TaskOut = ApiSchema<'TaskOut'>;
type TaskCreate = ApiSchema<'TaskCreate'>;

let tasks: TaskOut[] = [];
let nextId = 1;
const id = (prefix: string) => `${prefix}-${nextId++}`;

function toTask(body: TaskCreate): TaskOut {
  return {
    id: id('task'),
    title: body.title,
    timeEstimate: body.timeEstimate ?? '',
    tag: body.tag ?? 'project',
    priority: body.priority ?? 'medium',
    completed: body.completed ?? false,
    whyExplanation: body.whyExplanation ?? '',
    subtasks: (body.subtasks ?? []).map((s) => ({
      id: id('step'),
      title: s.title,
      timeEstimate: s.timeEstimate ?? '',
      completed: s.completed ?? false,
    })),
  };
}

export const taskStore = {
  /** What the server holds now. */
  all: (): TaskOut[] => structuredClone(tasks),
  /** Replaces the server's list (seeding a test). */
  set(list: TaskCreate[]) {
    tasks = list.map(toTask);
  },
  /** Tasks as the server would create them from request bodies (new ids), without storing them. */
  created: (list: TaskCreate[]): TaskOut[] => list.map(toTask),
  /** Replaces the server's list with tasks exactly as given (ids included). */
  replace(list: TaskOut[]) {
    tasks = structuredClone(list);
  },
  reset() {
    tasks = [];
    nextId = 1;
  },
};

const notFound = () => HttpResponse.json({ detail: "Pebble couldn't find that on your list." }, { status: 404 });

function update(taskId: string, change: (task: TaskOut) => TaskOut | null) {
  const index = tasks.findIndex((t) => t.id === taskId);
  if (index < 0) return notFound();
  const changed = change(tasks[index]);
  if (!changed) return notFound();
  tasks[index] = changed;
  return HttpResponse.json<TaskOut>(changed);
}

export const taskHandlers = {
  /** The fake API, stateful; a default handler. */
  api: () => [
    http.get('/api/tasks', () => HttpResponse.json<TaskOut[]>(tasks)),
    http.post('/api/tasks', async ({ request }) => {
      const task = toTask((await request.json()) as TaskCreate);
      tasks.push(task);
      return HttpResponse.json<TaskOut>(task, { status: 201 });
    }),
    http.delete('/api/tasks', () => {
      tasks = [];
      return new HttpResponse(null, { status: 204 });
    }),
    http.patch('/api/tasks/:taskId', async ({ params, request }) => {
      const changes = (await request.json()) as ApiSchema<'TaskUpdate'>;
      const set = Object.fromEntries(Object.entries(changes).filter(([, v]) => v !== null && v !== undefined));
      return update(String(params.taskId), (t) => ({ ...t, ...set }));
    }),
    http.put('/api/tasks/:taskId/subtasks', async ({ params, request }) => {
      const { subtasks } = (await request.json()) as ApiSchema<'SubtasksReplace'>;
      return update(String(params.taskId), (t) => ({
        ...t,
        subtasks: subtasks.map((s) => ({ id: id('step'), title: s.title, timeEstimate: s.timeEstimate ?? '', completed: false })),
      }));
    }),
    http.patch('/api/tasks/:taskId/subtasks/:subtaskId', async ({ params, request }) => {
      const { completed } = (await request.json()) as ApiSchema<'SubtaskUpdate'>;
      return update(String(params.taskId), (t) => {
        if (!t.subtasks.some((s) => s.id === params.subtaskId)) return null;
        const subtasks = t.subtasks.map((s) => (s.id === params.subtaskId ? { ...s, completed } : s));
        return { ...t, subtasks, completed: t.completed || subtasks.every((s) => s.completed) };
      });
    }),
  ],
  /** Every task request answers `status` (an outage, or signed out). */
  status: (status: number, detail = 'Pebble couldn\'t reach your saved tasks just now.') =>
    http.all('/api/tasks*', () => HttpResponse.json({ detail }, { status })),
  /** Loading works; every change answers `status`. */
  saveStatus: (status: number) => [
    http.post('/api/tasks', () => HttpResponse.json({ detail: 'down' }, { status })),
    http.patch('/api/tasks/*', () => HttpResponse.json({ detail: 'down' }, { status })),
    http.put('/api/tasks/*', () => HttpResponse.json({ detail: 'down' }, { status })),
    http.delete('/api/tasks', () => HttpResponse.json({ detail: 'down' }, { status })),
  ],
};
