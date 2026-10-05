import { describe, expect, it } from 'vitest';
import { act, renderHookWithProviders, waitFor } from '@/test/render';
import { server } from '@/test/msw/server';
import { taskHandlers, taskStore } from '@/test/msw/tasks';
import { useTasks } from '../context/TasksContext';
import { newTask, seed } from '../testing';
import { useBreakDown } from './useBreakDown';

async function renderFor(title: string) {
  seed([newTask(title)]);
  const tasks = renderHookWithProviders(() => useTasks());
  await waitFor(() => expect(tasks.result.current.isLoading).toBe(false));
  const id = tasks.result.current.tasks[0].id;
  return renderHookWithProviders(() => useBreakDown(id));
}

describe('useBreakDown', () => {
  it('is working only while CalmSense is asked, then idle again', async () => {
    const { result } = await renderFor('Write the essay');
    expect(result.current.status).toBe('idle');

    let done: Promise<void> = Promise.resolve();
    act(() => {
      done = result.current.start();
    });
    expect(result.current.status).toBe('working');

    await act(() => done);
    expect(result.current.status).toBe('idle');
    expect(taskStore.breakdowns()).toHaveLength(1);
  });

  it('is failed when CalmSense can\'t answer', async () => {
    server.use(taskHandlers.breakdownStatus(503));
    const { result } = await renderFor('Write the essay');

    await act(() => result.current.start());

    expect(result.current.status).toBe('failed');
  });
});
