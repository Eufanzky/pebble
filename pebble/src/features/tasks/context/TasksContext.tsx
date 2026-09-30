'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePebble } from '@/features/companion';
import { clearTasks, createTask, listTasks, replaceSubtasks, updateSubtask, updateTask } from '../api/tasks';
import { sampleTasks } from '../data/sampleTasks';
import type { NewTask, Subtask, Task } from '../types';

export const TASKS_KEY = ['tasks'] as const;

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
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addTask: (task: NewTask) => void;
  addTaskFromDocument: (title: string, docName: string, type: 'academic' | 'meeting') => void;
  /** Adds the example tasks, for a first look around. */
  addExampleTasks: () => void;
  breakDownTask: (taskId: string, subtasks: Omit<Subtask, 'id'>[]) => void;
  clearAll: () => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

const tempId = () => `temp-${crypto.randomUUID()}`;

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
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());
  const [saveFailed, setSaveFailed] = useState(false);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const serverIds = useRef(new Map<string, string>());

  const tasks = useMemo(
    () => (query.data ?? []).map((t) => (expanded.has(t.id) ? { ...t, showSubtasks: true } : t)),
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
    (localId: string, local: Pick<Task, 'subtasks'>, saved: Task) => {
      serverIds.current.set(localId, saved.id);
      (local.subtasks ?? []).forEach((s, i) => {
        const savedStep = saved.subtasks?.[i];
        if (savedStep) serverIds.current.set(s.id, savedStep.id);
      });
      const swap = (id: string) => serverIds.current.get(id) ?? id;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === localId || t.id === saved.id
            ? { ...t, id: saved.id, subtasks: t.subtasks?.map((s) => ({ ...s, id: swap(s.id) })) }
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
    (task: NewTask) => {
      if (beforeFirstLoad(() => createTask(task))) return;
      const local: Task = {
        ...task,
        id: tempId(),
        subtasks: task.subtasks?.map((s) => ({ ...s, id: tempId() })),
      };
      setTasks((prev) => [...prev, local]);
      enqueue(async () => adoptIds(local.id, local, await createTask(task)));
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
      });
    },
    [tasks, setTasks, flashMood, enqueue, idFor],
  );

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      const step = tasks.find((t) => t.id === taskId)?.subtasks?.find((s) => s.id === subtaskId);
      if (!step) return;
      const completed = !step.completed;
      // The same rule as the backend: the last open step finishes the task; unticking never reopens it
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId || !t.subtasks) return t;
          const subtasks = t.subtasks.map((s) => (s.id === subtaskId ? { ...s, completed } : s));
          return { ...t, subtasks, completed: t.completed || subtasks.every((s) => s.completed) };
        }),
      );
      enqueue(async () => {
        await updateSubtask(idFor(taskId), idFor(subtaskId), completed);
      });
    },
    [tasks, setTasks, enqueue, idFor],
  );

  const addTaskFromDocument = useCallback(
    (title: string, docName: string, type: 'academic' | 'meeting') => {
      addTask({
        title,
        timeEstimate: '~15 min',
        tag: type === 'meeting' ? 'communication' : 'study',
        priority: 'medium',
        completed: false,
        whyExplanation: `Created from "${docName}". Pebble extracted this as an action item from the document.`,
      });
    },
    [addTask],
  );

  const addExampleTasks = useCallback(() => {
    // Each gets new ids (the server's); the sample ids are never sent
    sampleTasks.forEach((sample) => addTask({ ...sample, showSubtasks: false }));
  }, [addTask]);

  const breakDownTask = useCallback(
    (taskId: string, subtasks: Omit<Subtask, 'id'>[]) => {
      const steps = subtasks.map((s) => ({ ...s, id: tempId(), completed: false }));
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, subtasks: steps } : t)));
      setExpanded((prev) => new Set(prev).add(taskId));
      enqueue(async () => adoptIds(taskId, { subtasks: steps }, await replaceSubtasks(idFor(taskId), subtasks)));
    },
    [setTasks, enqueue, adoptIds, idFor],
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
    toggleSubtask,
    addTask,
    addTaskFromDocument,
    addExampleTasks,
    breakDownTask,
    clearAll,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
