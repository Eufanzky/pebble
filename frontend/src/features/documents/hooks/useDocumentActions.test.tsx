import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderLoadedHook } from '@/test/render';
import { useActivityLog } from '@/features/activity';
import { useTasks } from '@/features/tasks';
import { testDocument } from '../testing';
import { useDocumentActions } from './useDocumentActions';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

async function renderActions(doc = testDocument(), onDone = vi.fn()) {
  const { result } = await renderLoadedHook(() => ({
    ...useDocumentActions(doc, onDone),
    tasks: useTasks(),
    log: useActivityLog(),
  }));
  return { result, onDone };
}

beforeEach(() => {
  push.mockClear();
});

describe('useDocumentActions', () => {
  it('adds each extracted task to Today, then closes and goes there', async () => {
    const { result, onDone } = await renderActions();

    act(() => result.current.turnIntoTasks());

    expect(result.current.tasks.tasks.map((t) => t.title)).toEqual(['Read chapter 1', 'Summarise the goal']);
    expect(result.current.tasks.tasks[0].whyExplanation).toContain('"Clean Architecture"');
    expect(result.current.log.entries[0]).toMatchObject({ agent: 'SimplifyCore', action: expect.stringContaining('Extracted 2 tasks') });
    expect(onDone).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith('/today');
  });

  it('makes a study plan with one day per task', async () => {
    const { result } = await renderActions();

    act(() => result.current.makeStudyPlan());

    expect(result.current.tasks.tasks.map((t) => t.title)).toEqual(['Day 1: Read chapter 1', 'Day 2: Summarise the goal']);
    expect(result.current.log.entries[0]).toMatchObject({ action: expect.stringContaining('study plan') });
  });

  it('tags tasks from a meeting as communication, others as study', async () => {
    const meeting = await renderActions(testDocument({ type: 'meeting' }));
    act(() => meeting.result.current.turnIntoTasks());
    expect(meeting.result.current.tasks.tasks[0].tag).toBe('communication');

    const reading = await renderActions(testDocument({ type: 'academic' }));
    act(() => reading.result.current.turnIntoTasks());
    expect(reading.result.current.tasks.tasks.at(-1)!.tag).toBe('study');
  });

  it('logs opening the reader', async () => {
    const { result } = await renderActions();

    act(() => result.current.logReaderOpened());

    expect(result.current.log.entries[0]).toMatchObject({ agent: 'PebbleVoice', action: 'Opened the reader for "Clean Architecture"' });
  });
});
