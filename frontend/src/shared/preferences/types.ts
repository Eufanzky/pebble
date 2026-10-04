export type PebblePersonality = 'gentle' | 'playful' | 'calm';
export type PebbleColor = 'lavender' | 'sage' | 'coral' | 'amber' | 'sky';
export type PebbleModel = 'classic' | 'chonky' | 'mochi' | 'minimal' | 'chonky-plus' | 'mochi-plus' | 'minimal-plus';
export type StepSize = 'small' | 'medium' | 'large';

export interface UserPreferences {
  readingLevel: number;
  stepSize: StepSize;
  reduceAnimations: boolean;
  calmMode: boolean;
  pebbleColor: PebbleColor;
  pebblePersonality: PebblePersonality;
  pebbleModel: PebbleModel;
}
