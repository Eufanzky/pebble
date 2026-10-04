import { beforeEach, describe, expect, it, vi } from 'vitest';
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
  const handlers = { onToggle: vi.fn(), onToggleStep: vi.fn(), onBreakDown: vi.fn(), onWhyOpen: vi.fn() };
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

  it('breaks the task down into its steps, then shows why', async () => {
    const { user, onBreakDown, onToggleStep } = renderCard(task());
    expect(screen.queryByText('Skim the headings')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Why did Pebble/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Break down "Read Chapter 4" into steps' }));

    expect(onBreakDown).toHaveBeenCalledWith('task-x');
    const row = screen.getByText('Write a summary').closest('.step-item') as HTMLElement;
    expect(within(screen.getByText('Skim the headings').closest('.step-item') as HTMLElement)
      .getByRole('button', { name: 'Uncheck step' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Break down/ })).not.toBeInTheDocument();

    await user.click(within(row).getByRole('button', { name: 'Check step' }));
    expect(onToggleStep).toHaveBeenCalledWith('task-x', 'b');

    expect(screen.getByRole('button', { name: /Why did Pebble/ })).toBeInTheDocument();
  });

  it('shows a shimmer while breaking down when animations are on', async () => {
    seed([], { reduceAnimations: false });
    const { user, onBreakDown } = renderCard(task());

    await user.click(screen.getByRole('button', { name: /Break down/ }));

    expect(screen.getByRole('status', { name: 'Breaking it down' })).toBeInTheDocument();
    expect(onBreakDown).not.toHaveBeenCalled();
    expect(await screen.findByText('Skim the headings', {}, { timeout: 3000 })).toBeInTheDocument();
    expect(onBreakDown).toHaveBeenCalledWith('task-x');
  });

  it('shows why right away for a task without steps, and reports opening it', async () => {
    const { user, onWhyOpen } = renderCard(task({ steps: undefined }));

    await user.click(screen.getByRole('button', { name: /Why did Pebble do this\?/ }));

    expect(onWhyOpen).toHaveBeenCalledWith('task-x');
    expect(screen.getByText('One step per section.')).toBeVisible();
  });

  it('shows stored steps without a break-down', () => {
    renderCard(task({ showSteps: true }));

    expect(screen.getByText('Skim the headings')).toBeInTheDocument();
  });
});
