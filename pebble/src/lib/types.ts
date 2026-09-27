export interface ActivityEntry {
  id: string;
  timestamp: Date;
  agent: 'CalmSense' | 'AdaptLens' | 'SimplifyCore' | 'PebbleVoice' | 'WhyBot' | 'BridgeBot';
  action: string;
  reasoning: string;
  safetyStatus: 'passed' | 'flagged';
}

export type PebbleMood = 'sleepy' | 'normal' | 'happy' | 'excited';
export type PebblePersonality = 'gentle' | 'playful' | 'calm';
export type PebbleColor = 'lavender' | 'sage' | 'coral' | 'amber' | 'sky';
export type PebbleModel = 'classic' | 'chonky' | 'mochi' | 'minimal' | 'chonky-plus' | 'mochi-plus' | 'minimal-plus';
export type ChunkSize = 'small' | 'medium' | 'large';
export type TimeOfDay = 'morning' | 'day' | 'evening';

export interface UserPreferences {
  readingLevel: number;
  chunkSize: ChunkSize;
  reduceAnimations: boolean;
  calmMode: boolean;
  pebbleColor: PebbleColor;
  pebblePersonality: PebblePersonality;
  pebbleModel: PebbleModel;
  voiceInput: boolean;
}
