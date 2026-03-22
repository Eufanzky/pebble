export type PebbleMood = 'sleepy' | 'normal' | 'happy' | 'excited';
export type PebblePersonality = 'gentle' | 'playful' | 'calm';
export type ChunkSize = 'small' | 'medium' | 'large';
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';
export type Priority = 'high' | 'medium' | 'low';

export type TagName =
  | 'Study'
  | 'Communication'
  | 'Project'
  | 'Wellbeing'
  | 'Deadlines'
  | 'Reading';

export interface Task {
  id: number;
  title: string;
  tag: TagName;
  time: string;
  priority: Priority;
  completed: boolean;
  hasSubtasks: boolean;
  expanded: boolean;
  subtasks: string[];
}

export interface Document {
  id: number;
  title: string;
  type: 'PDF' | 'Brief';
  tags: string[];
  complex: string;
  medium: string;
  simple: string;
  taskSnippets: string[];
}

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: 'task_completed' | 'doc_simplified' | 'session_completed' | 'preference_changed';
  description: string;
  detail?: string;
}

export interface UserPreferences {
  personality: PebblePersonality;
  pebbleColor: string;
  pebbleDark: string;
  readingLevel: number;
  chunkSize: ChunkSize;
  reduceAnimations: boolean;
  calmMode: boolean;
}
