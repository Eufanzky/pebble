import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { BREAK_DOWN_MS, useBreakDown } from './useBreakDown';

afterEach(() => vi.useRealTimers());

describe('useBreakDown', () => {
  it('starts with the steps shown or hidden as stored', () => {
    expect(renderHook(() => useBreakDown(true, false, vi.fn())).result.current.showSteps).toBe(true);
    expect(renderHook(() => useBreakDown(false, false, vi.fn())).result.current.showSteps).toBe(false);
  });

  it('shows the steps at once with reduce-animations on', () => {
    const onShown = vi.fn();
    const { result } = renderHook(() => useBreakDown(false, true, onShown));

    act(() => result.current.breakDown());

    expect(result.current).toMatchObject({ showSteps: true, breaking: false });
    expect(onShown).toHaveBeenCalledOnce();
  });

  it('plays the shimmer first with animations on', () => {
    vi.useFakeTimers();
    const onShown = vi.fn();
    const { result } = renderHook(() => useBreakDown(false, false, onShown));

    act(() => result.current.breakDown());
    expect(result.current).toMatchObject({ showSteps: false, breaking: true });
    expect(onShown).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(BREAK_DOWN_MS));
    expect(result.current).toMatchObject({ showSteps: true, breaking: false });
    expect(onShown).toHaveBeenCalledOnce();
  });

  it('does nothing after unmounting mid-shimmer', () => {
    vi.useFakeTimers();
    const onShown = vi.fn();
    const { result, unmount } = renderHook(() => useBreakDown(false, false, onShown));

    act(() => result.current.breakDown());
    unmount();
    vi.advanceTimersByTime(BREAK_DOWN_MS);

    expect(onShown).not.toHaveBeenCalled();
  });
});
