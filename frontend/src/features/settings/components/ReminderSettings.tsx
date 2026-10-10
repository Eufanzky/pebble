'use client';

import { useState } from 'react';
import { askForNotifications, notificationAccess } from '@/features/reminders';
import { usePreferences } from '@/shared/preferences';
import { Field } from '@/shared/ui';
import ToggleSwitch from './ToggleSwitch';
import './ReminderSettings.css';

/**
 * A gentle daily reminder (8.6). Off until the user sets a time; a browser notification only if they
 * also turn that on, and only then does Pebble ask the browser for permission.
 */
export default function ReminderSettings() {
  const { preferences, setPreferences } = usePreferences();
  const { reminderTime, reminderNotifications } = preferences;
  const [note, setNote] = useState<string | undefined>();

  const setTime = (time: string) => {
    setPreferences((prev) => ({ ...prev, reminderTime: time, reminderNotifications: time ? prev.reminderNotifications : false }));
    setNote(undefined);
  };

  const toggleNotifications = async () => {
    if (reminderNotifications) {
      setPreferences((prev) => ({ ...prev, reminderNotifications: false }));
      return;
    }
    if (await askForNotifications()) {
      setPreferences((prev) => ({ ...prev, reminderNotifications: true }));
      setNote(undefined);
    } else {
      setNote(
        notificationAccess() === 'unsupported'
          ? "This browser can't show notifications. The reminder still shows in Pebble."
          : "Your browser didn't allow notifications for Pebble. The reminder still shows in Pebble.",
      );
    }
  };

  return (
    <div className="ui-card reminder-settings">
      <Field
        label="Daily reminder"
        type="time"
        value={reminderTime}
        onChange={(e) => setTime(e.target.value)}
        hint="Off unless you pick a time. While Pebble is open, it asks once a day if you want to pick one small thing."
      />
      {reminderTime && (
        <div className="reminder-settings__row">
          <div>
            <p className="reminder-settings__title">Also as a notification</p>
            <p className="reminder-settings__hint">Your browser will ask first.</p>
            {note && (
              <p className="reminder-settings__hint" role="status">
                {note}
              </p>
            )}
          </div>
          <ToggleSwitch
            on={reminderNotifications}
            onChange={() => void toggleNotifications()}
            label="Also as a notification"
          />
        </div>
      )}
    </div>
  );
}
