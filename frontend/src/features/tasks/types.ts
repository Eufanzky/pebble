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
}

export type NewTask = Omit<Task, 'id'>;
