import { act, renderHookWithProviders } from '@/test/render';
import { usePreferences } from '@/shared/preferences';
import type { UserPreferences } from '@/shared/preferences';
import { useTasks } from './context/TasksContext';
import type { NewTask } from './types';

export function newTask(title: string, overrides: Partial<NewTask> = {}): NewTask {
  return { title, timeEstimate: '~10 min', tag: 'study', priority: 'medium', completed: false, ...overrides };
}

/**
 * Replaces the stored task list and preferences. `useLocalStorage` caches at
 * module level, so each test sets the state it depends on.
 */
export function seed(tasks: NewTask[], preferences: Partial<UserPreferences> = {}) {
  const { result, unmount } = renderHookWithProviders(() => ({ ...useTasks(), ...usePreferences() }));
  act(() => {
    result.current.setPreferences((prev) => ({ ...prev, reduceAnimations: true, calmMode: false, ...preferences }));
    result.current.clearAll();
    tasks.forEach((t) => result.current.addTask(t));
  });
  unmount();
}
