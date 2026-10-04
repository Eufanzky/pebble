import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import type { Task } from '../types';
import EditTaskDialog from './EditTaskDialog';

const TASK: Task = {
  id: 't1',
  title: 'Read Chapter 4',
  timeEstimate: '~25 min',
  tag: 'study',
  priority: 'medium',
  completed: false,
};

function renderDialog() {
  const props = { onSave: vi.fn(), onDelete: vi.fn(), onClose: vi.fn() };
  return { ...renderWithProviders(<EditTaskDialog task={TASK} {...props} />), ...props };
}

describe('EditTaskDialog', () => {
  it('starts from the task and saves what changed', async () => {
    const { user, onSave, onClose } = renderDialog();
    const title = screen.getByRole('textbox', { name: 'Title' });
    expect(title).toHaveValue('Read Chapter 4');
    expect(screen.getByRole('button', { name: 'Study' })).toHaveAttribute('aria-pressed', 'true');

    await user.clear(title);
    await user.type(title, '  Read Chapter 5 ');
    await user.clear(screen.getByRole('textbox', { name: 'How long it might take' }));
    await user.type(screen.getByRole('textbox', { name: 'How long it might take' }), '~30 min');
    await user.click(screen.getByRole('button', { name: 'Wellbeing' }));
    await user.click(screen.getByRole('button', { name: 'High' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith({
      title: 'Read Chapter 5',
      timeEstimate: '~30 min',
      tag: 'wellbeing',
      priority: 'high',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('asks for a title instead of saving an empty one', async () => {
    const { user, onSave } = renderDialog();

    await user.clear(screen.getByRole('textbox', { name: 'Title' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveAccessibleDescription('Give it a few words.');
  });

  it('deletes only after asking, and "Keep it" goes back', async () => {
    const { user, onDelete } = renderDialog();

    await user.click(screen.getByRole('button', { name: 'Delete task…' }));
    expect(screen.getByRole('dialog', { name: 'Delete this task?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Keep it' }));
    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Edit task' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete task…' }));
    await user.click(screen.getByRole('button', { name: 'Delete task' }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('has no axe violations', async () => {
    const { container } = renderDialog();

    expect(await axe(container)).toHaveNoViolations();
  });
});
