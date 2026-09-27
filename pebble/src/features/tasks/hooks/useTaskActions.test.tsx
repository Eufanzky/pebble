import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders } from '@/test/render';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { playTaskComplete } from '@/shared/lib/audio';
import { useTasks } from '../context/TasksContext';
import { newTask, seed } from '../testing';
import { useTaskActions } from './useTaskActions';

vi.mock('@/shared/lib/audio', () => ({ playTaskComplete: vi.fn(), playChime: vi.fn() }));

function renderActions() {
  const { result } = renderHookWithProviders(() => ({
    ...useTaskActions(),
    tasks: useTasks().tasks,
    entries: useActivityLog().entries,
  }));
  const idOf = (title: string) => result.current.tasks.find((t) => t.title === title)!.id;
  return { result, idOf };
}

beforeEach(() => {
  seed([
    newTask('Read', { subtasks: [{ id: 's1', title: 'Skim', timeEstimate: '~5 min', completed: false }] }),
    newTask('Walk', { completed: true }),
  ], { chunkSize: 'small' });
});

describe('useTaskActions', () => {
  it('completes a task with a chime and a specific note in the log', () => {
    const { result, idOf } = renderActions();

    act(() => result.current.toggle(idOf('Read')));

    expect(result.current.tasks.find((t) => t.title === 'Read')!.completed).toBe(true);
    expect(playTaskComplete).toHaveBeenCalledOnce();
    expect(result.current.entries[0]).toMatchObject({
      agent: 'PebbleVoice',
      action: 'Nice work! You finished "Read". That\'s 2 of 2 done today.',
    });
  });

  it('unchecks a task gently and without a chime', () => {
    const { result, idOf } = renderActions();

    act(() => result.current.toggle(idOf('Walk')));

    expect(result.current.tasks.find((t) => t.title === 'Walk')!.completed).toBe(false);
    expect(playTaskComplete).not.toHaveBeenCalled();
    expect(result.current.entries[0]).toMatchObject({ action: 'Unchecked "Walk". No worries — take your time.' });
  });

  it('logs a break-down with the chunk-size preference', () => {
    const { result, idOf } = renderActions();

    act(() => result.current.breakDown(idOf('Read')));

    expect(result.current.entries[0]).toMatchObject({
      agent: 'SimplifyCore',
      action: 'Broke down "Read" into 1 steps (small chunks, your preference).',
    });
  });

  it('does not log a break-down for a task without steps', () => {
    const { result, idOf } = renderActions();
    const before = result.current.entries.length;

    act(() => result.current.breakDown(idOf('Walk')));

    expect(result.current.entries).toHaveLength(before);
  });

  it('logs opening the explanation as WhyBot', () => {
    const { result, idOf } = renderActions();

    act(() => result.current.openWhy(idOf('Read')));

    expect(result.current.entries[0]).toMatchObject({ agent: 'WhyBot', action: expect.stringContaining('"Read"') });
  });

  it('toggles a step', () => {
    const { result, idOf } = renderActions();

    act(() => result.current.toggleSubtask(idOf('Read'), 's1'));

    expect(result.current.tasks.find((t) => t.title === 'Read')!.subtasks![0].completed).toBe(true);
  });

  it('ignores an unknown task id', () => {
    const { result } = renderActions();
    const before = result.current.entries.length;

    act(() => {
      result.current.toggle('nope');
      result.current.openWhy('nope');
    });

    expect(result.current.entries).toHaveLength(before);
  });
});
