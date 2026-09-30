import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders, screen, within } from '@/test/render';
import { accountStore } from '@/test/msw/account';
import ActivityView from './ActivityView';

// Puts `count` entries in the account's log, newest last ("Action 0" is the oldest).
function seedLog(count: number) {
  accountStore.setActivity(
    Array.from({ length: count }, (_, i) => ({
      timestamp: new Date(2026, 8, 29, 9, i).toISOString(),
      agent: i % 2 ? ('WhyBot' as const) : ('CalmSense' as const),
      action: `Action ${i}`,
      reasoning: `Because ${i}`,
      safetyStatus: i === 0 ? ('flagged' as const) : ('passed' as const),
    })).reverse(),
  );
}

beforeEach(() => seedLog(10));

describe('ActivityView', () => {
  it('shows the counts and the newest entries first', async () => {
    renderWithProviders(<ActivityView />);

    expect(await screen.findByText('Showing 8 of 10 entries')).toBeInTheDocument();
    expect(screen.getAllByText(/^Action \d$/)[0]).toHaveTextContent('Action 9');
    expect(screen.getByText('Decisions made').parentElement).toHaveTextContent('10');
  });

  it('filters by agent and shows more on request', async () => {
    const { user } = renderWithProviders(<ActivityView />);

    await user.click(await screen.findByRole('button', { name: 'Show 2 more' }));
    expect(screen.getByText('Showing 10 of 10 entries')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filter by WhyBot' }));
    expect(screen.getByText('Showing 5 of 5 entries')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filter by WhyBot (active)' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Filter by BridgeBot' }));
    expect(screen.getByText('No entries from BridgeBot yet.')).toBeInTheDocument();
  });

  it("shows an entry's reasoning and safety status", async () => {
    const { user } = renderWithProviders(<ActivityView />);
    const card = (await screen.findByText('Action 9')).closest('.activity-entry') as HTMLElement;

    await user.click(within(card).getByRole('button', { name: 'Show reasoning' }));

    expect(within(card).getByText('Because 9')).toBeVisible();
    expect(within(card).getByText('Content Safety: passed')).toBeInTheDocument();
  });

  it('shows a quiet empty state', async () => {
    seedLog(0);
    renderWithProviders(<ActivityView />);

    expect(await screen.findByText(/Nothing here yet/)).toBeInTheDocument();
  });

  it('says where the log lives, not a service it does not use', () => {
    renderWithProviders(<ActivityView />);

    expect(screen.getByText(/This log is saved with your account/)).toBeInTheDocument();
    expect(screen.queryByText(/Foundry/)).not.toBeInTheDocument();
  });
});
