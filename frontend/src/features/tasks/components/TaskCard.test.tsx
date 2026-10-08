import { http } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  describe('time left (8.3)', () => {
    // A fixed clock: Friday, October 9, 2026, 10:00 local time
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 9, 9, 10));
    });
    afterEach(() => vi.useRealTimers());

    const chosen = new Date(2026, 9, 1, 0).toISOString();
    const due = (day: string, overrides: Partial<Task> = {}) =>
      task({ steps: undefined, due: day, dueSetAt: chosen, ...overrides });

    it('shows a calm bar with the days left, and no offer while there is time', () => {
      renderCard(due('2026-10-14'));

      const bar = screen.getByRole('meter', { name: 'Time left' });
      expect(bar).toHaveAttribute('aria-valuetext', '5 days left');
      expect(bar).toHaveAttribute('aria-valuenow', '40'); // 134 of the 336 hours from Oct 1 to the end of Oct 14
      expect(screen.queryByRole('group', { name: 'Make it smaller' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Break down "Read Chapter 4" into steps' })).toBeInTheDocument();
    });

    it.each([
      ['2026-10-10', 'Due tomorrow'],
      ['2026-10-09', 'Due today'],
    ])('offers to make a task due %s smaller, in place of "Break it down"', (day, label) => {
      renderCard(due(day));

      expect(screen.getByRole('meter', { name: 'Time left' })).toHaveAttribute('aria-valuetext', label);
      const offer = screen.getByRole('group', { name: 'Make it smaller' });
      expect(offer).toHaveTextContent('Want CalmSense to make this one smaller?');
      expect(screen.queryByRole('button', { name: /Break down/ })).not.toBeInTheDocument();
    });

    it('asks CalmSense when the offer is taken', async () => {
      let asked = false;
      server.use(
        http.post('/api/tasks/:taskId/breakdown', () => {
          asked = true;
          return new Promise(() => {});
        }),
      );
      const { user } = renderCard(due('2026-10-10'));

      await user.click(screen.getByRole('button', { name: 'Make it smaller' }));

      expect(screen.getByRole('status')).toHaveTextContent('CalmSense is breaking it down…');
      expect(asked).toBe(true);
    });

    it('lets the offer go with "Not now", and "Break it down" stays', async () => {
      const { user } = renderCard(due('2026-10-10'));

      await user.click(screen.getByRole('button', { name: 'Not now' }));

      expect(screen.queryByRole('group', { name: 'Make it smaller' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Break down "Read Chapter 4" into steps' })).toBeInTheDocument();
    });

    it('makes no offer for a task CalmSense already broke down', () => {
      renderCard(task({ due: '2026-10-10', dueSetAt: chosen }));

      expect(screen.getByRole('meter', { name: 'Time left' })).toBeInTheDocument();
      expect(screen.queryByRole('group', { name: 'Make it smaller' })).not.toBeInTheDocument();
    });

    it('says "Still open" once the day is over, with three choices, no bar and no count of days (8.4)', () => {
      const { container } = renderCard(due('2026-10-02'));

      const group = screen.getByRole('group', { name: 'Still open' });
      expect(group).toHaveTextContent('Still open. Move it, make it smaller, or let it go?');
      expect(within(group).getByRole('button', { name: 'Move "Read Chapter 4" to another day' })).toBeInTheDocument();
      expect(within(group).getByRole('button', { name: 'Make "Read Chapter 4" smaller' })).toBeInTheDocument();
      expect(within(group).getByRole('button', { name: 'Let "Read Chapter 4" go' })).toBeInTheDocument();
      expect(screen.queryByRole('meter')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Break down/ })).not.toBeInTheDocument();
      expect(container).not.toHaveTextContent(/\d+ days?|late|overdue|missed/i);
    });

    it('offers two choices for a task that already has steps', () => {
      renderCard(task({ due: '2026-10-02', dueSetAt: chosen }));

      expect(screen.getByRole('group', { name: 'Still open' })).toHaveTextContent('Still open. Move it, or let it go?');
      expect(screen.queryByRole('button', { name: /smaller/ })).not.toBeInTheDocument();
    });

    it('moves focus to the days when "Move it" opens them, and back on "Back"', async () => {
      const { user } = renderCard(due('2026-10-02'));

      await user.click(screen.getByRole('button', { name: 'Move "Read Chapter 4" to another day' }));
      expect(screen.getByRole('button', { name: 'Tomorrow' })).toHaveFocus();
      expect(screen.getByRole('group', { name: 'Still open' })).toHaveTextContent('Still open. Move it to…');

      await user.click(screen.getByRole('button', { name: 'Back' }));
      expect(screen.getByRole('button', { name: 'Move "Read Chapter 4" to another day' })).toHaveFocus();
    });

    it('shows nothing for a finished task, or one with no due day', () => {
      renderCard(due('2026-10-10', { completed: true }));
      renderCard(task({ steps: undefined }));

      expect(screen.queryByRole('meter')).not.toBeInTheDocument();
      expect(screen.queryByText(/Due |days left|Still open/)).not.toBeInTheDocument();
    });

    it('looks the same near the day as far from it: only the length changes, never the colour', () => {
      const near = renderCard(due('2026-10-09')).container.querySelector('.due-bar') as HTMLElement;
      const far = renderCard(due('2026-10-30')).container.querySelector('.due-bar') as HTMLElement;
      const width = (bar: HTMLElement) => parseFloat((bar.querySelector('.due-bar__fill') as HTMLElement).style.width);

      expect(width(near)).toBeCloseTo(6.48, 1); // 14 of the 216 hours from Oct 1 to the end of Oct 9
      expect(width(far)).toBeGreaterThan(width(near));
      const look = (bar: HTMLElement) => bar.outerHTML.replace(/width: [\d.]+%|aria-value(?:now|text)="[^"]*"/g, '');
      expect(look(near)).toBe(look(far).replace('21 days left', 'Due today'));
    });
  });
});
