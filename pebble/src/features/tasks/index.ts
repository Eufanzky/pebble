// Public API of the tasks feature. Code outside `features/tasks` imports only
// from here.
export { TasksProvider, useTasks } from './context/TasksContext';
export { default as TodayView } from './components/TodayView';
export { TAG_CONFIG } from './lib/tags';
export type { Task, TaskTag } from './types';
