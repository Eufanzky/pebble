import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { usePebble } from '@/features/companion';
import { chatHandlers, chatReply } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { act, renderHookWithProviders, waitFor } from '@/test/render';
import { CHAT_ERROR_TEXT } from '../lib/messages';
import { useChat } from './useChat';

function renderChat() {
  return renderHookWithProviders(() => ({ chat: useChat(), pebble: usePebble() }));
}

describe('useChat', () => {
  it('adds the user message and the reply', async () => {
    server.use(chatHandlers.reply({ response: 'Three small steps.', agentName: 'CalmSense' }));
    const { result } = renderChat();

    await act(() => result.current.chat.send('  Help me  '));

    expect(result.current.chat.messages).toMatchObject([
      { role: 'user', text: 'Help me' },
      { role: 'assistant', text: 'Three small steps.', agentName: 'CalmSense' },
    ]);
    expect(result.current.chat.isLoading).toBe(false);
  });

  it('ignores a blank message without calling the backend', async () => {
    let called = false;
    server.use(http.post('/api/agents/chat', () => { called = true; return HttpResponse.json(chatReply()); }));
    const { result } = renderChat();

    let sent: boolean | undefined;
    await act(async () => { sent = await result.current.chat.send('   '); });

    expect(sent).toBe(false);
    expect(called).toBe(false);
    expect(result.current.chat.messages).toEqual([]);
  });

  it('flashes the mood of the reply', async () => {
    server.use(chatHandlers.reply({ mood: 'excited' }));
    const { result } = renderChat();

    await act(() => result.current.chat.send('I did it'));

    await waitFor(() => expect(result.current.pebble.mood).toBe('excited'));
  });

  it('adds a gentle error message when the request fails', async () => {
    server.use(chatHandlers.status(503));
    const { result } = renderChat();

    await act(() => result.current.chat.send('Hello'));

    expect(result.current.chat.messages.at(-1)).toMatchObject({ role: 'error', text: CHAT_ERROR_TEXT });
    expect(result.current.chat.isLoading).toBe(false);
  });
});
