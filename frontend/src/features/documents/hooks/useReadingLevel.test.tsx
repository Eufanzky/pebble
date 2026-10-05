import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHookWithProviders, renderLoadedHook } from '@/test/render';
import { setTestPreferences } from '@/test/preferences';
import { useActivityLog } from '@/features/activity';
import { testDocument } from '../testing';
import { useReadingLevel } from './useReadingLevel';

beforeEach(() => {
  setTestPreferences({ readingLevel: 5 });
});

describe('useReadingLevel', () => {
  it("starts at the user's default level", () => {
    const { result } = renderHookWithProviders(() => useReadingLevel(testDocument()));

    expect(result.current).toMatchObject({ level: 5, defaultLevel: 5, version: 0 });
    expect(result.current.simplified).toMatchObject({ status: 'ready', text: 'Fairly simple text.' });
  });

  it('changes the text, and logs nothing in an agent\'s name', async () => {
    const { result } = await renderLoadedHook(() => ({ ...useReadingLevel(testDocument()), log: useActivityLog() }));

    act(() => result.current.setLevel(2));

    expect(result.current).toMatchObject({ level: 2, version: 1 });
    expect(result.current.simplified.text).toBe('Very simple text.');
    expect(result.current.log.entries).toEqual([]);
  });
});
