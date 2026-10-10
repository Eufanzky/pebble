import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/test/render';
import { accountStore } from '@/test/msw/account';
import { setTestPreferences } from '@/test/preferences';
import ReminderSettings from './ReminderSettings';

let permission: NotificationPermission = 'default';
const requestPermission = vi.fn(async () => permission);

beforeEach(() => {
  permission = 'default';
  requestPermission.mockClear();
  vi.stubGlobal('Notification', { permission: 'default', requestPermission });
});
afterEach(() => vi.unstubAllGlobals());

const timeField = () => screen.getByLabelText('Daily reminder');
const notifications = () => screen.getByRole('switch', { name: 'Also as a notification' });

describe('ReminderSettings (8.6)', () => {
  it('is off by default, and asks the browser for nothing', () => {
    setTestPreferences({ reminderTime: '', reminderNotifications: false });
    renderWithProviders(<ReminderSettings />);

    expect(timeField()).toHaveValue('');
    expect(timeField()).toHaveAccessibleDescription(/Off unless you pick a time/);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
    expect(requestPermission).not.toHaveBeenCalled();
  });

  it('saves a time, and an empty field turns the reminder and its notification off', async () => {
    setTestPreferences({ reminderTime: '', reminderNotifications: false });
    renderWithProviders(<ReminderSettings />);

    fireEvent.change(timeField(), { target: { value: '14:30' } });
    await waitFor(() => expect(accountStore.preferences().reminderTime).toBe('14:30'));
    expect(notifications()).toHaveAttribute('aria-checked', 'false');

    fireEvent.change(timeField(), { target: { value: '' } });
    await waitFor(() => expect(accountStore.preferences()).toMatchObject({ reminderTime: '', reminderNotifications: false }));
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('asks the browser only when notifications are turned on, and keeps them on once allowed', async () => {
    setTestPreferences({ reminderTime: '09:00', reminderNotifications: false });
    permission = 'granted';
    const { user } = renderWithProviders(<ReminderSettings />);
    expect(requestPermission).not.toHaveBeenCalled();

    await user.click(notifications());

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(notifications()).toHaveAttribute('aria-checked', 'true');
    await waitFor(() => expect(accountStore.preferences().reminderNotifications).toBe(true));

    await user.click(notifications());
    expect(notifications()).toHaveAttribute('aria-checked', 'false');
    expect(requestPermission).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(accountStore.preferences().reminderNotifications).toBe(false));
  });

  it('stays off, and says so gently, when the browser says no', async () => {
    setTestPreferences({ reminderTime: '09:00', reminderNotifications: false });
    permission = 'denied';
    const { user } = renderWithProviders(<ReminderSettings />);

    await user.click(notifications());

    expect(notifications()).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByRole('status')).toHaveTextContent(
      "Your browser didn't allow notifications for Pebble. The reminder still shows in Pebble.",
    );
    expect(accountStore.preferences().reminderNotifications).toBe(false);
  });
});
