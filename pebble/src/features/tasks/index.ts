// Public API of the tasks feature. Code outside `features/tasks` imports only
// from here.
export { TasksProvider, useTasks } from './context/TasksContext';
export { default as TodayView } from './components/TodayView';
export { TAG_CONFIG, PRIORITY_CONFIG, tagLabel } from './lib/tags';
export type { NewTask, Subtask, Task, TaskPriority, TaskTag } from './types';
