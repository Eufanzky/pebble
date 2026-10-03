import { http, HttpResponse } from 'msw';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen, waitFor, within } from '@/test/render';
import { server } from '@/test/msw/server';
import { quietStats, statsHandlers, statsStore } from '@/test/msw/stats';
import StatsView from './StatsView';

function busyStats(days: number) {
  const stats = quietStats(days);
  stats.days[days - 1] = { ...stats.days[days - 1], steps: 3, tasks: 1, focusMinutes: 25 };
  stats.days[days - 2] = { ...stats.days[days - 2], steps: 2 };
  return {
    ...stats,
    totals: { steps: 5, tasks: 1, focusMinutes: 25 },
    byTag: { study: 1, communication: 0, project: 0, wellbeing: 0 },
    allTime: { steps: 48, tasks: 15, focusMinutes: 360 },
  };
}

describe('StatsView', () => {
  it('sums up the range in a sentence, and everything since the start', async () => {
    statsStore.set(busyStats);
    renderWithProviders(<StatsView />);

    expect(
      await screen.findByText('In the last 7 days you finished 5 steps and 1 task, and focused for 25 minutes.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Since you started: 48 steps, 15 tasks and 6 hours of focus.')).toBeInTheDocument();
  });

  it('switches to the last 30 days', async () => {
    const asked: string[] = [];
    server.events.on('request:start', ({ request }) => {
      if (request.url.includes('/api/stats')) asked.push(new URL(request.url).searchParams.get('days')!);
    });
    const { user } = renderWithProviders(<StatsView />);
    await screen.findByText(/One small step is enough/);

    await user.click(screen.getByRole('button', { name: 'Last 30 days' }));

    await waitFor(() => expect(asked).toContain('30'));
    expect(screen.getByRole('button', { name: 'Last 30 days' })).toHaveAttribute('aria-pressed', 'true');
    server.events.removeAllListeners('request:start');
  });

  it('shows each day as a chart and as a table, for the measure picked', async () => {
    statsStore.set(busyStats);
    const { user } = renderWithProviders(<StatsView />);
    await screen.findByText(/you finished 5 steps/);

    expect(screen.getByRole('group', { name: /^Steps each day/ })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Focus minutes' }));
    expect(screen.getByRole('group', { name: /^Focus minutes each day/ })).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(8);
    expect(within(table).getAllByRole('row')[7]).toHaveTextContent('3125');
  });

  it('reads a day out with the arrow keys', async () => {
    statsStore.set(busyStats);
    const { user } = renderWithProviders(<StatsView />);
    await screen.findByText(/you finished 5 steps/);

    screen.getByRole('group', { name: /^Steps each day/ }).focus();
    await user.keyboard('{End}');
    expect(screen.getByText(/: 3 steps$/)).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByText(/: 2 steps$/)).toBeInTheDocument();
  });

  it('names every tag beside its bar', async () => {
    statsStore.set(busyStats);
    renderWithProviders(<StatsView />);
    await screen.findByText(/you finished 5 steps/);

    const rows = within(screen.getByRole('region', { name: 'Tasks finished by tag' })).getAllByRole('listitem');
    expect(rows.map((r) => r.textContent)).toEqual(['Study1', 'Comms0', 'Project0', 'Wellbeing0']);
  });

  it('offers to try again when progress could not load', async () => {
    server.use(statsHandlers.status(503));
    const { user } = renderWithProviders(<StatsView />);

    expect(await screen.findByText("Pebble couldn't load your progress just now.")).toBeInTheDocument();
    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await screen.findByText(/One small step is enough/)).toBeInTheDocument();
  });

  it('asks for the user’s time zone', async () => {
    let tz: string | null = null;
    server.use(
      http.get('/api/stats', ({ request }) => {
        tz = new URL(request.url).searchParams.get('tz');
        return HttpResponse.json(quietStats(7));
      }),
    );
    renderWithProviders(<StatsView />);

    await waitFor(() => expect(tz).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone));
  });

  it('has no axe violations', async () => {
    statsStore.set(busyStats);
    const { container } = renderWithProviders(<StatsView />);
    await screen.findByText(/you finished 5 steps/);

    expect(await axe(container)).toHaveNoViolations();
  });
});
