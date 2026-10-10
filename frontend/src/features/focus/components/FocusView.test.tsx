import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderWithProviders, screen, waitFor } from '@/test/render';
import { statsStore } from '@/test/msw/stats';
import { taskStore } from '@/test/msw/tasks';
import { newTask, seed } from '@/features/tasks/testing';
import { playChime } from '@/shared/lib/audio';
import { FOCUS_SECONDS } from '../lib/timer';
import FocusView from './FocusView';

vi.mock('@/shared/lib/audio', () => ({ playChime: vi.fn(), playTaskComplete: vi.fn() }));

afterEach(() => vi.useRealTimers());

const timer = () => screen.getByRole('timer', { name: 'Time left' });

const steps = [
  { id: 's1', title: 'Open the doc', timeEstimate: '~5 min', completed: true },
  { id: 's2', title: 'Write the intro', timeEstimate: '~20 min', completed: false },
  { id: 's3', title: 'Read it once', timeEstimate: '~5 min', completed: false },
];
// seed() names the first task `seeded-1` and its steps `seeded-1-1`…
const seedReport = () => seed([newTask('Write the report', { steps })]);

describe('FocusView', () => {
  it('starts, pauses and resumes a session', async () => {
    const { user } = renderWithProviders(<FocusView />);
    expect(timer()).toHaveTextContent('25:00');

    await user.click(screen.getByRole('button', { name: 'Start focus session' }));
    expect(screen.getByText("I'm right here with you.")).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByText('Taking a breather? Pick it up whenever you like.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resume' })).toBeInTheDocument();
  });

  it('chimes at the end of a session', async () => {
    vi.useFakeTimers();
    renderWithProviders(<FocusView />);

    act(() => screen.getByRole('button', { name: 'Start focus session' }).click());
    act(() => vi.advanceTimersByTime(FOCUS_SECONDS * 1000));

    expect(playChime).toHaveBeenCalledOnce();
    expect(screen.getByText('You focused for 25 minutes. Nice work.')).toBeInTheDocument();
    expect(timer()).toHaveTextContent('25:00');
    vi.useRealTimers(); // the minutes are saved over the (fake) network
    // The minutes count towards progress (5.6)
    await waitFor(() => expect(statsStore.focusSessions()).toEqual([25]));
  });

  // Roadmap 9.1: no made-up people or participant counts (principle 6).
  it('shows no rooms or other people', () => {
    renderWithProviders(<FocusView />);

    expect(screen.queryByText(/room|people|person|others/i)).not.toBeInTheDocument();
  });
});

// Roadmap 9.2: stopping early is fine, and what was focused counts.
describe('stopping early', () => {
  it('stops at any point, resets, and counts the whole minutes focused', async () => {
    vi.useFakeTimers();
    renderWithProviders(<FocusView />);

    act(() => screen.getByRole('button', { name: 'Start focus session' }).click());
    act(() => vi.advanceTimersByTime((12 * 60 + 40) * 1000));
    act(() => screen.getByRole('button', { name: 'Stop' }).click());

    expect(screen.getByText('You focused for 12 minutes. That counts.')).toBeInTheDocument();
    expect(timer()).toHaveTextContent('25:00');
    expect(screen.getByRole('button', { name: 'Start focus session' })).toBeInTheDocument();
    expect(playChime).not.toHaveBeenCalled();
    vi.useRealTimers();
    await waitFor(() => expect(statsStore.focusSessions()).toEqual([12]));
  });

  it('can stop from a pause', async () => {
    vi.useFakeTimers();
    renderWithProviders(<FocusView />);

    act(() => screen.getByRole('button', { name: 'Start focus session' }).click());
    act(() => vi.advanceTimersByTime(3 * 60 * 1000));
    act(() => screen.getByRole('button', { name: 'Pause' }).click());
    act(() => screen.getByRole('button', { name: 'Stop' }).click());

    expect(screen.getByText('You focused for 3 minutes. That counts.')).toBeInTheDocument();
    vi.useRealTimers();
    await waitFor(() => expect(statsStore.focusSessions()).toEqual([3]));
  });

  it('under a minute, says so kindly and saves nothing', async () => {
    const { user } = renderWithProviders(<FocusView />);

    await user.click(screen.getByRole('button', { name: 'Start focus session' }));
    await user.click(screen.getByRole('button', { name: 'Stop' }));

    expect(screen.getByText('Stopped. Come back whenever you like.')).toBeInTheDocument();
    expect(statsStore.focusSessions()).toEqual([]);
  });

  it('never compares a stopped session with a full one', async () => {
    vi.useFakeTimers();
    renderWithProviders(<FocusView />);

    act(() => screen.getByRole('button', { name: 'Start focus session' }).click());
    act(() => vi.advanceTimersByTime(8 * 60 * 1000));
    act(() => screen.getByRole('button', { name: 'Stop' }).click());

    const card = screen.getByRole('region', { name: 'Focus timer' });
    expect(card).not.toHaveTextContent(/only|gave up|incomplete|unfinished|short of|left to go|of 25/i);
  });
});

describe('a session on one step', () => {
  it('says which step and task it is for, with Pebble beside the timer', async () => {
    seedReport();
    renderWithProviders(<FocusView taskId="seeded-1" stepId="seeded-1-2" />);

    expect(await screen.findByText('Write the intro')).toBeInTheDocument();
    expect(screen.getByText('Working on:')).toBeInTheDocument();
    expect(screen.getByText('Write the report')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Mark this step done' })).not.toBeInTheDocument();
  });

  it('after stopping early, offers to mark the step done, and does it only when asked', async () => {
    seedReport();
    const { user } = renderWithProviders(<FocusView taskId="seeded-1" stepId="seeded-1-2" />);
    await screen.findByText('Write the intro');

    await user.click(screen.getByRole('button', { name: 'Start focus session' }));
    await user.click(screen.getByRole('button', { name: 'Stop' }));
    expect(taskStore.all()[0].steps[1].completed).toBe(false);
    expect(screen.getByRole('link', { name: 'Back to Today' })).toHaveAttribute('href', '/today');

    await user.click(screen.getByRole('button', { name: 'Mark this step done' }));

    expect(await screen.findByText('Step done.')).toBeInTheDocument();
    await waitFor(() => expect(taskStore.all()[0].steps[1].completed).toBe(true));
    expect(taskStore.all()[0].completed).toBe(false);
  });

  it('after a full session, offers the same', async () => {
    seedReport();
    renderWithProviders(<FocusView taskId="seeded-1" stepId="seeded-1-3" />);
    await screen.findByText('Read it once');

    vi.useFakeTimers();
    act(() => screen.getByRole('button', { name: 'Start focus session' }).click());
    act(() => vi.advanceTimersByTime(FOCUS_SECONDS * 1000));
    vi.useRealTimers();

    expect(screen.getByRole('button', { name: 'Mark this step done' })).toBeInTheDocument();
  });

  it('a step that is gone is said gently, and the timer still works', async () => {
    seedReport();
    const { user } = renderWithProviders(<FocusView taskId="seeded-1" stepId="nope" />);

    expect(await screen.findByText("That step isn't on your list any more. You can still focus here.")).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Start focus session' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });
});

