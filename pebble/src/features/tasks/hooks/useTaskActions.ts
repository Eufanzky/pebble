'use client';

import { useCallback } from 'react';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { playTaskComplete } from '@/shared/lib/audio';
import { useTasks } from '../context/TasksContext';

/**
 * What the user can do to a task on Today. Each action is also written to the
 * activity log, so every change Pebble reacts to can be explained.
 */
export function useTaskActions() {
  const { tasks, toggleTask, toggleSubtask } = useTasks();
  const { addEntry } = useActivityLog();
  const { preferences } = usePreferences();

  const toggle = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task && !task.completed) {
        const done = tasks.filter((t) => t.completed).length;
        playTaskComplete();
        addEntry(
          'PebbleVoice',
          `Nice work! You finished "${task.title}". That's ${done + 1} of ${tasks.length} done today.`,
          'Task completed by user. Triggered encouragement message.'
        );
      } else if (task) {
        addEntry(
          'PebbleVoice',
          `Unchecked "${task.title}". No worries — take your time.`,
          'Task unchecked by user.'
        );
      }
      toggleTask(id);
    },
    [tasks, toggleTask, addEntry],
  );

  const breakDown = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task?.subtasks) {
        addEntry(
          'SimplifyCore',
          `Broke down "${task.title}" into ${task.subtasks.length} steps (${preferences.chunkSize} chunks, your preference).`,
          `Task decomposed based on user chunk size preference: ${preferences.chunkSize}.`
        );
      }
    },
    [tasks, preferences.chunkSize, addEntry],
  );

  const openWhy = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (task) {
        addEntry(
          'WhyBot',
          `User asked why "${task.title}" was organized this way. Showed explanation.`,
          'Explainability request fulfilled. Reasoning displayed to user.'
        );
      }
    },
    [tasks, addEntry],
  );

  return { toggle, toggleSubtask, breakDown, openWhy };
}
