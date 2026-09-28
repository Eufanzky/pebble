import { act, renderHookWithProviders } from '@/test/render';
import { usePreferences, type UserPreferences } from '@/shared/preferences';

/** Sets the preferences a test depends on (they're cached at module level). */
export function setPreferences(overrides: Partial<UserPreferences>) {
  const { result, unmount } = renderHookWithProviders(() => usePreferences());
  act(() => result.current.setPreferences((prev) => ({
    ...prev,
    reduceAnimations: false,
    calmMode: false,
    ...overrides,
  })));
  unmount();
}
