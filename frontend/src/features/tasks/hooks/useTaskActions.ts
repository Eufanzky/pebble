'use client';

import { useCallback } from 'react';
import { playTaskComplete } from '@/shared/lib/audio';
import { useTasks } from '../context/TasksContext';

/** Ticking tasks and steps on Today, with a soft sound when a task is finished. */
export function useTaskActions() {
  const { tasks, toggleTask, toggleStep } = useTasks();

  const toggle = useCallback(
    (id: string) => {
      if (tasks.some((t) => t.id === id && !t.completed)) playTaskComplete();
      toggleTask(id);
    },
    [tasks, toggleTask],
  );

  return { toggle, toggleStep };
}
