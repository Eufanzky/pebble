import type { ActivityEntry } from '@/lib/types';

export const starterEntries: ActivityEntry[] = [
  {
    id: 'ae-1',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    agent: 'CalmSense',
    action: 'Detected evening session — adjusted Pebble tone to calmer messaging',
    reasoning: 'Time-of-day context: after 7 PM, users benefit from reduced urgency in language.',
    safetyStatus: 'passed',
  },
  {
    id: 'ae-2',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    agent: 'AdaptLens',
    action: 'Simplified "Design Thinking Syllabus.pdf" to reading level 5',
    reasoning: 'User preference is set to reading level 5. Document was originally at level 9.',
    safetyStatus: 'passed',
  },
  {
    id: 'ae-3',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    agent: 'SimplifyCore',
    action: 'Broke down "Read Chapter 4" into 4 subtasks',
    reasoning: 'User chunk size is medium (15-20 min). Chapter estimated at 30 min total.',
    safetyStatus: 'passed',
  },
  {
    id: 'ae-4',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    agent: 'PebbleVoice',
    action: 'Generated encouragement after 2 tasks completed',
    reasoning: 'Completion rate crossed 50%. Gentle personality mode selected — used warm, specific praise.',
    safetyStatus: 'passed',
  },
  {
    id: 'ae-5',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
    agent: 'WhyBot',
    action: 'Explained why "project proposal" was split into 4 steps',
    reasoning: 'User asked "why did you break this down?" — provided reasoning based on chunk size preference.',
    safetyStatus: 'passed',
  },
];
