import type { Task } from '@/lib/types';

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Read Chapter 4 of the design textbook',
    timeEstimate: '~25 min',
    tag: 'study',
    priority: 'medium',
    completed: false,
    showSubtasks: false,
    whyExplanation:
      'I split this into 4 steps because your preference is 15-minute chunks. The chapter has 4 sections, so one step per section plus a quick summary at the end keeps each piece manageable.',
    subtasks: [
      { id: 'st-1a', title: 'Skim the chapter headings first', timeEstimate: '~5 min', completed: false },
      { id: 'st-1b', title: 'Read section 4.1 — take notes as you go', timeEstimate: '~10 min', completed: false },
      { id: 'st-1c', title: 'Read section 4.2', timeEstimate: '~10 min', completed: false },
      { id: 'st-1d', title: 'Write a 2-sentence summary when done', timeEstimate: '~5 min', completed: false },
    ],
  },
  {
    id: 'task-2',
    title: "Reply to Professor Martinez's email",
    timeEstimate: '~10 min',
    tag: 'communication',
    priority: 'high',
    completed: false,
    whyExplanation:
      "This is a short task so I kept it as one step. It's marked high priority because it's been in your list since yesterday. No rush though — whenever you're ready.",
  },
  {
    id: 'task-3',
    title: 'Work on project proposal',
    timeEstimate: '~40 min',
    tag: 'project',
    priority: 'high',
    completed: false,
    showSubtasks: false,
    whyExplanation:
      "I broke this into 4 parts because the full proposal felt like a lot. Each part is about 10-15 minutes. You can do them in any order — I just suggested starting with re-reading the brief because it helps the rest flow easier.",
    subtasks: [
      { id: 'st-3a', title: 'Re-read the project brief', timeEstimate: '~5 min', completed: false },
      { id: 'st-3b', title: 'List 3 core features to include', timeEstimate: '~10 min', completed: false },
      { id: 'st-3c', title: 'Draft the architecture overview', timeEstimate: '~15 min', completed: false },
      { id: 'st-3d', title: 'Write the team intro section', timeEstimate: '~10 min', completed: false },
    ],
  },
  {
    id: 'task-4',
    title: 'Take a 10-minute walk',
    timeEstimate: '~10 min',
    tag: 'wellbeing',
    priority: 'low',
    completed: false,
    whyExplanation:
      "I added this because you've been working for a while. Movement helps your brain reset. This isn't a task you 'have' to do — it's a suggestion. Skip it if you want, no guilt.",
  },
];

export const TAG_CONFIG = {
  study:         { color: 'var(--accent-lavender)', label: 'Study',     emoji: '\uD83D\uDCDA' },
  communication: { color: 'var(--accent-amber)',    label: 'Comms',     emoji: '\uD83D\uDCAC' },
  project:       { color: 'var(--accent-coral)',     label: 'Project',   emoji: '\uD83D\uDD28' },
  wellbeing:     { color: 'var(--accent-sage)',      label: 'Wellbeing', emoji: '\uD83C\uDF3F' },
} as const;

export const PRIORITY_CONFIG = {
  high:   { color: '#E8856A', label: 'High' },
  medium: { color: '#D4A843', label: 'Medium' },
  low:    { color: '#8FAF8A', label: 'Low' },
} as const;
