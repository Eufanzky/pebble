'use client';

import { useCallback, useState } from 'react';
import { useActivityLog } from '@/features/activity';
import { saveFile } from '@/shared/lib/download';
import { useToast } from '@/shared/ui/ToastContext';
import { calendarFile } from '../api/tasks';
import { calendarFileName, localIso, nextQuarterHour } from '../lib/calendar';
import type { Task } from '../types';

/**
 * BridgeBot (7.7): saves a task's open steps as a calendar file, back to back from the next quarter hour, to
 * open in Google Calendar, Outlook or any calendar app.
 */
export function useCalendarExport(task: Task, now: () => Date = () => new Date()) {
  const { showToast } = useToast();
  const { refresh: refreshLog } = useActivityLog();
  const [busy, setBusy] = useState(false);

  const save = useCallback(async () => {
    setBusy(true);
    const start = nextQuarterHour(now());
    try {
      saveFile(await calendarFile(task.id, localIso(start)), calendarFileName(task.title));
      const at = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      showToast(`Saved "${task.title}" as a calendar file, starting at ${at}. Open it to add the steps.`);
      // The backend logged it as BridgeBot
      refreshLog();
    } catch {
      showToast("BridgeBot couldn't make the calendar file just now. Try again whenever you're ready.");
    } finally {
      setBusy(false);
    }
  }, [task.id, task.title, now, showToast, refreshLog]);

  return { save, busy };
}
