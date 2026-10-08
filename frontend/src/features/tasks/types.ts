export interface Step {
  id: string;
  title: string;
  timeEstimate: string;
  completed: boolean;
}

export type TaskTag = 'study' | 'communication' | 'project' | 'wellbeing';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  timeEstimate: string;
  tag: TaskTag;
  priority: TaskPriority;
  completed: boolean;
  steps?: Step[];
  showSteps?: boolean;
  whyExplanation?: string;
  /** The day it's due (YYYY-MM-DD, the user's calendar), if any (8.3). */
  due?: string | null;
  /** When that day was chosen: where the time-left bar starts. */
  dueSetAt?: string | null;
}

export type NewTask = Omit<Task, 'id'>;
