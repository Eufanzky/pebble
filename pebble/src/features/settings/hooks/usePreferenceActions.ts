'use client';

import { useActivityLog } from '@/features/activity';
import { usePreferences, type ChunkSize, type PebbleColor, type PebbleModel, type PebblePersonality } from '@/shared/preferences';
import { useToast } from '@/shared/ui/ToastContext';

/**
 * Changing a preference. Every change except the model is logged as
 * AdaptLens, so the activity log shows what the user adjusted.
 */
export function usePreferenceActions() {
  const { preferences, setPreferences } = usePreferences();
  const { addEntry } = useActivityLog();
  const { showToast } = useToast();

  const toggle = (key: 'reduceAnimations' | 'calmMode', label: string) => {
    const next = !preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: next }));
    addEntry('AdaptLens', `${label} ${next ? 'enabled' : 'disabled'}`, `User toggled ${label.toLowerCase()} to ${next}.`);
  };

  return {
    selectModel: (id: PebbleModel) => setPreferences((prev) => ({ ...prev, pebbleModel: id })),
    selectColor: (id: PebbleColor) => {
      setPreferences((prev) => ({ ...prev, pebbleColor: id }));
      showToast(`Pebble is now ${id}!`);
      addEntry('AdaptLens', `Pebble color changed to ${id}`, `User selected ${id} from color picker.`);
    },
    selectPersonality: (id: PebblePersonality) => {
      setPreferences((prev) => ({ ...prev, pebblePersonality: id }));
      addEntry('AdaptLens', `Personality mode changed to ${id}`, `User selected ${id} personality from settings.`);
    },
    setReadingLevel: (level: number) => {
      setPreferences((prev) => ({ ...prev, readingLevel: level }));
      addEntry('AdaptLens', `Default reading level changed to ${level}`, `User adjusted reading level slider to ${level}.`);
    },
    setChunkSize: (size: ChunkSize) => {
      setPreferences((prev) => ({ ...prev, chunkSize: size }));
      addEntry('AdaptLens', `Chunk size changed to ${size}`, `User selected ${size} chunk size.`);
    },
    toggleReduceAnimations: () => toggle('reduceAnimations', 'Reduce animations'),
    toggleCalmMode: () => toggle('calmMode', 'Calm mode'),
  };
}
