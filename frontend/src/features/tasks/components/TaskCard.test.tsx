import { http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/test/msw/server';
import { taskHandlers } from '@/test/msw/tasks';
import { renderWithProviders, screen, within } from '@/test/render';
import { seed } from '../testing';
import type { Task } from '../types';
import TaskCard from './TaskCard';

function task(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-x',
    title: 'Read Chapter 4',
    timeEstimate: '~25 min',
    tag: 'study',
    priority: 'medium',
    completed: false,
    whyExplanation: 'One step per section.',
    steps: [
      { id: 'a', title: 'Skim the headings', timeEstimate: '~5 min', completed: true },
      { id: 'b', title: 'Write a summary', timeEstimate: '~5 min', completed: false },
    ],
    ...overrides,
  };
}

function renderCard(t: Task) {
  const handlers = { onToggle: vi.fn(), onToggleStep: vi.fn(), onShowSteps: vi.fn() };
  const view = renderWithProviders(<TaskCard task={t} {...handlers} />);
  return { ...view, ...handlers };
}

beforeEach(() => seed([]));

describe('TaskCard', () => {
  it('shows the title, tag, estimate and priority', () => {
    renderCard(task());

    expect(screen.getByText('Read Chapter 4')).toBeInTheDocument();
    expect(screen.getByText('Study')).toBeInTheDocument();
    expect(screen.getByText('~25 min')).toBeInTheDocument();
    expect(screen.getByText('Medium priority')).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Read Chapter 4' })).toBeInTheDocument();
  });

  it('shows the tag as a plain label, in calm mode too', () => {
    seed([], { calmMode: true });
    renderCard(task());

    expect(screen.getByText('Study')).toBeInTheDocument();
  });

  it('marks the task complete', async () => {
    const { user, onToggle } = renderCard(task());

    await user.click(screen.getByRole('button', { name: 'Mark as complete' }));

    expect(onToggle).toHaveBeenCalledWith('task-x');
  });

  it('shows a finished task as done, without the break-down button or the why card', () => {
    renderCard(task({ completed: true, steps: undefined }));

    expect(screen.getByRole('button', { name: 'Mark as incomplete' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Break down/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Why did Pebble/ })).not.toBeInTheDocument();
  });

  it('offers its steps when they are hidden, with no break-down', async () => {
    const { user, onShowSteps } = renderCard(task());

    expect(screen.queryByText('Skim the headings')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Why did Pebble/ })).not.toBeInTheDocument();
    expect(screen.getByText('1 of 2 steps')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Break down/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show steps' }));
    expect(onShowSteps).toHaveBeenCalledWith('task-x', true);
  });

  it('shows its steps, ticks one, offers to hide them, and shows why', async () => {
    const { user, onToggleStep, onShowSteps } = renderCard(task({ showSteps: true }));

    const hide = screen.getByRole('button', { name: 'Hide steps' });
    expect(hide).toHaveAttribute('aria-expanded', 'true');
    await user.click(hide);
    expect(onShowSteps).toHaveBeenCalledWith('task-x', false);
    const row = screen.getByText('Write a summary').closest('.step-item') as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Check step' }));
    expect(onToggleStep).toHaveBeenCalledWith('task-x', 'b');
    expect(screen.getByRole('button', { name: /Why did Pebble/ })).toBeInTheDocument();
  });

  it('says CalmSense is working, with moving bars only when animations are on', async () => {
    let answer = () => {};
    const answered = new Promise<void>((resolve) => (answer = resolve));
    server.use(http.post('/api/tasks/:taskId/breakdown', () => answered.then(() => undefined)));
    seed([], { reduceAnimations: false });
    const { user, container } = renderCard(task({ steps: undefined }));

    await user.click(screen.getByRole('button', { name: 'Break down "Read Chapter 4" into steps' }));

    expect(screen.getByRole('status')).toHaveTextContent('CalmSense is breaking it down…');
    expect(container.querySelectorAll('.shimmer-bar')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /Break down/ })).not.toBeInTheDocument();
    answer();
  });

  it('says so gently when CalmSense can\'t break it down, and offers it again', async () => {
    server.use(taskHandlers.breakdownStatus(503));
    const { user } = renderCard(task({ steps: undefined }));

    await user.click(screen.getByRole('button', { name: 'Break down "Read Chapter 4" into steps' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      "CalmSense couldn't break this down just now. Try again whenever you're ready.",
    );
    expect(screen.getByRole('button', { name: 'Break down "Read Chapter 4" into steps' })).toBeInTheDocument();
  });

  it('offers no break-down for a finished task', () => {
    renderCard(task({ steps: undefined, completed: true }));

    expect(screen.queryByRole('button', { name: /Break down/ })).not.toBeInTheDocument();
  });

  it('shows why right away for a task without steps', async () => {
    const { user } = renderCard(task({ steps: undefined }));

    await user.click(screen.getByRole('button', { name: /Why did Pebble do this\?/ }));

    expect(screen.getByText('One step per section.')).toBeVisible();
  });

  it('shows its steps at once when they are marked as shown', () => {
    renderCard(task({ showSteps: true }));

    expect(screen.getByText('Skim the headings')).toBeInTheDocument();
  });

  it('offers to add its steps to a calendar, but not once it\'s done or without steps', () => {
    const { unmount } = renderCard(task());
    expect(screen.getByRole('button', { name: 'Add the steps of "Read Chapter 4" to your calendar' })).toBeInTheDocument();
    unmount();

    renderCard(task({ completed: true }));
    expect(screen.queryByRole('button', { name: /to your calendar/ })).not.toBeInTheDocument();
  });
});
