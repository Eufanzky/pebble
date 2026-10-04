import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { chatHandlers, chatReply } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen } from '@/test/render';
import { setTestPreferences } from '@/test/preferences';
import { useActivityLog } from '@/features/activity';
import { accountStore } from '@/test/msw/account';
import PebbleChat from './PebbleChat';

function LogProbe() {
  const { entries } = useActivityLog();
  return entries[0] ? <p data-testid="latest-log">{entries[0].action}</p> : null;
}

const GENTLE_ERROR = "Pebble couldn't answer just now. Try again whenever you're ready.";

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
      tasksCompleted: expect.any(Number),
      tasksTotal: expect.any(Number),
      recentTaskTitles: expect.any(Array),
      stepSize: expect.any(String),
      readingLevel: expect.any(Number),
      timeOfDay: expect.stringMatching(/^(morning|day|evening)$/),
      personality: expect.any(String),
    });
  });

  it('leaves logging the turn to the backend, and reloads the log to show it', async () => {
    // The backend writes the entry while it answers
    server.use(
      http.post('/api/agents/chat', () => {
        accountStore.setActivity([
          {
            timestamp: new Date().toISOString(),
            agent: 'CalmSense',
            action: 'Chat: decompose — "Break down my essay"',
            reasoning: 'Routed to CalmSense. Mood: normal.',
            safetyStatus: 'passed',
          },
        ]);
        return HttpResponse.json(chatReply({ agentName: 'CalmSense', intent: 'decompose', mood: 'normal' }));
      }),
    );
    const posted: unknown[] = [];
    const watch = ({ request }: { request: Request }) => {
      if (request.method === 'POST' && new URL(request.url).pathname === '/api/activity') posted.push(request);
    };
    server.events.on('request:start', watch);

    const view = renderWithProviders(
      <>
        <PebbleChat />
        <LogProbe />
      </>,
    );
    await view.user.click(screen.getByRole('button', { name: 'Chat with Pebble' }));
    await view.user.type(screen.getByRole('textbox', { name: 'Message to Pebble' }), 'Break down my essay{Enter}');

    expect(await screen.findByTestId('latest-log')).toHaveTextContent('Chat: decompose — "Break down my essay"');
    expect(posted).toEqual([]);
    server.events.removeListener('request:start', watch);
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

  // A-014: the error used to be shown raw, status code and JSON included.
  it.each([
    ['the backend returns 500', () => chatHandlers.status(500)],
    ['the backend is unreachable', () => chatHandlers.networkError()],
  ])('shows a gentle message when %s', async (_, handler) => {
    server.use(handler());

    await openAndSend('Hello');

    expect(await screen.findByText(GENTLE_ERROR)).toBeInTheDocument();
    expect(screen.queryByText(/Chat request failed|Failed to fetch|Internal Server Error/)).not.toBeInTheDocument();
    expect(screen.queryByText('Pebble is thinking...')).not.toBeInTheDocument();
  });

  // A-016: calm mode didn't apply to chat replies.
  it('strips emoji from replies in calm mode', async () => {
    server.use(chatHandlers.reply({ response: 'You did 3 things today ✨🎉' }));
    setTestPreferences({ calmMode: true });

    await openAndSend('Hello');

    expect(await screen.findByText('You did 3 things today')).toBeInTheDocument();
  });

  it('keeps emoji in replies when calm mode is off', async () => {
    server.use(chatHandlers.reply({ response: 'You did 3 things today ✨' }));
    setTestPreferences({ calmMode: false });

    await openAndSend('Hello');

    expect(await screen.findByText('You did 3 things today ✨')).toBeInTheDocument();
  });

  it('lets the user send again after an error', async () => {
    server.use(chatHandlers.status(500));
    const { user } = await openAndSend('Hello');
    await screen.findByText(GENTLE_ERROR);

    server.use(chatHandlers.reply({ response: 'Back again.' }));
    await user.type(screen.getByRole('textbox', { name: 'Message to Pebble' }), 'Try again{Enter}');

    expect(await screen.findByText('Back again.')).toBeInTheDocument();
  });
});
