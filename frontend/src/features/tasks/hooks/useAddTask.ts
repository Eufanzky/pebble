'use client';

import { useCallback, useState } from 'react';
import { useTasks } from '../context/TasksContext';
import { isDistressInput } from '../lib/distress';

/**
 * The "What do you need to do?" field. Text that reads as distress doesn't
 * become a task: Pebble offers support instead.
 */
export function useAddTask() {
  const { addTask, clearAll } = useTasks();
  const [input, setInput] = useState('');
  const [showDistress, setShowDistress] = useState(false);

  const submit = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');

    if (isDistressInput(text)) {
      setShowDistress(true);
      return;
    }

    addTask({
      title: text,
      tag: 'project',
      priority: 'medium',
      timeEstimate: '~15 min',
      completed: false,
    });
  }, [input, addTask]);

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
  }, [clearAll, addTask]);

  const keepGoing = useCallback(() => {
    setShowDistress(false);
  }, []);

  return { input, setInput, submit, showDistress, startFresh, keepGoing };
}
