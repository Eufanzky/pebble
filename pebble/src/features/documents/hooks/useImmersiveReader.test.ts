import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { readerHandlers } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { useImmersiveReader } from './useImmersiveReader';

const launchAsync = vi.fn();
vi.mock('@microsoft/immersive-reader-sdk', () => ({ launchAsync: (...args: unknown[]) => launchAsync(...args) }));

// Stable across renders, as the component's is
const onExit = vi.fn();

beforeEach(() => {
  launchAsync.mockReset();
});

describe('useImmersiveReader', () => {
  it('falls back to the built-in reader when Immersive Reader is not configured', async () => {
    const { result } = renderHook(() => useImmersiveReader('text', 'Doc', 'en', onExit));

    expect(result.current).toBe('loading');
    await waitFor(() => expect(result.current).toBe('built-in'));
    expect(launchAsync).not.toHaveBeenCalled();
  });

  it('launches Azure Immersive Reader with the token', async () => {
    server.use(readerHandlers.token());
    launchAsync.mockResolvedValue({});

    const { result } = renderHook(() => useImmersiveReader('Some text', 'Doc', 'en', onExit));

    await waitFor(() => expect(result.current).toBe('azure'));
    expect(launchAsync).toHaveBeenCalledWith(
      'test-token',
      'test',
      { title: 'Doc', chunks: [{ content: 'Some text', lang: 'en', mimeType: 'text/plain' }] },
      { onExit, uiZIndex: 70 },
    );
  });

  it('falls back when the SDK fails', async () => {
    server.use(readerHandlers.token());
    launchAsync.mockImplementation(() => {
      throw new Error('blocked');
    });

    const { result } = renderHook(() => useImmersiveReader('text', 'Doc', 'en', onExit));

    await waitFor(() => expect(result.current).toBe('built-in'));
  });
});
