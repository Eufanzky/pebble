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

    expect(result.current).toMatchObject({ level: 5, defaultLevel: 5, text: 'Fairly simple text.', version: 0 });
  });

  it('changes the text and logs the change as AdaptLens', async () => {
    const { result } = await renderLoadedHook(() => ({ ...useReadingLevel(testDocument()), log: useActivityLog() }));

    act(() => result.current.setLevel(2));

    expect(result.current).toMatchObject({ level: 2, text: 'Very simple text.', version: 1 });
    expect(result.current.log.entries[0]).toMatchObject({
      agent: 'AdaptLens',
      action: 'Reading level adjusted to 2 for "Clean Architecture"',
      reasoning: 'User manually changed reading level from 5 to 2.',
    });
  });
});
