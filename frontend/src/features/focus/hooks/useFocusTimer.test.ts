import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { FOCUS_SECONDS } from '../lib/timer';
import { useFocusTimer } from './useFocusTimer';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useFocusTimer', () => {
  it('counts down once started', () => {
    const { result } = renderHook(() => useFocusTimer(vi.fn()));
    expect(result.current).toMatchObject({ state: 'idle', secondsLeft: FOCUS_SECONDS });

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(3000));

    expect(result.current).toMatchObject({ state: 'running', secondsLeft: FOCUS_SECONDS - 3 });
  });

  it('keeps the time left while paused, and goes on after resume', () => {
    const { result } = renderHook(() => useFocusTimer(vi.fn()));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(5000));

    act(() => result.current.pause());
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current).toMatchObject({ state: 'paused', secondsLeft: FOCUS_SECONDS - 5 });

    act(() => result.current.resume());
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(FOCUS_SECONDS - 6);
  });

  it('finishes once after 25 minutes and resets', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useFocusTimer(onComplete));

    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(FOCUS_SECONDS * 1000));

    expect(onComplete).toHaveBeenCalledOnce();
    expect(result.current).toMatchObject({ state: 'idle', secondsLeft: FOCUS_SECONDS });

    act(() => vi.advanceTimersByTime(10_000));
    expect(result.current.secondsLeft).toBe(FOCUS_SECONDS);
  });

  it('stops early: returns the seconds focused, resets, and never calls onComplete', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useFocusTimer(onComplete));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(12 * 60 * 1000 + 30_000));

    let focused = 0;
    act(() => {
      focused = result.current.stop();
    });

    expect(focused).toBe(12 * 60 + 30);
    expect(result.current).toMatchObject({ state: 'idle', secondsLeft: FOCUS_SECONDS });
    act(() => vi.advanceTimersByTime(FOCUS_SECONDS * 1000));
    expect(onComplete).not.toHaveBeenCalled();
    expect(result.current.secondsLeft).toBe(FOCUS_SECONDS);
  });

  it('stops from a pause with the time focused before it', () => {
    const { result } = renderHook(() => useFocusTimer(vi.fn()));
    act(() => result.current.start());
    act(() => vi.advanceTimersByTime(90_000));
    act(() => result.current.pause());
    act(() => vi.advanceTimersByTime(10 * 60 * 1000));

    let focused = 0;
    act(() => {
      focused = result.current.stop();
    });
    expect(focused).toBe(90);
  });
});
