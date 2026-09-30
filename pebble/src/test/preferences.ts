import { act, renderHookWithProviders } from './render';
import { accountStore } from './msw/account';
import { usePreferences, type UserPreferences } from '@/shared/preferences';

/**
 * Sets the preferences a test depends on, in both places the app reads them:
 * the account (the fake server) and this device's copy (cached at module
 * level by `useLocalStorage`, so it carries over between tests in a file).
 */
export function setTestPreferences(changes: Partial<UserPreferences>) {
  accountStore.setPreferences(changes);
  const { result, unmount } = renderHookWithProviders(() => usePreferences());
  act(() => result.current.setPreferences((prev) => ({ ...prev, ...changes })));
  unmount();
}

/** The preferences as this device keeps them (what applies before the account answers). */
export function devicePreferences(): UserPreferences {
  return JSON.parse(window.localStorage.getItem('pebble-preferences-cache')!);
}
