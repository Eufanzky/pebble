import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHookWithProviders, waitFor } from '@/test/render';
import { useActivityLog } from '@/features/activity';
import { useTasks } from '../context/TasksContext';
import { newTask, seed } from '../testing';
import { useAddTask } from './useAddTask';

async function renderAddTask() {
  const rendered = renderHookWithProviders(() => ({
    ...useAddTask(),
    tasks: useTasks().tasks,
    loading: useTasks().isLoading,
    entries: useActivityLog().entries,
  }));
  await waitFor(() => expect(rendered.result.current.loading).toBe(false));
  return rendered;
}

function type(result: Awaited<ReturnType<typeof renderAddTask>>['result'], text: string) {
  act(() => result.current.setInput(text));
  act(() => result.current.submit());
}

beforeEach(() => seed([newTask('Existing')]));

describe('useAddTask', () => {
  it('adds a task and clears the field', async () => {
    const { result } = await renderAddTask();

    type(result, '  Email Sam  ');

    expect(result.current.tasks.map((t) => t.title)).toEqual(['Existing', 'Email Sam']);
    expect(result.current.tasks[1]).toMatchObject({ tag: 'project', timeEstimate: '~15 min', completed: false });
    expect(result.current.input).toBe('');
    expect(result.current.entries).toEqual([]);
  });

  it('ignores a blank entry', async () => {
    const { result } = await renderAddTask();

    type(result, '   ');

    expect(result.current.tasks).toHaveLength(1);
  });

  it('offers support instead of adding a task on distress', async () => {
    const { result } = await renderAddTask();

    type(result, "I can't do this");

    expect(result.current.showDistress).toBe(true);
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.input).toBe('');
    expect(result.current.entries).toEqual([]);
  });

  it('starts fresh with one breathing task', async () => {
    const { result } = await renderAddTask();
    type(result, "I'm overwhelmed");

    act(() => result.current.startFresh());

    expect(result.current.showDistress).toBe(false);
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0]).toMatchObject({ title: 'Take 5 minutes to breathe', tag: 'wellbeing' });
  });

  it('keeps the tasks when the user is okay to go on', async () => {
    const { result } = await renderAddTask();
    type(result, 'too much');

    act(() => result.current.keepGoing());

    expect(result.current.showDistress).toBe(false);
    expect(result.current.tasks.map((t) => t.title)).toEqual(['Existing']);
    expect(result.current.entries).toEqual([]);
  });
});
