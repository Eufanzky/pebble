import { setTestPreferences } from '@/test/preferences';
import { taskStore } from '@/test/msw/tasks';
import type { UserPreferences } from '@/shared/preferences';
import type { NewTask } from './types';

export function newTask(title: string, overrides: Partial<NewTask> = {}): NewTask {
  return { title, timeEstimate: '~10 min', tag: 'study', priority: 'medium', completed: false, ...overrides };
}

/**
 * Puts `tasks` on the fake server (`taskStore`) and sets the preferences.
 * `useLocalStorage` caches preferences at module level, so each test sets the
 * state it depends on. Views load the list asynchronously: find tasks with
 * `findBy*`.
 */
export function seed(tasks: NewTask[], preferences: Partial<UserPreferences> = {}) {
  taskStore.replace(
    tasks.map((t, i) => ({
      id: `seeded-${i + 1}`,
      title: t.title,
      timeEstimate: t.timeEstimate,
      tag: t.tag,
      priority: t.priority,
      completed: t.completed,
      whyExplanation: t.whyExplanation ?? '',
      steps: (t.steps ?? []).map((s, j) => ({ ...s, id: `seeded-${i + 1}-${j + 1}` })),
      due: t.due ?? null,
      dueSetAt: t.dueSetAt ?? null,
      letGoAt: null,
    })),
  );
  setTestPreferences({ reduceAnimations: true, calmMode: false, ...preferences });
}
