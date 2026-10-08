'use client';

import { useCallback } from 'react';
import { useToast } from '@/shared/ui/ToastContext';
import { useTasks } from '../context/TasksContext';
import type { Task } from '../types';

/**
 * Two of the three choices for a task whose day is over (8.4): move it to another day, or let it go,
 * with "Undo" on a toast. The third, making it smaller, is CalmSense's breakdown (`useBreakDown`).
 */
export function useStillOpen(task: Task) {
  const { tasks, editTask, letGo, takeBack } = useTasks();
  const { showToast } = useToast();

  const moveTo = useCallback((due: string | null) => editTask(task.id, { due }), [editTask, task.id]);

  const letItGo = useCallback(() => {
    const index = tasks.findIndex((t) => t.id === task.id);
    // Back as it was saved: whether its steps were shown is this screen's state
    const kept: Task = { ...task, showSteps: undefined };
    letGo(task.id);
    showToast(`You let "${task.title}" go. Letting go is fine.`, {
      label: 'Undo',
      onAction: () => takeBack(kept, index),
    });
  }, [tasks, task, letGo, takeBack, showToast]);

  return { moveTo, letItGo };
}
