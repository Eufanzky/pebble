import type { ActivityEntry } from '@/lib/types';

function todayAt(hours: number, minutes: number): Date {
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export const starterEntries: ActivityEntry[] = [
  {
    id: 'ae-01',
    timestamp: todayAt(9, 1),
    agent: 'CalmSense',
    action: 'Session started. Good morning detected.',
    reasoning: 'System clock reads 9:01 AM. Loaded morning greeting set. User preferences loaded: reading level 5, chunk size medium, personality gentle.',
    safetyStatus: 'passed',
  },
  {
    id: 'ae-02',
    timestamp: todayAt(9, 2),
    agent: 'AdaptLens',
    action: 'Loaded user profile and preferences.',
    reasoning: 'Reading level default: 5. Chunk size: medium (15-20 min). No adaptive adjustments yet — this is session 1. Preferences stored in local storage.',
    safetyStatus: 'passed',
  },
  {
    id: 'ae-03',
    timestamp: todayAt(9, 5),
    agent: 'SimplifyCore',
    action: "Broke down 'Read Chapter 4 of the design textbook' into 4 subtasks.",
    reasoning: 'Original estimate ~25 min. User preference is medium chunks (15-20 min). Split into 4 steps: skim headings (5 min), read 4.1 (10 min), read 4.2 (10 min), write summary (5 min). Each step is under the chunk size preference.',
    safetyStatus: 'passed',
  },
  {
    id: 'ae-04',
    timestamp: todayAt(9, 5),
    agent: 'WhyBot',
    action: 'Generated explanation for task decomposition.',
    reasoning: 'Created Why card explaining: chunk size preference (medium), original time estimate (25 min), decomposition rationale (one step per section). Explanation passes calm tone check.',
    safetyStatus: 'passed',
  },
  {
    id: 'ae-05',
    timestamp: todayAt(9, 6),
    agent: 'PebbleVoice',
    action: 'Delivered morning greeting with task count.',
    reasoning: "Time: morning. Personality: gentle. Message selected: 'Good morning! You've got 4 things today. No rush, we'll take it together.' Content Safety check: passed. No urgency language, no shame, no comparison.",
    safetyStatus: 'passed',
  },
  {
    id: 'ae-06',
    timestamp: todayAt(9, 15),
    agent: 'SimplifyCore',
    action: "Simplified 'Design Thinking Syllabus' to reading level 5.",
    reasoning: 'User default reading level: 5. Original Flesch-Kincaid grade level: 16 (graduate). Simplified to grade level 6. Preserved: all deadlines, assignment names, week numbers. Removed: academic jargon, complex sentence structures. Content Safety: passed.',
    safetyStatus: 'passed',
  },
  {
    id: 'ae-07',
    timestamp: todayAt(9, 16),
    agent: 'WhyBot',
    action: 'Generated explanation for document simplification.',
    reasoning: "Explanation: 'Simplified to level 5 because that's your default setting.' Checked for calm tone: passed. No condescension detected.",
    safetyStatus: 'passed',
  },
  {
    id: 'ae-08',
    timestamp: todayAt(9, 20),
    agent: 'PebbleVoice',
    action: "Launched Immersive Reader for 'Design Thinking Syllabus'.",
    reasoning: 'User requested focused reading mode. Immersive Reader provides: read-aloud, syllable breaking, parts-of-speech highlighting, line focus, translation (100+ languages). Designed for dyslexia, ADHD, and emerging readers.',
    safetyStatus: 'passed',
  },
  {
    id: 'ae-09',
    timestamp: todayAt(9, 30),
    agent: 'PebbleVoice',
    action: "Comprehension check passed for 'Design Thinking Syllabus'.",
    reasoning: "User answered correctly: 'Designing with real people's needs in mind.' Pebble response: encouraging, specific praise. No comparison to other users.",
    safetyStatus: 'passed',
  },
  {
    id: 'ae-10',
    timestamp: todayAt(9, 32),
    agent: 'SimplifyCore',
    action: "Extracted 2 tasks from 'Design Thinking Syllabus' and added to Today.",
    reasoning: "Identified 2 actionable items: 'Start user research report' (~2 hours, study tag) and 'Review prototype requirements' (~20 min, study tag). Tagged as [From: Design Thinking Syllabus].",
    safetyStatus: 'passed',
  },
];
