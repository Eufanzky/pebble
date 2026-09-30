import { beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { server } from '@/test/msw/server';
import { taskHandlers, taskStore } from '@/test/msw/tasks';
import { newTask, seed } from '../testing';
import TodayView from './TodayView';

beforeEach(() => {
  seed([newTask('Write intro', { tag: 'project' }), newTask('Walk', { completed: true })]);
});

/** Renders Today and waits for the list to arrive from the (fake) server. */
async function renderToday() {
  const rendered = renderWithProviders(<TodayView />);
  await waitFor(() => expect(screen.queryByText('Getting your list…')).not.toBeInTheDocument());
  return rendered;
}

describe('TodayView', () => {
  it('shows open tasks, the ones done today, and what is up next', async () => {
    await renderToday();

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByText('done today')).toBeInTheDocument();
    expect(screen.getByText('1 of 2 tasks done')).toBeInTheDocument();
    expect(screen.getAllByText('Write intro')).toHaveLength(2); // the card and "up next"
  });

  it('completes the next task from "up next"', async () => {
    const { user } = await renderToday();

    await user.click(screen.getByRole('button', { name: /Start this one/ }));

    expect(screen.getByText("You're all done! 🎉")).toBeInTheDocument();
    expect(screen.getByText('2 of 2 tasks done')).toBeInTheDocument();
  });

  it('switches to the roadmap and back', async () => {
    const { user } = await renderToday();

    await user.click(screen.getByRole('button', { name: 'Roadmap' }));

    expect(screen.getByRole('button', { name: 'Roadmap' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Complete task: Write intro' })).toBeInTheDocument();
    expect(screen.queryByText('done today')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'List' }));
    expect(screen.getByText('done today')).toBeInTheDocument();
  });

  it('adds a typed task', async () => {
    const { user } = await renderToday();

    await user.type(screen.getByLabelText('Add a new task'), 'Email Sam{Enter}');

    expect(screen.getByText('Email Sam')).toBeInTheDocument();
  });

  it('offers support on distress and can start fresh', async () => {
    const { user } = await renderToday();

    await user.type(screen.getByLabelText('Add a new task'), "I can't do this{Enter}");

    expect(screen.getByRole('alert')).toHaveTextContent('That sounds really hard.');
    expect(screen.getByText("I'm right here with you.")).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear and start fresh' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('Write intro')).not.toBeInTheDocument();
    expect(screen.getAllByText('Take 5 minutes to breathe').length).toBeGreaterThan(0);
  });

  it('keeps the tasks when the user is okay', async () => {
    const { user } = await renderToday();
    await user.type(screen.getByLabelText('Add a new task'), 'too much{Enter}');

    await user.click(screen.getByRole('button', { name: "I'm okay, keep going" }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getAllByText('Write intro').length).toBeGreaterThan(0);
  });

  it('shows a calm empty state with no tasks, and can add example tasks', async () => {
    seed([]);
    const { user } = await renderToday();

    expect(screen.getByText("All clear! Add a task when you're ready, or just rest.")).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Add example tasks' }));

    expect((await screen.findAllByText('Read Chapter 4 of the design textbook')).length).toBeGreaterThan(0);
    await waitFor(() => expect(taskStore.all().length).toBeGreaterThan(0));
  });

  it('says so while the list is loading', () => {
    renderWithProviders(<TodayView />);

    expect(screen.getByRole('status')).toHaveTextContent('Getting your list…');
  });

  it('offers to try again when the list could not load', async () => {
    server.use(taskHandlers.status(503));
    const { user } = renderWithProviders(<TodayView />);

    expect(await screen.findByText("Pebble couldn't load your list just now.")).toBeInTheDocument();
    server.resetHandlers();
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect((await screen.findAllByText('Write intro')).length).toBeGreaterThan(0);
  });

  it('says so gently when a change could not be saved', async () => {
    const { user } = await renderToday();
    server.use(...taskHandlers.saveStatus(503));

    await user.type(screen.getByLabelText('Add a new task'), 'Email Sam{Enter}');

    expect(
      await screen.findByText("Pebble couldn't save your last change. Your list shows what's saved."),
    ).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Email Sam')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(screen.queryByText(/couldn't save/)).not.toBeInTheDocument();
  });
});
