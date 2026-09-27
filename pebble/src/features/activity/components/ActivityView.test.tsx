import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook, renderHookWithProviders, renderWithProviders, screen, within } from '@/test/render';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { useActivityLog } from '../context/ActivityLogContext';
import ActivityView from './ActivityView';

// The log is cached at module level; each test writes the entries it needs.
function seedLog(count: number) {
  const storage = renderHook(() => useLocalStorage<unknown[]>('pebble-activity', []));
  act(() => storage.result.current[1]([]));
  storage.unmount();
  const { result, unmount } = renderHookWithProviders(() => useActivityLog());
  act(() => {
    for (let i = 0; i < count; i++) {
      result.current.addEntry(i % 2 ? 'WhyBot' : 'CalmSense', `Action ${i}`, `Because ${i}`, i === 0 ? 'flagged' : 'passed');
    }
  });
  unmount();
}

beforeEach(() => seedLog(10));

describe('ActivityView', () => {
  it('shows the counts and the newest entries first', () => {
    renderWithProviders(<ActivityView />);

    expect(screen.getByText('Showing 8 of 10 entries')).toBeInTheDocument();
    expect(screen.getAllByText(/^Action \d$/)[0]).toHaveTextContent('Action 9');
    expect(screen.getByText('Decisions made').parentElement).toHaveTextContent('10');
  });

  it('filters by agent and shows more on request', async () => {
    const { user } = renderWithProviders(<ActivityView />);

    await user.click(screen.getByRole('button', { name: 'Show 2 more' }));
    expect(screen.getByText('Showing 10 of 10 entries')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filter by WhyBot' }));
    expect(screen.getByText('Showing 5 of 5 entries')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filter by WhyBot (active)' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(screen.getByRole('button', { name: 'Filter by BridgeBot' }));
    expect(screen.getByText('No entries from BridgeBot yet.')).toBeInTheDocument();
  });

  it("shows an entry's reasoning and safety status", async () => {
    const { user } = renderWithProviders(<ActivityView />);
    const card = screen.getByText('Action 9').closest('.activity-entry') as HTMLElement;

    await user.click(within(card).getByRole('button', { name: 'Show reasoning' }));

    expect(within(card).getByText('Because 9')).toBeVisible();
    expect(within(card).getByText('Content Safety: passed')).toBeInTheDocument();
  });

  it('shows a quiet empty state', () => {
    seedLog(0);
    renderWithProviders(<ActivityView />);

    expect(screen.getByText(/Nothing here yet/)).toBeInTheDocument();
  });

  it('says where the log lives, not a service it does not use', () => {
    renderWithProviders(<ActivityView />);

    expect(screen.getByText(/This log stays in your browser/)).toBeInTheDocument();
    expect(screen.queryByText(/Foundry/)).not.toBeInTheDocument();
  });
});
