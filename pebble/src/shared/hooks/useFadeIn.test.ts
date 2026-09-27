import { describe, expect, it } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFadeIn } from './useFadeIn';

describe('useFadeIn', () => {
  it('starts hidden and turns visible on the next frame', async () => {
    const { result } = renderHook(() => useFadeIn());

    expect(result.current).toBe(false);
    await waitFor(() => expect(result.current).toBe(true));
  });
});
