import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderWithProviders, screen, within } from '@/test/render';
import { playChime } from '@/shared/lib/audio';
import { JOIN_MS } from '../hooks/useRoomJoin';
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
    expect(screen.getByText("The room is focused. I'm right here with you.")).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByText('Taking a breather? The room will wait.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });

  it('chimes and logs a finished session', () => {
    vi.useFakeTimers();
    renderWithProviders(<FocusView />);

    act(() => screen.getByRole('button', { name: 'Start Focus Session' }).click());
    act(() => vi.advanceTimersByTime(FOCUS_SECONDS * 1000));

    expect(playChime).toHaveBeenCalledOnce();
    expect(screen.getByText('Great session! You focused for 25 minutes')).toBeInTheDocument();
    expect(timer()).toHaveTextContent('25:00');
    expect(JSON.parse(window.localStorage.getItem('pebble-activity')!)[0]).toMatchObject({ action: expect.stringContaining('Focus session completed') });
  });

  it('joins a room and leaves it', () => {
    vi.useFakeTimers();
    renderWithProviders(<FocusView />);

    act(() => screen.getByRole('button', { name: /Late Night Club/ }).click());
    expect(screen.getByRole('status', { name: 'Joining the room' })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(JOIN_MS));
    const room = screen.getByRole('dialog', { name: 'Late Night Club' });
    expect(within(room).getByText('3 people in room')).toBeInTheDocument();
    expect(within(room).getByText('You')).toBeInTheDocument();

    act(() => within(room).getByRole('button', { name: 'Leave Room' }).click());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Welcome back! You can join another room anytime.')).toBeInTheDocument();
  });
});
