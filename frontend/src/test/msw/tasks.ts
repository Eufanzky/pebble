import { http, HttpResponse } from 'msw';
import type { ApiSchema } from '@/shared/api';

// A fake /api/tasks with the backend's rules (server ids, insertion order, the
// last open step finishes a task, unticking never reopens it), so the tasks
// feature can be tested against state that persists across renders.
type TaskOut = ApiSchema<'TaskOut'>;
type TaskCreate = ApiSchema<'TaskCreate'>;

let tasks: TaskOut[] = [];
let nextId = 1;
let breakdowns: { taskId: string; timeOfDay: string }[] = [];
let calendarStarts: string[] = [];
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
    steps: (body.steps ?? []).map((s) => ({
      id: id('step'),
      title: s.title,
      timeEstimate: s.timeEstimate ?? '',
      completed: s.completed ?? false,
    })),
    due: body.due ?? null,
    dueSetAt: body.due ? new Date().toISOString() : null,
    letGoAt: null,
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
  /** Every breakdown asked for, in order. */
  breakdowns: () => [...breakdowns],
  /** The `start` of every calendar file asked for. */
  calendarStarts: () => [...calendarStarts],
  reset() {
    tasks = [];
    nextId = 1;
    breakdowns = [];
    calendarStarts = [];
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
    // Tasks let go (8.4) are kept but aren't on the list
    http.get('/api/tasks', () => HttpResponse.json<TaskOut[]>(tasks.filter((t) => !t.letGoAt))),
    http.post('/api/tasks', async ({ request }) => {
      const task = toTask((await request.json()) as TaskCreate);
      tasks.push(task);
      return HttpResponse.json<TaskOut>(task, { status: 201 });
    }),
    http.delete('/api/tasks', () => {
      tasks = [];
      return new HttpResponse(null, { status: 204 });
    }),
    http.put('/api/tasks/order', async ({ request }) => {
      const { taskIds } = (await request.json()) as ApiSchema<'TasksOrder'>;
      const onList = tasks.filter((t) => !t.letGoAt);
      const byId = new Map(onList.map((t) => [t.id, t]));
      if (taskIds.length !== onList.length || taskIds.some((taskId) => !byId.has(taskId))) {
        return HttpResponse.json({ detail: 'Your list changed meanwhile. Pebble kept the order it had.' }, { status: 409 });
      }
      const order = taskIds.values();
      tasks = tasks.map((t) => (t.letGoAt ? t : byId.get(order.next().value!)!));
      return HttpResponse.json<TaskOut[]>(tasks.filter((t) => !t.letGoAt));
    }),
    http.delete('/api/tasks/:taskId', ({ params }) => {
      const before = tasks.length;
      tasks = tasks.filter((t) => t.id !== params.taskId);
      return tasks.length < before ? new HttpResponse(null, { status: 204 }) : notFound();
    }),
    http.patch('/api/tasks/:taskId', async ({ params, request }) => {
      const changes = (await request.json()) as ApiSchema<'TaskUpdate'>;
      const { due, ...rest } = changes;
      const set = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== null && v !== undefined));
      return update(String(params.taskId), (t) => {
        // A new due day restarts the bar; null removes it; the same day changes nothing (8.3)
        if (due === undefined || due === t.due) return { ...t, ...set };
        return { ...t, ...set, due, dueSetAt: due ? new Date().toISOString() : null };
      });
    }),
    // CalmSense, as the backend's fake LLM answers: three steps named after the task
    http.post('/api/tasks/:taskId/breakdown', async ({ params, request }) => {
      const { timeOfDay = 'day' } = (await request.json()) as ApiSchema<'BreakdownRequest'>;
      const taskId = String(params.taskId);
      if (tasks.some((t) => t.id === taskId)) breakdowns.push({ taskId, timeOfDay });
      return update(taskId, (t) => ({
        ...t,
        whyExplanation: 'I split this into 3 steps, starting with the easiest.',
        steps: [`Get what you need for: ${t.title}`, `Do the first small part of: ${t.title}`, 'Pick the next part'].map(
          (title) => ({ id: id('step'), title, timeEstimate: '~10 min', completed: false }),
        ),
      }));
    }),
    // BridgeBot's calendar file (7.7): a small iCalendar body
    http.get('/api/tasks/:taskId/calendar.ics', ({ params, request }) => {
      const task = tasks.find((t) => t.id === params.taskId);
      if (!task) return notFound();
      calendarStarts.push(new URL(request.url).searchParams.get('start') ?? '');
      const body = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nSUMMARY:${task.title}\r\nEND:VEVENT\r\nEND:VCALENDAR\r\n`;
      return new HttpResponse(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
    }),
    http.post('/api/tasks/:taskId/let-go', ({ params }) => {
      const task = tasks.find((t) => t.id === params.taskId);
      if (task?.completed) {
        return HttpResponse.json({ detail: "That one is already finished, so there's nothing to let go." }, { status: 409 });
      }
      return update(String(params.taskId), (t) => ({ ...t, letGoAt: t.letGoAt ?? new Date().toISOString() }));
    }),
    http.delete('/api/tasks/:taskId/let-go', ({ params }) => update(String(params.taskId), (t) => ({ ...t, letGoAt: null }))),
    http.delete('/api/tasks/:taskId/breakdown', ({ params }) =>
      update(String(params.taskId), (t) => ({ ...t, steps: [], whyExplanation: '' })),
    ),
    http.put('/api/tasks/:taskId/steps', async ({ params, request }) => {
      const { steps } = (await request.json()) as ApiSchema<'StepsReplace'>;
      return update(String(params.taskId), (t) => ({
        ...t,
        steps: steps.map((s) => ({ id: id('step'), title: s.title, timeEstimate: s.timeEstimate ?? '', completed: false })),
      }));
    }),
    http.patch('/api/tasks/:taskId/steps/:stepId', async ({ params, request }) => {
      const { completed } = (await request.json()) as ApiSchema<'StepUpdate'>;
      return update(String(params.taskId), (t) => {
        if (!t.steps.some((s) => s.id === params.stepId)) return null;
        const steps = t.steps.map((s) => (s.id === params.stepId ? { ...s, completed } : s));
        return { ...t, steps, completed: t.completed || steps.every((s) => s.completed) };
      });
    }),
  ],
  /** Every task request answers `status` (an outage, or signed out). */
  status: (status: number, detail = 'Pebble couldn\'t reach your saved tasks just now.') =>
    http.all('/api/tasks*', () => HttpResponse.json({ detail }, { status })),
  /** Calendar files answer `status`. */
  calendarStatus: (status: number) =>
    http.get('/api/tasks/:taskId/calendar.ics', () => HttpResponse.json({ detail: 'down' }, { status })),
  /** Breakdowns answer `status` (CalmSense can't answer: 503). */
  breakdownStatus: (status: number) =>
    http.post('/api/tasks/:taskId/breakdown', () => HttpResponse.json({ detail: "Pebble couldn't answer just now." }, { status })),
  /** Loading works; every change answers `status`. */
  saveStatus: (status: number) => [
    http.post('/api/tasks', () => HttpResponse.json({ detail: 'down' }, { status })),
    http.patch('/api/tasks/*', () => HttpResponse.json({ detail: 'down' }, { status })),
    http.put('/api/tasks/*', () => HttpResponse.json({ detail: 'down' }, { status })),
    http.delete('/api/tasks', () => HttpResponse.json({ detail: 'down' }, { status })),
    http.delete('/api/tasks/*', () => HttpResponse.json({ detail: 'down' }, { status })),
  ],
};
