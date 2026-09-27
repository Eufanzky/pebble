import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders } from '@/test/render';
import type { Subtask, Task } from '../types';
import { usePebble } from '@/features/companion';
import { useTasks } from './TasksContext';

type NewTask = Omit<Task, 'id'>;

function task(title: string, overrides: Partial<NewTask> = {}): NewTask {
  return { title, timeEstimate: '~10 min', tag: 'study', priority: 'medium', completed: false, ...overrides };
}

function step(title: string, completed = false): Subtask {
  return { id: `step-${title}`, title, timeEstimate: '~5 min', completed };
}

// useLocalStorage caches tasks at module level, so every test replaces the
// whole list instead of relying on the sample data.
function renderTasks(tasks: NewTask[]) {
  const { result } = renderHookWithProviders(() => ({ ...useTasks(), ...usePebble() }));
  act(() => {
    result.current.clearAll();
    tasks.forEach((t) => result.current.addTask(t));
  });
  return result;
}

type Result = ReturnType<typeof renderTasks>;

function idOf(result: Result, title: string) {
  const found = result.current.tasks.find((t) => t.title === title);
  if (!found) throw new Error(`No task titled "${title}"`);
  return found.id;
}

function toggle(result: Result, title: string) {
  act(() => result.current.toggleTask(idOf(result, title)));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('Pebble mood from task completion', () => {
  it.each([
    { done: 0, total: 4, pct: 0, mood: 'sleepy' },
    { done: 1, total: 4, pct: 25, mood: 'normal' },
    { done: 1, total: 3, pct: 33, mood: 'normal' },
    { done: 2, total: 4, pct: 50, mood: 'happy' },
    { done: 3, total: 4, pct: 75, mood: 'happy' },
    { done: 4, total: 4, pct: 100, mood: 'excited' },
  ])('is $mood when $done of $total tasks are done', ({ done, total, pct, mood }) => {
    const tasks = Array.from({ length: total }, (_, i) => task(`Task ${i}`, { completed: i < done }));

    const result = renderTasks(tasks);

    expect(result.current.completionPercentage).toBe(pct);
    expect(result.current.mood).toBe(mood);
  });

  it('is sleepy with no tasks at all', () => {
    const result = renderTasks([]);

    expect(result.current.completionPercentage).toBe(0);
    expect(result.current.mood).toBe('sleepy');
  });

  it('follows the percentage as tasks are unchecked', () => {
    const result = renderTasks([task('Read', { completed: true }), task('Write', { completed: true })]);
    expect(result.current.mood).toBe('excited');

    toggle(result, 'Read');

    expect(result.current.completionPercentage).toBe(50);
    expect(result.current.mood).toBe('happy');
  });
});

describe('excited flash on completing a task', () => {
  it('flashes excited for 2 seconds, then settles on the derived mood', () => {
    vi.useFakeTimers();
    const result = renderTasks([task('Read'), task('Write'), task('Walk'), task('Rest')]);
    expect(result.current.mood).toBe('sleepy');

    toggle(result, 'Read');
    expect(result.current.mood).toBe('excited');

    act(() => vi.advanceTimersByTime(1999));
    expect(result.current.mood).toBe('excited');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.mood).toBe('normal'); // 1 of 4 done
  });

  it('restarts the 2 seconds when another task is completed during a flash', () => {
    vi.useFakeTimers();
    const result = renderTasks([task('Read'), task('Write'), task('Walk'), task('Rest')]);

    toggle(result, 'Read');
    act(() => vi.advanceTimersByTime(1500));
    toggle(result, 'Write');
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.mood).toBe('excited');

    act(() => vi.advanceTimersByTime(500));
    expect(result.current.mood).toBe('happy'); // 2 of 4 done
  });

  it('does not flash when a task is unchecked', () => {
    const result = renderTasks([task('Read', { completed: true }), task('Write'), task('Walk'), task('Rest')]);
    expect(result.current.mood).toBe('normal');

    toggle(result, 'Read');

    expect(result.current.mood).toBe('sleepy');
  });
});

describe('toggling a task step', () => {
  const steps = () => [step('Skim'), step('Read'), step('Summarise')];

  it('checks and unchecks one step without touching the others', () => {
    const result = renderTasks([task('Chapter 4', { subtasks: steps() })]);
    const id = idOf(result, 'Chapter 4');

    act(() => result.current.toggleSubtask(id, 'step-Read'));
    expect(result.current.tasks[0].subtasks!.map((s) => s.completed)).toEqual([false, true, false]);
    expect(result.current.tasks[0].completed).toBe(false);

    act(() => result.current.toggleSubtask(id, 'step-Read'));
    expect(result.current.tasks[0].subtasks!.map((s) => s.completed)).toEqual([false, false, false]);
  });

  it('completes the task when its last step is checked, without the excited flash', () => {
    const result = renderTasks([
      task('Chapter 4', { subtasks: [step('Skim', true), step('Read', true), step('Summarise')] }),
      task('Walk'),
    ]);

    act(() => result.current.toggleSubtask(idOf(result, 'Chapter 4'), 'step-Summarise'));

    expect(result.current.tasks[0].completed).toBe(true);
    expect(result.current.completionPercentage).toBe(50);
    expect(result.current.mood).toBe('happy');
  });

  it('keeps the task complete when a step is unchecked again', () => {
    const result = renderTasks([
      task('Chapter 4', { completed: true, subtasks: [step('Skim', true), step('Read', true)] }),
    ]);

    act(() => result.current.toggleSubtask(idOf(result, 'Chapter 4'), 'step-Read'));

    expect(result.current.tasks[0].subtasks!.map((s) => s.completed)).toEqual([true, false]);
    expect(result.current.tasks[0].completed).toBe(true);
  });

  it('saves the change to localStorage', () => {
    const result = renderTasks([task('Chapter 4', { subtasks: steps() })]);

    act(() => result.current.toggleSubtask(idOf(result, 'Chapter 4'), 'step-Skim'));

    const saved: Task[] = JSON.parse(window.localStorage.getItem('pebble-tasks')!);
    expect(saved[0].subtasks![0].completed).toBe(true);
  });
});
