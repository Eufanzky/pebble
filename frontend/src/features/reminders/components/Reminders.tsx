'use client';

import { useReminder } from '../hooks/useReminder';

/** Mounted once in the app shell: shows the user's daily reminder, if they set one (8.6). */
export default function Reminders() {
  useReminder();
  return null;
}
