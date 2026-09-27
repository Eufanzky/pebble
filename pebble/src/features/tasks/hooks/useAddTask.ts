'use client';

import { useCallback, useState } from 'react';
import { useActivityLog } from '@/features/activity';
import { useTasks } from '../context/TasksContext';
import { isDistressInput } from '../lib/distress';

/**
 * The "What do you need to do?" field. Text that reads as distress doesn't
 * become a task: Pebble offers support instead.
 */
export function useAddTask() {
  const { addTask, clearAll } = useTasks();
  const { addEntry } = useActivityLog();
  const [input, setInput] = useState('');
  const [showDistress, setShowDistress] = useState(false);

  const submit = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    if (isDistressInput(text)) {
      setShowDistress(true);
      addEntry(
        'CalmSense',
        'Distress signal detected. Offered support response. Content Safety: activated.',
        `User input contained distress language. Triggered gentle support response instead of task creation.`
      );
      return;
    }

    addTask({
      title: text,
      tag: 'project',
      priority: 'medium',
      timeEstimate: '~15 min',
      completed: false,
    });
    addEntry('CalmSense', `New task added: '${text}'`, 'User manually added a task from the input field.');
  }, [input, addTask, addEntry]);

  const startFresh = useCallback(() => {
    clearAll();
    addTask({
      title: 'Take 5 minutes to breathe',
      tag: 'wellbeing',
      priority: 'low',
      timeEstimate: '~5 min',
      completed: false,
      whyExplanation: "Clean slate. Just this one thing whenever you're ready.",
    });
    setShowDistress(false);
    addEntry('CalmSense', 'User chose to clear and start fresh. Added a simple breathing task.', 'Distress response: cleared all tasks, added wellbeing task.');
  }, [clearAll, addTask, addEntry]);

  const keepGoing = useCallback(() => {
    setShowDistress(false);
    addEntry('CalmSense', 'User dismissed distress support response. Continuing session.', 'User indicated they are okay to continue.');
  }, [addEntry]);

  return { input, setInput, submit, showDistress, startFresh, keepGoing };
}
