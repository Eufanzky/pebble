import { setTestPreferences } from '@/test/preferences';
import type { UserPreferences } from '@/shared/preferences';

/** Sets the preferences a settings test depends on, with animations and calm mode off unless given. */
export function setPreferences(overrides: Partial<UserPreferences>) {
  setTestPreferences({ reduceAnimations: false, calmMode: false, ...overrides });
}
