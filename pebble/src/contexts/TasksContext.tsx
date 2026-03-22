'use client';

import { createContext, useContext, useCallback, useEffect, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePebble } from './PebbleContext';
import { sampleTasks } from '@/data/sampleTasks';
import type { Task, Subtask } from '@/lib/types';

interface TasksContextValue {
  tasks: Task[];
  completionPercentage: number;
  toggleTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  breakDownTask: (taskId: string, subtasks: Omit<Subtask, 'id'>[]) => void;
  clearAll: () => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('pebble-tasks', sampleTasks);
  const { deriveMoodFromCompletion, flashMood } = usePebble();

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const completionPercentage = total > 0 ? Math.round((done / total) * 100) : 0;

  // Sync mood with completion percentage
  useEffect(() => {
    deriveMoodFromCompletion(completionPercentage);
  }, [completionPercentage, deriveMoodFromCompletion]);

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((prev) => {
        const updated = prev.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        );
        const task = prev.find((t) => t.id === id);
        if (task && !task.completed) {
          flashMood('excited', 2000);
        }
        return updated;
      });
    },
    [setTasks, flashMood]
  );

  const toggleSubtask = useCallback(
    (taskId: string, subtaskId: string) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId || !t.subtasks) return t;
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allDone = updatedSubtasks.every((st) => st.completed);
          return { ...t, subtasks: updatedSubtasks, completed: allDone ? true : t.completed };
        })
      );
    },
    [setTasks]
  );

  const addTask = useCallback(
    (task: Omit<Task, 'id'>) => {
      const newTask: Task = { ...task, id: crypto.randomUUID() };
      setTasks((prev) => [...prev, newTask]);
    },
    [setTasks]
  );

  const breakDownTask = useCallback(
    (taskId: string, subtasks: Omit<Subtask, 'id'>[]) => {
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            subtasks: subtasks.map((st) => ({ ...st, id: crypto.randomUUID() })),
            showSubtasks: true,
          };
        })
      );
    },
    [setTasks]
  );

  const clearAll = useCallback(() => {
    setTasks([]);
  }, [setTasks]);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        completionPercentage,
        toggleTask,
        toggleSubtask,
        addTask,
        breakDownTask,
        clearAll,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error('useTasks must be used within TasksProvider');
  return ctx;
}
