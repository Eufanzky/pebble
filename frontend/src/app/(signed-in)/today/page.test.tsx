import { http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders, screen, waitFor, within } from '@/test/render';
import { server } from '@/test/msw/server';
import { taskHandlers, taskStore } from '@/test/msw/tasks';
import { newTask, seed } from '@/features/tasks/testing';
import TodayPage from './page';

// Each test starts from a known task list on the fake server: one task with steps, one without.
beforeEach(() => {
  seed([
    newTask('Read Chapter 4', {
      timeEstimate: '~25 min',
      whyExplanation: 'One step per section.',
      steps: [
        { id: 'st-a', title: 'Skim the headings', timeEstimate: '~5 min', completed: false },
        { id: 'st-b', title: 'Write a summary', timeEstimate: '~5 min', completed: false },
      ],
    }),
    newTask('Take a walk', { tag: 'wellbeing', priority: 'low' }),
  ]);
});

async function renderAndShowSteps() {
  const view = renderWithProviders(<TodayPage />);
  await view.user.click(await screen.findByRole('button', { name: 'Show steps' }));
  return view;
}

function stepRow(title: string) {
  return screen.getByText(title).closest('.step-item') as HTMLElement;
}

describe('Today: toggling a task step', () => {
  it('shows a task\'s steps when asked', async () => {
    await renderAndShowSteps();

    expect(screen.getByText('Skim the headings')).toBeInTheDocument();
    expect(screen.getByText('Write a summary')).toBeInTheDocument();
  });

  it('checks a step and unchecks it again', async () => {
    const { user } = await renderAndShowSteps();

    await user.click(within(stepRow('Skim the headings')).getByRole('button', { name: 'Check step' }));

    expect(within(stepRow('Skim the headings')).getByRole('button', { name: 'Uncheck step' })).toBeInTheDocument();
    expect(within(stepRow('Write a summary')).getByRole('button', { name: 'Check step' })).toBeInTheDocument();

    await user.click(within(stepRow('Skim the headings')).getByRole('button', { name: 'Uncheck step' }));

    expect(within(stepRow('Skim the headings')).getByRole('button', { name: 'Check step' })).toBeInTheDocument();
  });

  it('moves the task to "done today" when its last step is checked', async () => {
    const { user } = await renderAndShowSteps();

    await user.click(within(stepRow('Skim the headings')).getByRole('button', { name: 'Check step' }));
    await user.click(within(stepRow('Write a summary')).getByRole('button', { name: 'Check step' }));

    expect(screen.getByRole('heading', { name: /Done today/ })).toBeInTheDocument();
    const card = screen.getByText('Read Chapter 4').closest('.task-card') as HTMLElement;
    expect(card).toHaveClass('completed');
    expect(within(card).getByRole('button', { name: 'Mark as incomplete' })).toBeInTheDocument();
  });

});

describe('Today: breaking a task down with CalmSense', () => {
  it('offers it only for an open task without steps', async () => {
    renderWithProviders(<TodayPage />);

    expect(await screen.findByRole('button', { name: 'Break down "Take a walk" into steps' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Break down "Read Chapter 4" into steps' })).not.toBeInTheDocument();
  });

  it('asks CalmSense, says so while it works, then shows its steps and why', async () => {
    // Hold the request until the card has been checked, then let the fake answer
    let answer = () => {};
    const answered = new Promise<void>((resolve) => (answer = resolve));
    server.use(http.post('/api/tasks/:taskId/breakdown', () => answered.then(() => undefined)));
    const { user } = renderWithProviders(<TodayPage />);

    await user.click(await screen.findByRole('button', { name: 'Break down "Take a walk" into steps' }));

    const card = screen.getByRole('article', { name: 'Take a walk' });
    expect(within(card).getByRole('status')).toHaveTextContent('CalmSense is breaking it down…');
    answer();
    expect(await within(card).findByText('Get what you need for: Take a walk')).toBeInTheDocument();
    expect(taskStore.breakdowns()).toHaveLength(1);
    expect(within(card).getByText('0 of 3 steps')).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: /Why did Pebble do this/ })).toBeInTheDocument();
    expect(within(card).queryByRole('button', { name: /Break down/ })).not.toBeInTheDocument();
  });

  it('says so gently, and changes nothing, when CalmSense can\'t answer', async () => {
    server.use(taskHandlers.breakdownStatus(503));
    const { user } = renderWithProviders(<TodayPage />);

    await user.click(await screen.findByRole('button', { name: 'Break down "Take a walk" into steps' }));

    expect(await screen.findByText(/CalmSense couldn.t break this down just now/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Break down "Take a walk" into steps' })).toBeInTheDocument();
    expect(taskStore.all().find((t) => t.title === 'Take a walk')!.steps).toEqual([]);
  });

  it('offers to undo it, which takes the steps and the why away again', async () => {
    const { user } = renderWithProviders(<TodayPage />);
    await user.click(await screen.findByRole('button', { name: 'Break down "Take a walk" into steps' }));
    const card = screen.getByRole('article', { name: 'Take a walk' });
    await within(card).findByText('Get what you need for: Take a walk');

    expect(screen.getByText('CalmSense broke "Take a walk" into steps.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(within(card).queryByText('Get what you need for: Take a walk')).not.toBeInTheDocument();
    expect(within(card).getByRole('button', { name: 'Break down "Take a walk" into steps' })).toBeInTheDocument();
    await waitFor(() =>
      expect(taskStore.all().find((t) => t.title === 'Take a walk')).toMatchObject({ steps: [], whyExplanation: '' }),
    );
  });
});

describe('Today: dismissing a breakdown later', () => {
  it('removes the steps from the edit dialog, and keeps the task', async () => {
    const { user } = renderWithProviders(<TodayPage />);

    await user.click(await screen.findByRole('button', { name: 'Edit "Read Chapter 4"' }));
    await user.click(screen.getByRole('button', { name: 'Remove the steps' }));

    const card = screen.getByRole('article', { name: 'Read Chapter 4' });
    expect(within(card).queryByRole('button', { name: 'Show steps' })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(taskStore.all().find((t) => t.title === 'Read Chapter 4')).toMatchObject({ steps: [], whyExplanation: '' }),
    );
  });
});
