// App-wide preferences: every feature reads them, and the settings feature
// edits them. They live in shared/ so no feature depends on another for them.
export { defaultPreferences, PreferencesProvider, usePreferences } from './PreferencesContext';
export { PEBBLE_COLORS } from './colors';
export type { StepSize, PebbleColor, PebbleModel, PebblePersonality, UserPreferences } from './types';
