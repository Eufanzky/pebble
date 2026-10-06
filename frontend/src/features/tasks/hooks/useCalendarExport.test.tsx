import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderLoadedHook, screen } from '@/test/render';
import { server } from '@/test/msw/server';
import { taskHandlers, taskStore } from '@/test/msw/tasks';
import { useTasks } from '../context/TasksContext';
import { localIso } from '../lib/calendar';
import { newTask, seed } from '../testing';
import { useCalendarExport } from './useCalendarExport';

let saved: { file: Blob; name: string }[];

beforeEach(() => {
  saved = [];
  let file: Blob;
  URL.createObjectURL = vi.fn((blob: Blob) => {
    file = blob;
    return 'blob:pebble';
  });
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    saved.push({ file, name: this.download });
  });
  seed([newTask('Read Chapter 4', { steps: [{ id: 's', title: 'Skim', timeEstimate: '~5 min', completed: false }] })]);
});

afterEach(() => vi.restoreAllMocks());

const NOW = new Date(2026, 9, 6, 11, 7);

async function renderExport() {
  return renderLoadedHook(() => {
    const { tasks } = useTasks();
    return useCalendarExport(tasks[0] ?? newTask('none'), () => NOW);
  });
}

describe('useCalendarExport', () => {
  it('saves the plan as a calendar file from the next quarter hour, and says so', async () => {
    const { result } = await renderExport();

    await act(() => result.current.save());

    expect(taskStore.calendarStarts()).toEqual([localIso(new Date(2026, 9, 6, 11, 15))]);
    expect(saved.map((s) => s.name)).toEqual(['read-chapter-4.ics']);
    expect(await saved[0].file.text()).toContain('SUMMARY:Read Chapter 4');
    expect(screen.getByRole('status')).toHaveTextContent(/Saved "Read Chapter 4" as a calendar file, starting at/);
  });

  it('says so gently when BridgeBot can\'t make the file, and saves nothing', async () => {
    server.use(taskHandlers.calendarStatus(503));
    const { result } = await renderExport();

    await act(() => result.current.save());

    expect(saved).toEqual([]);
    expect(screen.getByRole('status')).toHaveTextContent("BridgeBot couldn't make the calendar file just now.");
    expect(result.current.busy).toBe(false);
  });
});
