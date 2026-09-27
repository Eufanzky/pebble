import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { newTask, seed } from '../testing';
import TodayView from './TodayView';

beforeEach(() => {
  seed([newTask('Write intro', { tag: 'project' }), newTask('Walk', { completed: true })]);
});

describe('TodayView', () => {
  it('shows open tasks, the ones done today, and what is up next', () => {
    renderWithProviders(<TodayView />);

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByText('done today')).toBeInTheDocument();
    expect(screen.getByText('1 of 2 tasks done')).toBeInTheDocument();
    expect(screen.getAllByText('Write intro')).toHaveLength(2); // the card and "up next"
  });

  it('completes the next task from "up next"', async () => {
    const { user } = renderWithProviders(<TodayView />);

    await user.click(screen.getByRole('button', { name: /Start this one/ }));

    expect(screen.getByText("You're all done! 🎉")).toBeInTheDocument();
    expect(screen.getByText('2 of 2 tasks done')).toBeInTheDocument();
  });

  it('switches to the roadmap and back', async () => {
    const { user } = renderWithProviders(<TodayView />);

    await user.click(screen.getByRole('button', { name: 'Roadmap' }));

    expect(screen.getByRole('button', { name: 'Roadmap' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Complete task: Write intro' })).toBeInTheDocument();
    expect(screen.queryByText('done today')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByText('done today')).toBeInTheDocument();
  });

  it('adds a typed task', async () => {
    const { user } = renderWithProviders(<TodayView />);

    await user.type(screen.getByLabelText('Add a new task'), 'Email Sam{Enter}');

    expect(screen.getByText('Email Sam')).toBeInTheDocument();
  });

  it('offers support on distress and can start fresh', async () => {
    const { user } = renderWithProviders(<TodayView />);

    await user.type(screen.getByLabelText('Add a new task'), "I can't do this{Enter}");

    expect(screen.getByRole('alert')).toHaveTextContent('That sounds really hard.');
    expect(screen.getByText("I'm right here with you.")).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear and start fresh' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('Write intro')).not.toBeInTheDocument();
    expect(screen.getAllByText('Take 5 minutes to breathe').length).toBeGreaterThan(0);
  });

  it('keeps the tasks when the user is okay', async () => {
    const { user } = renderWithProviders(<TodayView />);
    await user.type(screen.getByLabelText('Add a new task'), 'too much{Enter}');

    await user.click(screen.getByRole('button', { name: "I'm okay, keep going" }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getAllByText('Write intro').length).toBeGreaterThan(0);
  });

  it('shows a calm empty state with no tasks', () => {
    seed([]);
    renderWithProviders(<TodayView />);

    expect(screen.getByText("All clear! Add a task when you're ready, or just rest.")).toBeInTheDocument();
  });
});
