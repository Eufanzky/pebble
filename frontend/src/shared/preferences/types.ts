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
  /** A daily, gentle reminder at HH:MM (8.6); '' is none, the default. */
  reminderTime: string;
  /** Also as a browser notification; off by default, and asked for only when the user turns it on. */
  reminderNotifications: boolean;
}
