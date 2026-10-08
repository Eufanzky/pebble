import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { server } from '@/test/msw/server';
import { quietStats, statsHandlers, statsStore } from '@/test/msw/stats';
import ProgressSoFar from './ProgressSoFar';

const withAllTime = (allTime: { tasks: number; steps: number; focusMinutes: number }) =>
  statsStore.set((days) => ({ ...quietStats(days), allTime }));

describe('ProgressSoFar', () => {
  it('says what was finished since the start', async () => {
    withAllTime({ tasks: 3, steps: 14, focusMinutes: 50 });

    renderWithProviders(<ProgressSoFar />);

    expect(await screen.findByText('Since you started: 14 steps, 3 tasks and 50 minutes of focus.')).toBeInTheDocument();
  });

  it('shows nothing before there is anything to count', async () => {
    let asked = false;
    statsStore.set((days) => {
      asked = true;
      return quietStats(days);
    });

    const { container } = renderWithProviders(<ProgressSoFar />);

    await waitFor(() => expect(asked).toBe(true));
    expect(container).toBeEmptyDOMElement();
  });

  it('shows nothing when the stats can’t be loaded', async () => {
    server.use(statsHandlers.status(503));

    const { container } = renderWithProviders(<ProgressSoFar />);

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(container).toBeEmptyDOMElement();
  });
});
