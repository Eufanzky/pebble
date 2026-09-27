import type { TaskTag } from '@/features/tasks';
import type { ChunkSize, PebbleColor, PebbleModel, PebblePersonality } from '@/shared/preferences';

// The choices on the settings screen, and the canned data behind its demo
// integrations (see A-020 in specs/audit.md).
export const models: { id: PebbleModel; name: string; desc: string }[] = [
  { id: 'classic', name: 'Classic', desc: 'The original Pebble' },
  { id: 'chonky', name: 'Chonky Bean', desc: 'Pusheen-inspired' },
  { id: 'mochi', name: 'Mochi Ball', desc: 'Ultra-round blob' },
  { id: 'minimal', name: 'Sleek', desc: 'Tamagotchi-like' },
  { id: 'chonky-plus', name: 'Chonky+', desc: 'Stripes, purrs on hover' },
  { id: 'mochi-plus', name: 'Mochi+', desc: 'Jelly wobble, nuzzle hover' },
  { id: 'minimal-plus', name: 'Minimal+', desc: 'Pixel-bob, eye widen' },
];

export const colorOptions: { id: PebbleColor; label: string }[] = [
  { id: 'lavender', label: 'Lavender' },
  { id: 'sage', label: 'Sage' },
  { id: 'coral', label: 'Coral' },
  { id: 'amber', label: 'Amber' },
  { id: 'sky', label: 'Sky' },
];

export const personalities: { id: PebblePersonality; name: string; desc: string; quote: string }[] = [
  { id: 'gentle', name: 'Gentle & encouraging', desc: 'Soft, warm, patient', quote: "No rush, we'll get through this together" },
  { id: 'playful', name: 'Playful & funny', desc: 'Light jokes, cat puns, energetic', quote: 'Paw-sitively doable!' },
  { id: 'calm', name: 'Calm & minimal', desc: 'Brief, no-pressure, minimal', quote: 'Ready when you are.' },
];

export const chunkSizes: { id: ChunkSize; label: string; desc: string }[] = [
  { id: 'small', label: 'Small (5-10 min)', desc: 'Short focus bursts' },
  { id: 'medium', label: 'Medium (15-20 min)', desc: 'Balanced' },
  { id: 'large', label: 'Large (30+ min)', desc: 'Deep work sessions' },
];

export const connectedApps = [
  { name: 'Microsoft Teams', desc: 'Import messages and meeting notes', emoji: '\uD83D\uDCAC', defaultOn: true },
  { name: 'Outlook Calendar', desc: 'Sync deadlines and events as tasks', emoji: '\uD83D\uDCE7', defaultOn: true },
  { name: 'Moodle LMS', desc: 'Import assignments and course materials', emoji: '\uD83C\uDF93', defaultOn: false },
  { name: 'Slack', desc: 'Import messages and reminders', emoji: '\uD83D\uDCAD', defaultOn: false },
  { name: 'Google Calendar', desc: 'Sync events and deadlines', emoji: '\uD83D\uDCC5', defaultOn: false },
];

export const SYNC_TASKS: Record<string, Array<{ title: string; tag: TaskTag; time: string }>> = {
  'Microsoft Teams': [
    { title: 'Review meeting notes from standup', tag: 'communication', time: '~10 min' },
    { title: 'Reply to team thread about design review', tag: 'communication', time: '~5 min' },
  ],
  'Outlook Calendar': [
    { title: 'Prepare for tomorrow\'s project deadline', tag: 'project', time: '~20 min' },
    { title: 'Submit weekly progress report', tag: 'project', time: '~15 min' },
  ],
  'Moodle LMS': [
    { title: 'Complete Module 3 quiz by Friday', tag: 'study', time: '~25 min' },
    { title: 'Read uploaded lecture notes for Week 5', tag: 'study', time: '~15 min' },
  ],
  'Slack': [
    { title: 'Follow up on feedback from #design channel', tag: 'communication', time: '~10 min' },
  ],
  'Google Calendar': [
    { title: 'Study group session prep', tag: 'study', time: '~20 min' },
  ],
};

export const VOICE_PHRASES = [
  'Read chapter 4 of the design textbook',
  'Reply to Professor Martinez',
  'Work on the project proposal',
  'Take a 10-minute break',
  'Review my meeting notes',
];
