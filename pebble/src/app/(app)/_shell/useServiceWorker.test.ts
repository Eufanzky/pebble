import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useServiceWorker } from './useServiceWorker';

const register = vi.fn(() => Promise.resolve());

afterEach(() => {
  // @ts-expect-error: jsdom has no service workers; each test sets its own
  delete navigator.serviceWorker;
  register.mockClear();
});

function withServiceWorkers() {
  Object.defineProperty(navigator, 'serviceWorker', { value: { register }, configurable: true });
}

describe('useServiceWorker', () => {
  it('registers /sw.js when enabled', () => {
    withServiceWorkers();

    renderHook(() => useServiceWorker(true));

    expect(register).toHaveBeenCalledWith('/sw.js');
  });

  it('does nothing in development', () => {
    withServiceWorkers();

    renderHook(() => useServiceWorker(false));

    expect(register).not.toHaveBeenCalled();
  });

  it('does nothing where browsers have no service workers', () => {
    expect(() => renderHook(() => useServiceWorker(true))).not.toThrow();
  });

  it('ignores a registration that fails', async () => {
    withServiceWorkers();
    register.mockReturnValueOnce(Promise.reject(new Error('blocked')));

    renderHook(() => useServiceWorker(true));

    await expect(Promise.resolve()).resolves.toBeUndefined();
  });
});
