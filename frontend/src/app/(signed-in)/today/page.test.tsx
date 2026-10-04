import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders, screen, within } from '@/test/render';
import { expectLogged } from '@/test/activity';
import { newTask, seed } from '@/features/tasks/testing';
import TodayPage from './page';

// Each test starts from a known task list on the fake server, with animations
// off (the break-down shimmer waits 1.5s).
beforeEach(() => {
  seed([
    newTask('Read Chapter 4', {
      timeEstimate: '~25 min',
      whyExplanation: 'One step per section.',
      subtasks: [
        { id: 'st-a', title: 'Skim the headings', timeEstimate: '~5 min', completed: false },
        { id: 'st-b', title: 'Write a summary', timeEstimate: '~5 min', completed: false },
      ],
    }),
    newTask('Take a walk', { tag: 'wellbeing', priority: 'low' }),
  ]);
});

async function renderAndShowSteps() {
  const view = renderWithProviders(<TodayPage />);
  await view.user.click(await screen.findByRole('button', { name: 'Break down "Read Chapter 4" into subtasks' }));
  return view;
}

function stepRow(title: string) {
  return screen.getByText(title).closest('.subtask-item') as HTMLElement;
}

describe('Today: toggling a task step', () => {
  it('shows the steps once the task is broken down', async () => {
    await renderAndShowSteps();

    expect(screen.getByText('Skim the headings')).toBeInTheDocument();
    expect(screen.getByText('Write a summary')).toBeInTheDocument();
  });

  it('checks a step and unchecks it again', async () => {
    const { user } = await renderAndShowSteps();

    await user.click(within(stepRow('Skim the headings')).getByRole('button', { name: 'Check subtask' }));

    expect(within(stepRow('Skim the headings')).getByRole('button', { name: 'Uncheck subtask' })).toBeInTheDocument();
    expect(within(stepRow('Write a summary')).getByRole('button', { name: 'Check subtask' })).toBeInTheDocument();

    await user.click(within(stepRow('Skim the headings')).getByRole('button', { name: 'Uncheck subtask' }));

    expect(within(stepRow('Skim the headings')).getByRole('button', { name: 'Check subtask' })).toBeInTheDocument();
  });

  it('moves the task to "done today" when its last step is checked', async () => {
    const { user } = await renderAndShowSteps();

    await user.click(within(stepRow('Skim the headings')).getByRole('button', { name: 'Check subtask' }));
    await user.click(within(stepRow('Write a summary')).getByRole('button', { name: 'Check subtask' }));

    expect(screen.getByRole('heading', { name: /Done today/ })).toBeInTheDocument();
    const card = screen.getByText('Read Chapter 4').closest('.task-card') as HTMLElement;
    expect(card).toHaveClass('completed');
    expect(within(card).getByRole('button', { name: 'Mark as incomplete' })).toBeInTheDocument();
  });

  it('logs breaking a task down in the activity log', async () => {
    await renderAndShowSteps();

    await expectLogged({
      agent: 'SimplifyCore',
      action: expect.stringContaining('Broke down "Read Chapter 4" into 2 steps'),
    });
  });
});
