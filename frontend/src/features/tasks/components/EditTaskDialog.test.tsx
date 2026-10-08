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

function renderDialog(task: Task = TASK) {
  const props = { onSave: vi.fn(), onDelete: vi.fn(), onClose: vi.fn() };
  return { ...renderWithProviders(<EditTaskDialog task={task} {...props} />), ...props };
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
      due: null,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('sets a due day, and an empty field means none (8.3)', async () => {
    const { user, onSave } = renderDialog();
    const due = screen.getByLabelText('Due day');
    expect(due).toHaveValue('');
    expect(due).toHaveAccessibleDescription('Optional. Leave it empty for no due day.');

    await user.type(due, '2026-10-20');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ due: '2026-10-20' }));
  });

  it('removes a due day when the field is cleared', async () => {
    const { user, onSave } = renderDialog({ ...TASK, due: '2026-10-20', dueSetAt: '2026-10-08T10:00:00Z' });
    const due = screen.getByLabelText('Due day');
    expect(due).toHaveValue('2026-10-20');

    await user.clear(due);
    await user.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ due: null }));
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
