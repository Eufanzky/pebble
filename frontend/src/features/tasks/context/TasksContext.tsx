'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePebble } from '@/features/companion';
import { useTimeOfDay } from '@/shared/hooks/useTimeOfDay';
import { STATS_KEY } from '@/shared/lib/query';
import {
  clearTasks,
  createTask,
  deleteTask as deleteTaskRequest,
  listTasks,
  reorderTasks as reorderRequest,
  breakDownTask as breakDownRequest,
  removeBreakdown as removeBreakdownRequest,
  updateStep,
  updateTask,
} from '../api/tasks';
import { sampleTasks } from '../data/sampleTasks';
import type { NewTask, Task } from '../types';

const TASKS_KEY = ['tasks'] as const;

interface TasksContextValue {
  tasks: Task[];
  completionPercentage: number;
  /** The first load of the list hasn't answered yet. */
  isLoading: boolean;
  /** The list couldn't be loaded; `retry` tries again. */
  loadFailed: boolean;
  retry: () => void;
  /** A change couldn't be saved; the list went back to what the server has. */
  saveFailed: boolean;
  dismissSaveError: () => void;
  toggleTask: (id: string) => void;
  toggleStep: (taskId: string, stepId: string) => void;
  /** Adds a task; returns its id on this screen, for an undo (none before the list has loaded). */
  addTask: (task: NewTask) => string | undefined;
  /** An action item from a document; `why` is WhyBot's explanation of the simplification (none for an example). */
  addTaskFromDocument: (title: string, type: 'academic' | 'meeting', why?: string) => string | undefined;
  /** Adds the example tasks, for a first look around. */
  addExampleTasks: () => void;
  /** CalmSense breaks the task down; resolves once its steps are on the list, and rejects if it couldn't. */
  breakDown: (taskId: string) => Promise<void>;
  /** Show or hide a task's steps on this screen (not saved). */
  setStepsShown: (taskId: string, shown: boolean) => void;
  /** Undo or dismiss a breakdown: the steps and the "why" go, the task stays (7.5). */
  removeBreakdown: (taskId: string) => void;
  /** Change what a task says: its title, estimate, tag or priority. */
  editTask: (id: string, changes: TaskEdit) => void;
  deleteTask: (id: string) => void;
  /** Put the tasks in this order; `ids` lists every task once. */
  reorderTasks: (ids: string[]) => void;
  clearAll: () => void;
}

export type TaskEdit = Partial<Pick<Task, 'title' | 'timeEstimate' | 'tag' | 'priority' | 'due'>>;

const TasksContext = createContext<TasksContextValue | null>(null);

const tempId = () => `temp-${crypto.randomUUID()}`;

/** As the backend does it: a new due day starts the time-left bar now; none clears it (8.3). */
function dueSetAt(task: Task, changes: TaskEdit): Pick<Task, 'dueSetAt'> {
  if (!('due' in changes) || (changes.due ?? null) === (task.due ?? null)) return {};
  return { dueSetAt: changes.due ? new Date().toISOString() : null };
}

/**
 * The task list, saved in the backend (`/api/tasks`).
 *
 * Every change shows at once (optimistic) and is saved in the background, one
 * save after another, in the order the user made them. A new task or step has a
 * temporary id until the server answers; later saves use the server's id. If a
 * save fails, the list reloads from the server and `saveFailed` is set.
 */
export function TasksProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: TASKS_KEY, queryFn: listTasks, staleTime: Infinity });
  const { deriveMoodFromCompletion, flashMood } = usePebble();
  const timeOfDay = useTimeOfDay();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [saveFailed, setSaveFailed] = useState(false);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const serverIds = useRef(new Map<string, string>());

  const tasks = useMemo(
    () => (query.data ?? []).map((t) => (expanded.has(t.id) ? { ...t, showSteps: true } : t)),
    [query.data, expanded],
  );

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const completionPercentage = total > 0 ? Math.round((done / total) * 100) : 0;

  useEffect(() => {
    deriveMoodFromCompletion(completionPercentage, total, done);
  }, [completionPercentage, total, done, deriveMoodFromCompletion]);

  const setTasks = useCallback(
    (update: (prev: Task[]) => Task[]) => client.setQueryData<Task[]>(TASKS_KEY, (prev) => update(prev ?? [])),
    [client],
  );

  const idFor = useCallback((id: string) => serverIds.current.get(id) ?? id, []);

  /** Runs `save` once every earlier change has reached the server. */
  const enqueue = useCallback(
    (save: () => Promise<void>) => {
      queue.current = queue.current.then(save).catch(() => {
        setSaveFailed(true);
        serverIds.current.clear();
        void client.invalidateQueries({ queryKey: TASKS_KEY });
      });
    },
    [client],
  );

  /** The server answered: swap temporary ids for its ids, keeping any change made meanwhile. */
  const adoptIds = useCallback(
    (localId: string, local: Pick<Task, 'steps'>, saved: Task) => {
      serverIds.current.set(localId, saved.id);
      (local.steps ?? []).forEach((s, i) => {
        const savedStep = saved.steps?.[i];
        if (savedStep) serverIds.current.set(s.id, savedStep.id);
      });
      const swap = (id: string) => serverIds.current.get(id) ?? id;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === localId || t.id === saved.id
            ? { ...t, id: saved.id, steps: t.steps?.map((s) => ({ ...s, id: swap(s.id) })) }
            : t,
        ),
      );
      setExpanded((prev) => (prev.has(localId) ? new Set([...prev].map(swap)) : prev));
    },
    [setTasks],
  );

  /** Before the first load arrives, a change shown now would be replaced by it: save, then reload. */
  const beforeFirstLoad = useCallback(
    (save: () => Promise<unknown>) => {
      if (client.getQueryData(TASKS_KEY) !== undefined) return false;
      enqueue(async () => {
        await save();
        await client.invalidateQueries({ queryKey: TASKS_KEY });
      });
      return true;
    },
    [client, enqueue],
  );

  const addTask = useCallback(
    (task: NewTask): string | undefined => {
      if (beforeFirstLoad(() => createTask(task))) return undefined;
      const local: Task = {
        ...task,
        id: tempId(),
        steps: task.steps?.map((s) => ({ ...s, id: tempId() })),
      };
      setTasks((prev) => [...prev, local]);
      enqueue(async () => adoptIds(local.id, local, await createTask(task)));
      return local.id;
    },
    [setTasks, enqueue, adoptIds, beforeFirstLoad],
  );

  const toggleTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;
      const completed = !task.completed;
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
      if (completed) flashMood('excited', 2000);
      enqueue(async () => {
        await updateTask(idFor(id), { completed });
        // The progress counts on Today and Activity (8.2) add what was just finished
        if (completed) void client.invalidateQueries({ queryKey: STATS_KEY });
      });
    },
    [tasks, setTasks, flashMood, enqueue, idFor, client],
  );

  const toggleStep = useCallback(
    (taskId: string, stepId: string) => {
      const step = tasks.find((t) => t.id === taskId)?.steps?.find((s) => s.id === stepId);
      if (!step) return;
      const completed = !step.completed;
      // The same rule as the backend: the last open step finishes the task; unticking never reopens it
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId || !t.steps) return t;
          const steps = t.steps.map((s) => (s.id === stepId ? { ...s, completed } : s));
          return { ...t, steps, completed: t.completed || steps.every((s) => s.completed) };
        }),
      );
      enqueue(async () => {
        await updateStep(idFor(taskId), idFor(stepId), completed);
        if (completed) void client.invalidateQueries({ queryKey: STATS_KEY });
      });
    },
    [tasks, setTasks, enqueue, idFor, client],
  );

  const addTaskFromDocument = useCallback(
    (title: string, type: 'academic' | 'meeting', why = '') =>
      addTask({
        title,
        timeEstimate: '~15 min',
        tag: type === 'meeting' ? 'communication' : 'study',
        priority: 'medium',
        completed: false,
        whyExplanation: why,
      }),
    [addTask],
  );

  const addExampleTasks = useCallback(() => {
    // Each gets new ids (the server's); the sample ids are never sent
    sampleTasks.forEach((sample) => addTask({ ...sample, showSteps: false }));
  }, [addTask]);

  const breakDown = useCallback(
    async (taskId: string) => {
      // After every earlier save, so a task added a moment ago has its server id
      const request = queue.current.then(() => breakDownRequest(idFor(taskId), timeOfDay));
      queue.current = request.then(
        () => undefined,
        () => undefined,
      );
      const saved = await request;
      setTasks((prev) => prev.map((t) => (t.id === taskId || t.id === saved.id ? saved : t)));
      setExpanded((prev) => new Set(prev).add(saved.id));
    },
    [setTasks, idFor, timeOfDay],
  );

  const removeBreakdown = useCallback(
    (taskId: string) => {
      const ids = [taskId, idFor(taskId)];
      setTasks((prev) => prev.map((t) => (ids.includes(t.id) ? { ...t, steps: undefined, whyExplanation: '' } : t)));
      setExpanded((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      enqueue(async () => {
        await removeBreakdownRequest(idFor(taskId));
      });
    },
    [setTasks, enqueue, idFor],
  );

  const setStepsShown = useCallback((taskId: string, shown: boolean) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (shown) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  }, []);

  const editTask = useCallback(
    (id: string, changes: TaskEdit) => {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes, ...dueSetAt(t, changes) } : t)));
      enqueue(async () => {
        await updateTask(idFor(id), changes);
      });
    },
    [setTasks, enqueue, idFor],
  );

  const deleteTask = useCallback(
    (id: string) => {
      // An undo may hold the temporary id of a task the server has named since
      setTasks((prev) => prev.filter((t) => t.id !== id && t.id !== idFor(id)));
      enqueue(() => deleteTaskRequest(idFor(id)));
    },
    [setTasks, enqueue, idFor],
  );

  const reorderTasks = useCallback(
    (ids: string[]) => {
      setTasks((prev) => {
        const byId = new Map(prev.map((t) => [t.id, t]));
        return ids.map((id) => byId.get(id)).filter((t): t is Task => t !== undefined);
      });
      enqueue(async () => {
        await reorderRequest(ids.map(idFor));
      });
    },
    [setTasks, enqueue, idFor],
  );

  const clearAll = useCallback(() => {
    if (beforeFirstLoad(clearTasks)) return;
    setTasks(() => []);
    enqueue(clearTasks);
  }, [setTasks, enqueue, beforeFirstLoad]);

  const value: TasksContextValue = {
    tasks,
    completionPercentage,
    isLoading: query.isPending,
    loadFailed: query.isError,
    retry: () => void query.refetch(),
    saveFailed,
    dismissSaveError: () => setSaveFailed(false),
    toggleTask,
    toggleStep,
    addTask,
    addTaskFromDocument,
    addExampleTasks,
    breakDown,
    setStepsShown,
    removeBreakdown,
    editTask,
    deleteTask,
    reorderTasks,
    clearAll,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
