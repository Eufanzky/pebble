import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders } from '@/test/render';
import { useTasks } from '@/features/tasks';
import { VOICE_PHRASES } from '../data/options';
import { LISTEN_MS, useVoiceInputDemo } from './useVoiceInputDemo';

afterEach(() => vi.useRealTimers());

describe('useVoiceInputDemo', () => {
  it('listens, then adds a phrase as a task', () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { result } = renderHookWithProviders(() => ({ ...useVoiceInputDemo(), tasks: useTasks() }));
    act(() => result.current.tasks.clearAll());

    act(() => result.current.listen());
    act(() => result.current.listen()); // ignored while listening
    expect(result.current.listening).toBe(true);

    act(() => vi.advanceTimersByTime(LISTEN_MS));
    expect(result.current.listening).toBe(false);
    expect(result.current.tasks.tasks.map((t) => t.title)).toEqual([VOICE_PHRASES[0]]);
  });

  it('clears its timer on unmount', () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHookWithProviders(() => useVoiceInputDemo());

    act(() => result.current.listen());
    const clear = vi.spyOn(globalThis, 'clearTimeout');
    unmount();

    expect(clear).toHaveBeenCalled();
  });
});
