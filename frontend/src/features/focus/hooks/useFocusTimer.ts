'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { FOCUS_SECONDS } from '../lib/timer';

export type TimerState = 'idle' | 'running' | 'paused';

/**
 * A 25-minute countdown. When it reaches zero, `onComplete` runs once and the
 * timer resets to idle. Pausing keeps the time left. `stop` ends the session
 * early, resets the timer and returns how many seconds were focused.
 */
export function useFocusTimer(onComplete: () => void) {
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_SECONDS);
  const [state, setState] = useState<TimerState>('idle');
  const left = useRef(FOCUS_SECONDS);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (state !== 'running') return;
    const interval = setInterval(() => {
      const next = left.current - 1;
      if (next > 0) {
        left.current = next;
        setSecondsLeft(next);
        return;
      }
      left.current = FOCUS_SECONDS;
      setSecondsLeft(FOCUS_SECONDS);
      setState('idle');
      onCompleteRef.current();
    }, 1000);
    return () => clearInterval(interval);
  }, [state]);

  const start = useCallback(() => setState('running'), []);
  const pause = useCallback(() => setState('paused'), []);
  const stop = useCallback(() => {
    const focused = FOCUS_SECONDS - left.current;
    left.current = FOCUS_SECONDS;
    setSecondsLeft(FOCUS_SECONDS);
    setState('idle');
    return focused;
  }, []);

  return { secondsLeft, state, start, pause, resume: start, stop };
}
