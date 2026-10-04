import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useReadAloud } from './useReadAloud';

class FakeUtterance {
  rate = 1;
  pitch = 1;
  onboundary: ((e: { name: string }) => void) | null = null;
  onend: (() => void) | null = null;
  constructor(readonly text: string) {}
}

const speech = { speak: vi.fn(), cancel: vi.fn() };
const spoken = () => speech.speak.mock.lastCall?.[0] as FakeUtterance;

beforeEach(() => {
  speech.speak.mockClear();
  speech.cancel.mockClear();
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  Object.defineProperty(window, 'speechSynthesis', { value: speech, configurable: true });
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(window, 'speechSynthesis');
});

describe('useReadAloud', () => {
  it('speaks the text slowly and follows the words', () => {
    const { result } = renderHook(() => useReadAloud('one two three'));

    act(() => result.current.toggle());

    expect(result.current.reading).toBe(true);
    expect(spoken()).toMatchObject({ text: 'one two three', rate: 0.9 });

    act(() => {
      spoken().onboundary!({ name: 'word' });
      spoken().onboundary!({ name: 'sentence' });
      spoken().onboundary!({ name: 'word' });
    });
    expect(result.current.wordIndex).toBe(1);

    act(() => spoken().onend!());
    expect(result.current).toMatchObject({ reading: false, wordIndex: -1 });
  });

  it('stops when toggled again', () => {
    const { result } = renderHook(() => useReadAloud('text'));
    act(() => result.current.toggle());

    act(() => result.current.toggle());

    expect(result.current.reading).toBe(false);
    expect(speech.cancel).toHaveBeenCalled();
  });

  it('stops speaking on unmount', () => {
    const { result, unmount } = renderHook(() => useReadAloud('text'));
    act(() => result.current.toggle());
    speech.cancel.mockClear();

    unmount();

    expect(speech.cancel).toHaveBeenCalled();
  });

  it('does nothing without speech synthesis', () => {
    Reflect.deleteProperty(window, 'speechSynthesis');
    const { result } = renderHook(() => useReadAloud('text'));

    act(() => result.current.toggle());

    expect(speech.speak).not.toHaveBeenCalled();
  });
});
