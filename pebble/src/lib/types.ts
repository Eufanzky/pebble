export interface Subtask {
  id: string;
  title: string;
  timeEstimate: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  timeEstimate: string;
  tag: 'study' | 'communication' | 'project' | 'wellbeing';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  subtasks?: Subtask[];
  showSubtasks?: boolean;
  whyExplanation?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: 'academic' | 'technical' | 'meeting';
  tags: string[];
  levels: { [key: number]: string };
  original: string;
}

export interface ActivityEntry {
  id: string;
  timestamp: Date;
  agent: 'CalmSense' | 'AdaptLens' | 'SimplifyCore' | 'PebbleVoice' | 'WhyBot';
  action: string;
  reasoning: string;
  safetyStatus: 'passed' | 'flagged';
}

export type PebbleMood = 'sleepy' | 'normal' | 'happy' | 'excited';
export type PebblePersonality = 'gentle' | 'playful' | 'calm';
export type PebbleColor = 'lavender' | 'sage' | 'coral' | 'amber' | 'sky';
export type ChunkSize = 'small' | 'medium' | 'large';
export type TimeOfDay = 'morning' | 'day' | 'evening';

export interface UserPreferences {
  readingLevel: number;
  chunkSize: ChunkSize;
  reduceAnimations: boolean;
  calmMode: boolean;
  pebbleColor: PebbleColor;
  pebblePersonality: PebblePersonality;
  voiceInput: boolean;
}
