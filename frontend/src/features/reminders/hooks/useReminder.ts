'use client';

import { useEffect } from 'react';
import { usePreferences } from '@/shared/preferences';
import { useToast } from '@/shared/ui/ToastContext';
import { notifyUser } from '../lib/notifications';
import { isReminderDue, localDay, REMINDER_TEXT } from '../lib/schedule';

/** The last day a reminder showed on this device, so two tabs or a reload don't show it twice. */
export const REMINDER_SHOWN_KEY = 'pebble-reminder-shown';

function shownOn(): string | null {
  try {
    return window.localStorage.getItem(REMINDER_SHOWN_KEY);
  } catch {
    return null;
  }
}

function markShown(day: string) {
  try {
    window.localStorage.setItem(REMINDER_SHOWN_KEY, day);
  } catch {
    // Blocked storage: at worst a second tab shows it too
  }
}

/**
 * The user's daily reminder (8.6), while Pebble is open: a toast, and a browser notification only if they
 * turned that on and the browser allows it. With no time set, it never checks anything.
 */
export function useReminder(every = 30_000) {
  const { preferences } = usePreferences();
  const { showToast } = useToast();
  const { reminderTime, reminderNotifications } = preferences;

  useEffect(() => {
    if (!reminderTime) return;
    const check = () => {
      const now = new Date();
      if (!isReminderDue(reminderTime, now, shownOn())) return;
      markShown(localDay(now));
      showToast(REMINDER_TEXT);
      if (reminderNotifications) notifyUser(REMINDER_TEXT);
    };
    check();
    const id = setInterval(check, every);
    return () => clearInterval(id);
  }, [reminderTime, reminderNotifications, showToast, every]);
}
