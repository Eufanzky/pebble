import type { ActivityEntry } from '@/lib/types';

export const sampleActivityEntries: ActivityEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'task_completed',
    description: 'Completed "Review syllabus deadlines"',
    detail: 'Study',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    type: 'doc_simplified',
    description: 'Simplified "Design Thinking Syllabus.pdf"',
    detail: 'Level 5',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    type: 'session_completed',
    description: 'Completed a 25-minute focus session',
    detail: 'Late Night Club',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    type: 'preference_changed',
    description: 'Changed Pebble color to Sage',
  },
];
