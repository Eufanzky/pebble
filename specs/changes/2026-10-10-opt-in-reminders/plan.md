# 8.6 Opt-in reminders: plan

1. Backend preferences: `reminder_time` (HH:MM or empty) and `reminder_notifications`, off by default; validation; tests. Regenerate the API types.
2. `features/reminders`: `isReminderDue` (fixed-clock tests), the Notification wrapper, `useReminder`, `Reminders` in the shell.
3. `ReminderSettings` in Settings; tests that nothing asks the browser or notifies unless turned on.
4. Guilt-scan exceptions, axe, docs, PR.
