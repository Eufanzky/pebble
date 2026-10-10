# 8.6 Opt-in reminders: requirements

Roadmap item: **8.6** (Phase 8). Branch: `feat/8.6-opt-in-reminders`.

## Goal

The user can set a gentle reminder in the app, plus an optional browser notification. Both are off by default (principle 1: "reminders the user chooses and sets"; no "nudges nobody asked for").

## Settings

- "Daily reminder" is a time field, empty by default ("Off unless you pick a time…"). Emptying it turns the reminder off, and its notification too.
- "Also as a notification" shows only once a time is set, and it's off. Turning it on is the only thing that asks the browser for permission. If the browser says no, it stays off and says gently that the reminder still shows in Pebble.
- Both are account preferences: `reminderTime` (`"HH:MM"` or `""`) and `reminderNotifications`. A damaged saved value falls back to off.

## The reminder

- While Pebble is open, from the set minute for 10 minutes, once a day on each device (`pebble-reminder-shown`, so two tabs or a reload don't repeat it): a toast saying "Your reminder: want to pick one small thing?".
- A browser notification with the same words, only if the user turned that on and the browser allows it.
- Opening Pebble hours after the time shows nothing. A missed reminder isn't brought up later.
- Without a time set, nothing checks the clock at all.

## The guilt scan

The `unasked-nudge` pattern also catches `new window.Notification(`. Its two matches, the permission request and the notification in `features/reminders/lib/notifications.ts`, are exceptions with reasons. Any other notification code fails the scan.

## Out of scope

- Reminders while Pebble is closed (they'd need push and a server schedule).
