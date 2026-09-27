import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTodayClock } from './useTodayClock';

afterEach(() => vi.useRealTimers());

describe('useTodayClock', () => {
  it("reads today's date and the hour from the clock", () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 8, 27, 15, 30));

    const { result } = renderHook(() => useTodayClock());

    expect(result.current).toEqual({ formattedDate: 'Sunday, September 27', hour: 15 });
  });
});
