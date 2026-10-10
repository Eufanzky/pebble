'use client';

import { useCallback, useState } from 'react';
import { useActivityLog } from '@/features/activity';
import { isResting } from '@/shared/lib/api';
import { useToast } from '@/shared/ui/ToastContext';
import { useTasks } from '../context/TasksContext';

/** `resting`: it failed because the agents are resting (10.4), which the card says instead. */
export type BreakDownStatus = 'idle' | 'working' | 'failed' | 'resting';

/**
 * Asking CalmSense to break one task down. `working` lasts exactly as long as the request; if it fails,
 * the task stays as it was and `failed` lets the card say so. Once it worked, a toast offers to undo it (7.5).
 */
export function useBreakDown(taskId: string, title: string) {
  const { breakDown, removeBreakdown } = useTasks();
  const { showToast } = useToast();
  const { refresh: refreshLog } = useActivityLog();
  const [status, setStatus] = useState<BreakDownStatus>('idle');

  const start = useCallback(async () => {
    setStatus('working');
    try {
      await breakDown(taskId);
      setStatus('idle');
      showToast(`CalmSense broke "${title}" into steps.`, { label: 'Undo', onAction: () => removeBreakdown(taskId) });
    } catch (error) {
      setStatus(isResting(error) ? 'resting' : 'failed');
    } finally {
      // The backend logs what CalmSense did (or held back): show it
      refreshLog();
    }
  }, [breakDown, removeBreakdown, showToast, taskId, title, refreshLog]);

  return { status, start };
}
