import type { Task } from '@/lib/types';

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Read Chapter 4 of the design textbook',
    timeEstimate: '~30 min',
    tag: 'study',
    priority: 'medium',
    completed: false,
    subtasks: [
      { id: 'st-1a', title: 'Skim section headings & key terms', timeEstimate: '~5 min', completed: false },
      { id: 'st-1b', title: 'Read intro and summary paragraphs', timeEstimate: '~10 min', completed: false },
      { id: 'st-1c', title: 'Take notes on 3 main concepts', timeEstimate: '~10 min', completed: false },
      { id: 'st-1d', title: 'Write 2 discussion questions', timeEstimate: '~5 min', completed: false },
    ],
    showSubtasks: false,
    whyExplanation: 'Pebble broke this into 4 steps because your chunk size is set to medium (15-20 min each).',
  },
  {
    id: 'task-2',
    title: "Reply to Professor Martinez's email",
    timeEstimate: '~10 min',
    tag: 'communication',
    priority: 'high',
    completed: false,
  },
  {
    id: 'task-3',
    title: 'Work on project proposal',
    timeEstimate: '~45 min',
    tag: 'project',
    priority: 'high',
    completed: false,
    subtasks: [
      { id: 'st-3a', title: 'Brainstorm 3 project ideas', timeEstimate: '~10 min', completed: false },
      { id: 'st-3b', title: 'Research feasibility of top idea', timeEstimate: '~15 min', completed: false },
      { id: 'st-3c', title: 'Draft problem statement', timeEstimate: '~10 min', completed: false },
      { id: 'st-3d', title: 'Outline tech stack', timeEstimate: '~10 min', completed: false },
    ],
    showSubtasks: false,
    whyExplanation: 'Pebble split this into research and writing phases so each step feels manageable.',
  },
  {
    id: 'task-4',
    title: 'Take a 10-minute walk',
    timeEstimate: '~10 min',
    tag: 'wellbeing',
    priority: 'low',
    completed: false,
  },
];
