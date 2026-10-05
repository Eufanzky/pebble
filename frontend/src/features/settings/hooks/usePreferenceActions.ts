'use client';

import { usePreferences, type StepSize, type PebbleColor, type PebbleModel, type PebblePersonality } from '@/shared/preferences';
import { useToast } from '@/shared/ui/ToastContext';

/** Changing a preference. The user's own changes aren't logged as an agent's (7.3). */
export function usePreferenceActions() {
  const { preferences, setPreferences } = usePreferences();
  const { showToast } = useToast();

  const toggle = (key: 'reduceAnimations' | 'calmMode') => {
    const next = !preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: next }));
  };

  return {
    selectModel: (id: PebbleModel) => setPreferences((prev) => ({ ...prev, pebbleModel: id })),
    selectColor: (id: PebbleColor) => {
      setPreferences((prev) => ({ ...prev, pebbleColor: id }));
      showToast(`Pebble is now ${id}!`);
    },
    selectPersonality: (id: PebblePersonality) => {
      setPreferences((prev) => ({ ...prev, pebblePersonality: id }));
    },
    setReadingLevel: (level: number) => {
      setPreferences((prev) => ({ ...prev, readingLevel: level }));
    },
    setStepSize: (size: StepSize) => {
      setPreferences((prev) => ({ ...prev, stepSize: size }));
    },
    toggleReduceAnimations: () => toggle('reduceAnimations'),
    toggleCalmMode: () => toggle('calmMode'),
  };
}
