'use client';

import { useCallback, useState } from 'react';
import { useTasks } from '../context/TasksContext';

export type BreakDownStatus = 'idle' | 'working' | 'failed';

/**
 * Asking CalmSense to break one task down. `working` lasts exactly as long as the request; if it fails,
 * the task stays as it was and `failed` lets the card say so.
 */
export function useBreakDown(taskId: string) {
  const { breakDown } = useTasks();
  const [status, setStatus] = useState<BreakDownStatus>('idle');

  const start = useCallback(async () => {
    setStatus('working');
    try {
      await breakDown(taskId);
      setStatus('idle');
    } catch {
      setStatus('failed');
    }
  }, [breakDown, taskId]);

  return { status, start };
}
