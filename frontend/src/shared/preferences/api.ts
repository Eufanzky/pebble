import type { ApiSchema } from '@/shared/api';
import { getJson, patchJson } from '@/shared/lib/api';
import type { UserPreferences } from './types';

const PREFERENCES = '/api/preferences';

export function getPreferences(): Promise<UserPreferences> {
  return getJson<ApiSchema<'PreferencesOut'>>(PREFERENCES);
}

export function patchPreferences(changes: Partial<UserPreferences>): Promise<UserPreferences> {
  return patchJson<ApiSchema<'PreferencesOut'>>(PREFERENCES, changes);
}
