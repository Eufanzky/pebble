import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRipple } from './useRipple';

afterEach(() => vi.useRealTimers());

describe('useRipple', () => {
  it('shows a ripple briefly', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useRipple(false));

    act(() => result.current.trigger());
    expect(result.current.ripple).toBe(true);

    act(() => vi.advanceTimersByTime(400));
    expect(result.current.ripple).toBe(false);
  });

  it('never ripples with reduce-animations on', () => {
    const { result } = renderHook(() => useRipple(true));

    act(() => result.current.trigger());

    expect(result.current.ripple).toBe(false);
  });

  it('clears its timer on unmount', () => {
    vi.useFakeTimers();
    const { result, unmount } = renderHook(() => useRipple(false));

    act(() => result.current.trigger());
    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });
});
