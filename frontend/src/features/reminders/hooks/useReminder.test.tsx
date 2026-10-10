import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders, screen } from '@/test/render';
import { setTestPreferences } from '@/test/preferences';
import { REMINDER_TEXT } from '../lib/schedule';
import { REMINDER_SHOWN_KEY, useReminder } from './useReminder';

// A fake browser Notification: records what was shown and whether permission was asked
const shown: string[] = [];
const requestPermission = vi.fn(async () => 'granted' as NotificationPermission);
class FakeNotification {
  static permission: NotificationPermission = 'granted';
  static requestPermission = requestPermission;
  constructor(_title: string, options?: NotificationOptions) {
    shown.push(options?.body ?? '');
  }
}

beforeEach(() => {
  shown.length = 0;
  requestPermission.mockClear();
  vi.stubGlobal('Notification', FakeNotification);
  window.localStorage.removeItem(REMINDER_SHOWN_KEY);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** The user's reminder settings, then a fixed clock at `now` (the settings are saved with real timers). */
function given(preferences: { reminderTime: string; reminderNotifications: boolean }, now: Date) {
  setTestPreferences(preferences);
  vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  vi.setSystemTime(now);
}

/** Lets a whole day go by, checking as the hook does. */
function aDayPasses() {
  act(() => vi.advanceTimersByTime(24 * 60 * 60 * 1000));
}

describe('useReminder', () => {
  it('reminds of nothing, and notifies nobody, by default', () => {
    given({ reminderTime: '', reminderNotifications: false }, new Date(2026, 9, 9, 0, 0));
    renderHookWithProviders(() => useReminder());

    aDayPasses();

    expect(screen.queryByText(REMINDER_TEXT)).not.toBeInTheDocument();
    expect(shown).toEqual([]);
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('shows the reminder the user set in the app at its time, without a notification unless they asked', () => {
    given({ reminderTime: '09:00', reminderNotifications: false }, new Date(2026, 9, 9, 8, 59, 50));
    renderHookWithProviders(() => useReminder());
    expect(screen.queryByText(REMINDER_TEXT)).not.toBeInTheDocument();

    act(() => vi.advanceTimersByTime(30_000));

    expect(screen.getByText(REMINDER_TEXT)).toBeInTheDocument();
    expect(window.localStorage.getItem(REMINDER_SHOWN_KEY)).toBe('2026-10-09');
    expect(shown).toEqual([]);
  });

  it('also notifies when the user turned that on and the browser allows it', () => {
    given({ reminderTime: '09:00', reminderNotifications: true }, new Date(2026, 9, 9, 9, 0, 5));

    renderHookWithProviders(() => useReminder());

    expect(shown).toEqual([REMINDER_TEXT]);
    expect(requestPermission).not.toHaveBeenCalled(); // asked only in Settings
  });

  it('never notifies when the browser said no, even if the setting is on', () => {
    FakeNotification.permission = 'denied';
    given({ reminderTime: '09:00', reminderNotifications: true }, new Date(2026, 9, 9, 9, 0, 5));

    renderHookWithProviders(() => useReminder());

    expect(screen.getByText(REMINDER_TEXT)).toBeInTheDocument();
    expect(shown).toEqual([]);
    FakeNotification.permission = 'granted';
  });

  it('doesn’t show it late: opening Pebble hours after the time shows nothing', () => {
    given({ reminderTime: '09:00', reminderNotifications: true }, new Date(2026, 9, 9, 15, 0));

    renderHookWithProviders(() => useReminder());

    expect(screen.queryByText(REMINDER_TEXT)).not.toBeInTheDocument();
    expect(shown).toEqual([]);
  });

  it('shows once a day, even across tabs or a reload', () => {
    given({ reminderTime: '09:00', reminderNotifications: true }, new Date(2026, 9, 9, 9, 0, 5));

    renderHookWithProviders(() => useReminder());
    renderHookWithProviders(() => useReminder());
    act(() => vi.advanceTimersByTime(5 * 60_000));

    expect(shown).toEqual([REMINDER_TEXT]);
  });
});
