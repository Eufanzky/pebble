'use client';

import { useCallback, useState } from 'react';
import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import { postFocusSession } from '@/features/stats';
import { useTasks } from '@/features/tasks';
import { STATS_KEY } from '@/shared/lib/query';
import { useQueryClient } from '@tanstack/react-query';
import { playChime } from '@/shared/lib/audio';
import { usePreferences } from '@/shared/preferences';
import { Card, Screen, ScreenHeader } from '@/shared/ui';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { minutesFocused, stoppedMessage } from '../lib/timer';
import FocusRing from './FocusRing';
import FocusStep from './FocusStep';
import TimerControls from './TimerControls';
import './focus.css';

interface FocusViewProps {
  /** The task and step this session is for (9.2), from `/focus?task=…&step=…`. */
  taskId?: string;
  stepId?: string;
}

/** The focus screen: a 25-minute timer, with Pebble working beside you, optionally on one step. */
export default function FocusView({ taskId, stepId }: FocusViewProps) {
  const { mood, flashMood } = usePebble();
  const { reduceMotion: noMotion } = usePreferences();
  const { tasks, isLoading, toggleStep } = useTasks();
  const [message, setMessage] = useState('Ready when you are.');
  const [ended, setEnded] = useState(false);
  const queryClient = useQueryClient();

  const task = taskId ? tasks.find((t) => t.id === taskId) : undefined;
  const step = stepId ? task?.steps?.find((s) => s.id === stepId) : undefined;
  const focusStep =
    taskId && stepId && !isLoading
      ? step && task
        ? { title: step.title, taskTitle: task.title, completed: step.completed }
        : ('missing' as const)
      : undefined;

  // The minutes count towards progress (5.6); a stats page open elsewhere picks them up
  const saveMinutes = useCallback(
    (minutes: number) => {
      postFocusSession(minutes)
        .then(() => queryClient.invalidateQueries({ queryKey: STATS_KEY }))
        .catch(() => undefined);
    },
    [queryClient],
  );

  const onComplete = useCallback(() => {
    playChime();
    flashMood('excited', 3000);
    setMessage('You focused for 25 minutes. Nice work.');
    setEnded(true);
    saveMinutes(25);
  }, [flashMood, saveMinutes]);
  const timer = useFocusTimer(onComplete);

  const start = () => {
    timer.start();
    setEnded(false);
    setMessage("I'm right here with you.");
  };
  const pause = () => {
    timer.pause();
    setMessage('Taking a breather? Pick it up whenever you like.');
  };
  // Stopping early is fine (principle 1): the minutes focused count like any others
  const stop = () => {
    const minutes = minutesFocused(timer.stop());
    setMessage(stoppedMessage(minutes));
    setEnded(true);
    if (minutes >= 1) saveMinutes(minutes);
  };
  const markDone = () => {
    if (task && step && !step.completed) toggleStep(task.id, step.id);
  };

  return (
    <Screen width="narrow">
      <ScreenHeader title="Focus" lead="A 25-minute timer, with Pebble beside you. Stop whenever you need to." />

      <Card as="section" padding="lg" className="focus-card" aria-label="Focus timer">
        {focusStep && <FocusStep step={focusStep} ended={ended} onDone={markDone} />}
        <div className="focus-companion">
          <PebbleCharacter mood={timer.state === 'running' ? 'happy' : mood} size="small" />
          <PebbleSpeechBubble message={message} />
        </div>
        <FocusRing secondsLeft={timer.secondsLeft} noMotion={noMotion} />
        <TimerControls state={timer.state} onStart={start} onPause={pause} onResume={start} onStop={stop} />
      </Card>
    </Screen>
  );
}
