import type { ApiSchema } from '@/shared/api';
import { getJson, postJson } from '@/shared/lib/api';
import type { UserPreferences } from '@/shared/preferences';

export type Suggestion = ApiSchema<'SuggestionOut'>;

const SUGGESTIONS = '/api/suggestions';

/** AdaptLens's one suggestion now, or null. */
export function getSuggestion(): Promise<Suggestion | null> {
  return getJson<Suggestion | null>(SUGGESTIONS);
}

/** Applies it; the account's preferences come back. A suggestion that changed meanwhile is a 409. */
export function acceptSuggestion(key: string): Promise<UserPreferences> {
  return postJson<UserPreferences>(`${SUGGESTIONS}/accept`, { key });
}

/** Not now: it stays away for 14 days. */
export function dismissSuggestion(key: string): Promise<void> {
  return postJson<void>(`${SUGGESTIONS}/dismiss`, { key });
}
