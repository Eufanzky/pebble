import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen, within } from '@/test/render';
import type { Task } from '../types';
import TaskList from './TaskList';

const handlers = { onToggle: vi.fn(), onToggleSubtask: vi.fn(), onBreakDown: vi.fn(), onWhyOpen: vi.fn() };

function task(id: string, title: string, completed = false): Task {
  return { id, title, timeEstimate: '~10 min', tag: 'study', priority: 'medium', completed };
}

describe('TaskList', () => {
  it('groups open tasks under "To do" and finished ones under "Done today", with counts', () => {
    renderWithProviders(
      <TaskList open={[task('1', 'Read'), task('2', 'Write')]} done={[task('3', 'Walk', true)]} {...handlers} />,
    );

    const todo = screen.getByRole('region', { name: /To do/ });
    const done = screen.getByRole('region', { name: /Done today/ });
    expect(within(todo).getAllByRole('article').map((a) => a.getAttribute('aria-label'))).toEqual(['Read', 'Write']);
    expect(within(done).getAllByRole('article').map((a) => a.getAttribute('aria-label'))).toEqual(['Walk']);
    expect(screen.getByRole('heading', { name: 'To do 2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Done today 1' })).toBeInTheDocument();
  });

  it('leaves out "Done today" until something is done', () => {
    renderWithProviders(<TaskList open={[task('1', 'Read')]} done={[]} {...handlers} />);

    expect(screen.queryByRole('region', { name: /Done today/ })).not.toBeInTheDocument();
  });

  it('puts the add field after the open tasks, before the done ones', () => {
    renderWithProviders(
      <TaskList
        open={[task('1', 'Read')]}
        done={[task('3', 'Walk', true)]}
        addTask={<input aria-label="Add a new task" />}
        {...handlers}
      />,
    );

    const todo = screen.getByRole('region', { name: /To do/ });
    expect(within(todo).getByRole('textbox', { name: 'Add a new task' })).toBeInTheDocument();
    const order = Array.from(document.querySelectorAll('article, input')).map(
      (el) => el.getAttribute('aria-label'),
    );
    expect(order).toEqual(['Read', 'Add a new task', 'Walk']);
  });

  it('offers the example tasks on an empty list', () => {
    const onAddExamples = vi.fn();
    renderWithProviders(<TaskList open={[]} done={[]} onAddExamples={onAddExamples} {...handlers} />);

    screen.getByRole('button', { name: 'Add example tasks' }).click();

    expect(onAddExamples).toHaveBeenCalledOnce();
    expect(screen.getByRole('heading', { name: 'To do 0' })).toBeInTheDocument();
  });
});
