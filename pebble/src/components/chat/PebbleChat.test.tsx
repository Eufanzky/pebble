import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { chatHandlers, chatReply } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen } from '@/test/render';
import type { ActivityEntry } from '@/lib/types';
import PebbleChat from './PebbleChat';

async function openAndSend(message: string) {
  const view = renderWithProviders(<PebbleChat />);
  await view.user.click(screen.getByRole('button', { name: 'Chat with Pebble' }));
  await view.user.type(screen.getByRole('textbox', { name: 'Message to Pebble' }), `${message}{Enter}`);
  return view;
}

describe('PebbleChat', () => {
  it('opens a chat dialog with the input focused', async () => {
    const { user } = renderWithProviders(<PebbleChat />);

    await user.click(screen.getByRole('button', { name: 'Chat with Pebble' }));

    expect(screen.getByRole('dialog', { name: 'Chat with Pebble' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Message to Pebble' })).toHaveFocus();
  });

  it("shows the user's message and the agent's reply with its name", async () => {
    server.use(chatHandlers.reply({ response: 'Here are 3 small steps.', agentName: 'CalmSense', intent: 'decompose' }));

    await openAndSend('Help me with my essay');

    expect(screen.getByText('Help me with my essay')).toBeInTheDocument();
    expect(await screen.findByText('Here are 3 small steps.')).toBeInTheDocument();
    expect(screen.getByText('CalmSense')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Message to Pebble' })).toHaveValue('');
  });

  it('sends the message with task stats and preferences', async () => {
    let body: unknown;
    server.use(
      http.post('/api/agents/chat', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(chatReply());
      })
    );

    await openAndSend('Hello');
    await screen.findByText('I am here with you.');

    expect(body).toEqual({
      message: 'Hello',
      tasks_completed: expect.any(Number),
      tasks_total: expect.any(Number),
      recent_task_titles: expect.any(Array),
      chunk_size: expect.any(String),
      reading_level: expect.any(Number),
      time_of_day: expect.stringMatching(/^(morning|day|evening)$/),
      personality: expect.any(String),
    });
  });

  it('logs the reply in the activity log', async () => {
    server.use(chatHandlers.reply({ agentName: 'CalmSense', intent: 'decompose', mood: 'normal' }));

    await openAndSend('Break down my essay');
    await screen.findByText('I am here with you.');

    const [latest]: ActivityEntry[] = JSON.parse(window.localStorage.getItem('pebble-activity')!);
    expect(latest).toMatchObject({
      agent: 'CalmSense',
      action: 'Chat: decompose — "Break down my essay"',
      reasoning: 'Routed to CalmSense. Mood: normal.',
      safetyStatus: 'passed',
    });
  });

  it('shows that Pebble is thinking while it waits, and blocks sending again', async () => {
    let respond!: () => void;
    server.use(
      http.post('/api/agents/chat', async () => {
        await new Promise<void>((resolve) => (respond = resolve));
        return HttpResponse.json(chatReply());
      })
    );

    await openAndSend('Hello');

    expect(await screen.findByText('Pebble is thinking...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled();

    respond();
    await screen.findByText('I am here with you.');
    expect(screen.queryByText('Pebble is thinking...')).not.toBeInTheDocument();
  });

  // Today the raw error, status code included, is shown to the user (A-014).
  it('shows the error in the chat when the backend returns 500', async () => {
    server.use(chatHandlers.status(500));

    await openAndSend('Hello');

    expect(
      await screen.findByText('Chat request failed (500): {"detail":"Internal Server Error"}')
    ).toBeInTheDocument();
    expect(screen.queryByText('Pebble is thinking...')).not.toBeInTheDocument();
  });

  it('shows the error in the chat when the backend is unreachable', async () => {
    server.use(chatHandlers.networkError());

    await openAndSend('Hello');

    expect(await screen.findByText('Failed to fetch')).toBeInTheDocument();
  });

  it('lets the user send again after an error', async () => {
    server.use(chatHandlers.status(500));
    const { user } = await openAndSend('Hello');
    await screen.findByText(/Chat request failed/);

    server.use(chatHandlers.reply({ response: 'Back again.' }));
    await user.type(screen.getByRole('textbox', { name: 'Message to Pebble' }), 'Try again{Enter}');

    expect(await screen.findByText('Back again.')).toBeInTheDocument();
  });
});
