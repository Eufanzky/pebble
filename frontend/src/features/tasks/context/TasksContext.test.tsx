import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders, waitFor } from '@/test/render';
import { server } from '@/test/msw/server';
import { taskHandlers, taskStore } from '@/test/msw/tasks';
import type { Step } from '../types';
import { usePebble } from '@/features/companion';
import { newTask as task, seed } from '../testing';
import { sampleTasks } from '../data/sampleTasks';
import { useTasks } from './TasksContext';

function step(title: string, completed = false): Step {
  return { id: `step-${title}`, title, timeEstimate: '~5 min', completed };
}

/** Puts `tasks` on the (fake) server, renders the provider and waits for the list to load. */
async function renderTasks(tasks: Parameters<typeof seed>[0]) {
  seed(tasks);
  const { result } = renderHookWithProviders(() => ({ ...useTasks(), ...usePebble() }));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  return result;
}

type Result = Awaited<ReturnType<typeof renderTasks>>;

function find(result: Result, title: string) {
  const found = result.current.tasks.find((t) => t.title === title);
  if (!found) throw new Error(`No task titled "${title}"`);
  return found;
}

const idOf = (result: Result, title: string) => find(result, title).id;
const stepId = (result: Result, title: string, stepTitle: string) =>
  find(result, title).steps!.find((s) => s.title === stepTitle)!.id;

function toggle(result: Result, title: string) {
  act(() => result.current.toggleTask(idOf(result, title)));
}

afterEach(() => {
  vi.useRealTimers();
});

describe('loading the list', () => {
  it('loads the tasks the server has, in order', async () => {
    const result = await renderTasks([task('Read'), task('Write', { steps: [step('Outline')] })]);

    expect(result.current.tasks.map((t) => t.title)).toEqual(['Read', 'Write']);
    expect(result.current.tasks[1].steps!.map((s) => s.title)).toEqual(['Outline']);
    expect(result.current.tasks[0].steps).toBeUndefined();
  });

  it('says so when the list could not be loaded, and tries again on request', async () => {
    server.use(taskHandlers.status(503));
    const { result } = renderHookWithProviders(() => useTasks());

    await waitFor(() => expect(result.current.loadFailed).toBe(true));
    expect(result.current.tasks).toEqual([]);

    server.resetHandlers();
    seed([task('Read')]);
    act(() => result.current.retry());

    await waitFor(() => expect(result.current.tasks.map((t) => t.title)).toEqual(['Read']));
    expect(result.current.loadFailed).toBe(false);
  });
});

describe('Pebble mood from task completion', () => {
  it.each([
    { done: 0, total: 4, pct: 0, mood: 'sleepy' },
    { done: 1, total: 4, pct: 25, mood: 'normal' },
    { done: 1, total: 3, pct: 33, mood: 'normal' },
    { done: 2, total: 4, pct: 50, mood: 'happy' },
    { done: 3, total: 4, pct: 75, mood: 'happy' },
    { done: 4, total: 4, pct: 100, mood: 'excited' },
  ])('is $mood when $done of $total tasks are done', async ({ done, total, pct, mood }) => {
    const tasks = Array.from({ length: total }, (_, i) => task(`Task ${i}`, { completed: i < done }));

    const result = await renderTasks(tasks);

    expect(result.current.completionPercentage).toBe(pct);
    expect(result.current.mood).toBe(mood);
  });

  it('is sleepy with no tasks at all', async () => {
    const result = await renderTasks([]);

    expect(result.current.completionPercentage).toBe(0);
    expect(result.current.mood).toBe('sleepy');
  });

  it('follows the percentage as tasks are unchecked', async () => {
    const result = await renderTasks([task('Read', { completed: true }), task('Write', { completed: true })]);
    expect(result.current.mood).toBe('excited');

    toggle(result, 'Read');

    expect(result.current.completionPercentage).toBe(50);
    expect(result.current.mood).toBe('happy');
  });
});

describe('excited flash on completing a task', () => {
  it('flashes excited for 2 seconds, then settles on the derived mood', async () => {
    const result = await renderTasks([task('Read'), task('Write'), task('Walk'), task('Rest')]);
    vi.useFakeTimers();
    expect(result.current.mood).toBe('sleepy');

    toggle(result, 'Read');
    expect(result.current.mood).toBe('excited');

    act(() => vi.advanceTimersByTime(1999));
    expect(result.current.mood).toBe('excited');

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.mood).toBe('normal'); // 1 of 4 done
  });

  it('restarts the 2 seconds when another task is completed during a flash', async () => {
    const result = await renderTasks([task('Read'), task('Write'), task('Walk'), task('Rest')]);
    vi.useFakeTimers();

    toggle(result, 'Read');
    act(() => vi.advanceTimersByTime(1500));
    toggle(result, 'Write');
    act(() => vi.advanceTimersByTime(1500));
    expect(result.current.mood).toBe('excited');

    act(() => vi.advanceTimersByTime(500));
    expect(result.current.mood).toBe('happy'); // 2 of 4 done
  });

  it('does not flash when a task is unchecked', async () => {
    const result = await renderTasks([task('Read', { completed: true }), task('Write'), task('Walk'), task('Rest')]);
    expect(result.current.mood).toBe('normal');

    toggle(result, 'Read');

    expect(result.current.mood).toBe('sleepy');
  });
});

describe('toggling a task step', () => {
  const steps = () => [step('Skim'), step('Read'), step('Summarise')];

  it('checks and unchecks one step without touching the others', async () => {
    const result = await renderTasks([task('Chapter 4', { steps: steps() })]);
    const id = idOf(result, 'Chapter 4');
    const read = stepId(result, 'Chapter 4', 'Read');

    act(() => result.current.toggleStep(id, read));
    expect(result.current.tasks[0].steps!.map((s) => s.completed)).toEqual([false, true, false]);
    expect(result.current.tasks[0].completed).toBe(false);

    act(() => result.current.toggleStep(id, read));
    expect(result.current.tasks[0].steps!.map((s) => s.completed)).toEqual([false, false, false]);
  });

  it('completes the task when its last step is checked, without the excited flash', async () => {
    const result = await renderTasks([
      task('Chapter 4', { steps: [step('Skim', true), step('Read', true), step('Summarise')] }),
      task('Walk'),
    ]);

    act(() => result.current.toggleStep(idOf(result, 'Chapter 4'), stepId(result, 'Chapter 4', 'Summarise')));

    expect(result.current.tasks[0].completed).toBe(true);
    expect(result.current.completionPercentage).toBe(50);
    expect(result.current.mood).toBe('happy');
  });

  it('keeps the task complete when a step is unchecked again', async () => {
    const result = await renderTasks([
      task('Chapter 4', { completed: true, steps: [step('Skim', true), step('Read', true)] }),
    ]);

    act(() => result.current.toggleStep(idOf(result, 'Chapter 4'), stepId(result, 'Chapter 4', 'Read')));

    expect(result.current.tasks[0].steps!.map((s) => s.completed)).toEqual([true, false]);
    expect(result.current.tasks[0].completed).toBe(true);
  });

  it('saves the change on the server', async () => {
    const result = await renderTasks([task('Chapter 4', { steps: steps() })]);

    act(() => result.current.toggleStep(idOf(result, 'Chapter 4'), stepId(result, 'Chapter 4', 'Skim')));

    await waitFor(() => expect(taskStore.all()[0].steps[0].completed).toBe(true));
  });
});

describe('saving changes', () => {
  it('shows a new task at once, then gives it the id the server chose', async () => {
    const result = await renderTasks([]);

    act(() => result.current.addTask(task('Email Sam')));

    expect(result.current.tasks.map((t) => t.title)).toEqual(['Email Sam']);
    await waitFor(() => expect(result.current.tasks[0].id).toBe(taskStore.all()[0].id));
  });

  it('saves changes to a task made before the server answered', async () => {
    const result = await renderTasks([]);

    act(() => result.current.addTask(task('Email Sam', { steps: [step('Open mail'), step('Reply')] })));
    const local = result.current.tasks[0];
    act(() => result.current.toggleStep(local.id, local.steps![0].id));
    act(() => result.current.toggleTask(local.id));

    await waitFor(() => expect(taskStore.all()[0].completed).toBe(true));
    expect(taskStore.all()[0].steps.map((s) => s.completed)).toEqual([true, false]);
    expect(result.current.tasks[0]).toMatchObject({ id: taskStore.all()[0].id, completed: true });
  });

  it('clears the list before adding to it, in the order the user asked', async () => {
    const result = await renderTasks([task('Read'), task('Write')]);

    act(() => {
      result.current.clearAll();
      result.current.addTask(task('Breathe'));
    });

    expect(result.current.tasks.map((t) => t.title)).toEqual(['Breathe']);
    await waitFor(() => expect(taskStore.all().map((t) => t.title)).toEqual(['Breathe']));
  });

  it('asks CalmSense to break a task down, keeps its steps and why, and shows them', async () => {
    const result = await renderTasks([task('Essay')]);

    await act(() => result.current.breakDown(idOf(result, 'Essay')));

    expect(taskStore.breakdowns()).toEqual([{ taskId: idOf(result, 'Essay'), timeOfDay: expect.any(String) }]);
    expect(find(result, 'Essay').steps!.map((s) => s.title)).toEqual(taskStore.all()[0].steps.map((s) => s.title));
    expect(find(result, 'Essay').whyExplanation).toBe('I split this into 3 steps, starting with the easiest.');
    expect(find(result, 'Essay').showSteps).toBe(true);
  });

  it('breaks down a task added a moment ago, once the server has it', async () => {
    const result = await renderTasks([]);

    act(() => result.current.addTask(task('Essay')));
    await act(() => result.current.breakDown(idOf(result, 'Essay')));

    expect(taskStore.breakdowns()).toEqual([{ taskId: taskStore.all()[0].id, timeOfDay: expect.any(String) }]);
    expect(find(result, 'Essay').steps).toHaveLength(3);
  });

  it('leaves the task as it was when CalmSense can\'t answer', async () => {
    const result = await renderTasks([task('Essay')]);
    server.use(taskHandlers.breakdownStatus(503));

    await expect(act(() => result.current.breakDown(idOf(result, 'Essay')))).rejects.toThrow();

    expect(find(result, 'Essay').steps).toBeUndefined();
    expect(result.current.saveFailed).toBe(false);
  });

  it('undoes by the id a task had before the server named it (7.5)', async () => {
    const result = await renderTasks([]);

    let tempId: string | undefined;
    act(() => {
      tempId = result.current.addTask(task('Essay'));
    });
    await waitFor(() => expect(find(result, 'Essay').id).toBe(taskStore.all()[0]?.id));
    act(() => result.current.deleteTask(tempId!));

    expect(result.current.tasks).toEqual([]);
    await waitFor(() => expect(taskStore.all()).toEqual([]));
  });

  it('removes a breakdown: the steps and the why go, the task stays', async () => {
    const result = await renderTasks([task('Essay')]);
    await act(() => result.current.breakDown(idOf(result, 'Essay')));

    act(() => result.current.removeBreakdown(idOf(result, 'Essay')));

    expect(find(result, 'Essay')).toMatchObject({ whyExplanation: '' });
    expect(find(result, 'Essay').steps).toBeUndefined();
    await waitFor(() => expect(taskStore.all()[0]).toMatchObject({ steps: [], whyExplanation: '' }));
  });

  it('shows and hides a task\'s steps', async () => {
    const result = await renderTasks([task('Write', { steps: [step('Outline')] })]);

    act(() => result.current.setStepsShown(idOf(result, 'Write'), true));
    expect(find(result, 'Write').showSteps).toBe(true);

    act(() => result.current.setStepsShown(idOf(result, 'Write'), false));
    expect(find(result, 'Write').showSteps).toBeUndefined();
  });

  it('adds a document action item as a study or communication task, with WhyBot\'s why', async () => {
    const result = await renderTasks([]);

    act(() => result.current.addTaskFromDocument('Hand in the form', 'meeting', 'You chose reading level 3.'));

    await waitFor(() => expect(taskStore.all()).toHaveLength(1));
    expect(taskStore.all()[0]).toMatchObject({
      title: 'Hand in the form',
      tag: 'communication',
      whyExplanation: 'You chose reading level 3.',
    });
  });

  it('adds the example tasks with their steps', async () => {
    const result = await renderTasks([]);

    act(() => result.current.addExampleTasks());

    await waitFor(() => expect(taskStore.all()).toHaveLength(sampleTasks.length));
    expect(taskStore.all()[0].title).toBe(sampleTasks[0].title);
    expect(taskStore.all()[0].steps).toHaveLength(sampleTasks[0].steps!.length);
    // Examples are the user's own to keep, not an AI decision: no "Why?" text (7.4)
    expect(taskStore.all().map((t) => t.whyExplanation)).toEqual(sampleTasks.map(() => ''));
  });

  it('goes back to what the server has when a save fails, and says so', async () => {
    const result = await renderTasks([task('Read')]);
    server.use(...taskHandlers.saveStatus(503));

    toggle(result, 'Read');
    expect(result.current.tasks[0].completed).toBe(true);

    await waitFor(() => expect(result.current.saveFailed).toBe(true));
    await waitFor(() => expect(result.current.tasks[0].completed).toBe(false));

    act(() => result.current.dismissSaveError());
    expect(result.current.saveFailed).toBe(false);
  });
});

describe('editing, deleting and reordering', () => {
  it('saves an edit to the server', async () => {
    const result = await renderTasks([task('Read')]);

    act(() => result.current.editTask(idOf(result, 'Read'), { title: 'Read slowly', tag: 'wellbeing', priority: 'low' }));

    expect(result.current.tasks[0]).toMatchObject({ title: 'Read slowly', tag: 'wellbeing', priority: 'low' });
    await waitFor(() => expect(taskStore.all()[0]).toMatchObject({ title: 'Read slowly', tag: 'wellbeing' }));
  });

  it('sets a due day and starts its bar at once, and removes it again (8.3)', async () => {
    const result = await renderTasks([task('Read')]);
    const id = idOf(result, 'Read');

    act(() => result.current.editTask(id, { due: '2026-10-20' }));

    expect(result.current.tasks[0].due).toBe('2026-10-20');
    expect(result.current.tasks[0].dueSetAt).toEqual(expect.any(String));
    await waitFor(() => expect(taskStore.all()[0].due).toBe('2026-10-20'));

    const setAt = result.current.tasks[0].dueSetAt;
    act(() => result.current.editTask(id, { title: 'Read again', due: '2026-10-20' }));
    expect(result.current.tasks[0].dueSetAt).toBe(setAt);

    act(() => result.current.editTask(id, { due: null }));
    expect(result.current.tasks[0]).toMatchObject({ due: null, dueSetAt: null });
    await waitFor(() => expect(taskStore.all()[0]).toMatchObject({ due: null, dueSetAt: null }));
  });

  it('deletes one task on the server', async () => {
    const result = await renderTasks([task('Read'), task('Write')]);

    act(() => result.current.deleteTask(idOf(result, 'Read')));

    expect(result.current.tasks.map((t) => t.title)).toEqual(['Write']);
    await waitFor(() => expect(taskStore.all().map((t) => t.title)).toEqual(['Write']));
  });

  it('saves a new order, including tasks the server has not answered for yet', async () => {
    const result = await renderTasks([task('Read'), task('Write')]);

    act(() => result.current.addTask(task('Walk')));
    const ids = result.current.tasks.map((t) => t.id);
    act(() => result.current.reorderTasks([ids[2], ids[0], ids[1]]));

    expect(result.current.tasks.map((t) => t.title)).toEqual(['Walk', 'Read', 'Write']);
    await waitFor(() => expect(taskStore.all().map((t) => t.title)).toEqual(['Walk', 'Read', 'Write']));
  });
});
