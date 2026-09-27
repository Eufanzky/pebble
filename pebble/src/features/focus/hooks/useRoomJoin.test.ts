import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { OTHER_ROOMS } from '../data/rooms';
import { JOIN_MS, JOIN_STEP_MS, useRoomJoin } from './useRoomJoin';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const room = OTHER_ROOMS[0];

describe('useRoomJoin', () => {
  it('steps through the loading screen, then enters the room', () => {
    const onJoined = vi.fn();
    const { result } = renderHook(() => useRoomJoin(onJoined));

    act(() => result.current.join(room));
    expect(result.current).toMatchObject({ joining: true, step: 0, room: null });

    act(() => vi.advanceTimersByTime(JOIN_STEP_MS * 2));
    expect(result.current.step).toBe(2);

    act(() => vi.advanceTimersByTime(JOIN_MS));
    expect(result.current).toMatchObject({ joining: false, step: 4, room });
    expect(onJoined).toHaveBeenCalledWith(room);
  });

  it('leaves the room', () => {
    const { result } = renderHook(() => useRoomJoin(vi.fn()));
    act(() => result.current.join(room));
    act(() => vi.advanceTimersByTime(JOIN_MS));

    act(() => result.current.leave());

    expect(result.current.room).toBeNull();
  });

  it('does not join after the page goes away', () => {
    const onJoined = vi.fn();
    const { result, unmount } = renderHook(() => useRoomJoin(onJoined));

    act(() => result.current.join(room));
    unmount();
    vi.advanceTimersByTime(JOIN_MS);

    expect(onJoined).not.toHaveBeenCalled();
  });
});
