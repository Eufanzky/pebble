// The browser's notifications, only ever used for a reminder the user set and chose to have as a
// notification (8.6). The guilt scan allows these two calls here and nowhere else.

export type NotificationAccess = 'granted' | 'denied' | 'default' | 'unsupported';

export function notificationAccess(): NotificationAccess {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return window.Notification.permission;
}

/** Asked only when the user turns notifications on. Resolves to whether they're allowed. */
export async function askForNotifications(): Promise<boolean> {
  if (notificationAccess() === 'unsupported') return false;
  try {
    return (await window.Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

export function notifyUser(body: string) {
  if (notificationAccess() !== 'granted') return;
  try {
    new window.Notification('Pebble', { body, tag: 'pebble-reminder' });
  } catch {
    // Some browsers only notify from a service worker; the reminder still shows in the app
  }
}
