import type { Task } from '../types';

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Read Chapter 4 of the design textbook',
    timeEstimate: '~25 min',
    tag: 'study',
    priority: 'medium',
    completed: false,
    showSteps: false,
    steps: [
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
  },
  {
    id: 'task-3',
    title: 'Work on group project proposal',
    timeEstimate: '~40 min',
    tag: 'project',
    priority: 'high',
    completed: false,
    showSteps: false,
    steps: [
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
  },
];
