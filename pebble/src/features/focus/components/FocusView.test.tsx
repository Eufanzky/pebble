import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderWithProviders, screen } from '@/test/render';
import { expectLogged } from '@/test/activity';
import { playChime } from '@/shared/lib/audio';
import { FOCUS_SECONDS } from '../lib/timer';
import FocusView from './FocusView';

vi.mock('@/shared/lib/audio', () => ({ playChime: vi.fn(), playTaskComplete: vi.fn() }));

afterEach(() => vi.useRealTimers());

const timer = () => screen.getByRole('timer', { name: 'Time left' });

describe('FocusView', () => {
  it('starts, pauses and resumes a session', async () => {
    const { user } = renderWithProviders(<FocusView />);
    expect(timer()).toHaveTextContent('25:00');

    await user.click(screen.getByRole('button', { name: 'Start Focus Session' }));
    expect(screen.getByText("I'm right here with you.")).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByText('Taking a breather? Pick it up whenever you like.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });

  it('chimes and logs a finished session', async () => {
    vi.useFakeTimers();
    renderWithProviders(<FocusView />);

    act(() => screen.getByRole('button', { name: 'Start Focus Session' }).click());
    act(() => vi.advanceTimersByTime(FOCUS_SECONDS * 1000));

    expect(playChime).toHaveBeenCalledOnce();
    expect(screen.getByText('You focused for 25 minutes. Nice work.')).toBeInTheDocument();
    expect(timer()).toHaveTextContent('25:00');
    vi.useRealTimers(); // the log is saved over the (fake) network
    await expectLogged({ action: expect.stringContaining('Focus session completed') });
  });

  // Roadmap 7.1: no made-up people or participant counts (principle 6).
  it('shows no rooms or other people', () => {
    renderWithProviders(<FocusView />);

    expect(screen.queryByText(/room|people|person|others/i)).not.toBeInTheDocument();
  });
});
