import { http, HttpResponse, type RequestHandler } from 'msw';
import type { ChatResponse } from '@/features/chat';

// A chat reply as the backend sends it. Tests override the fields they check.
export function chatReply(overrides: Partial<ChatResponse> = {}): ChatResponse {
  return {
    intent: 'chat',
    response: 'I am here with you.',
    mood: 'happy',
    agentName: 'PebbleVoice',
    data: null,
    ...overrides,
  };
}

export const chatHandlers = {
  reply: (overrides: Partial<ChatResponse> = {}) =>
    http.post('/api/agents/chat', () => HttpResponse.json(chatReply(overrides))),
  status: (status: number, detail = 'Internal Server Error') =>
    http.post('/api/agents/chat', () => HttpResponse.json({ detail }, { status })),
  networkError: () => http.post('/api/agents/chat', () => HttpResponse.error()),
};

// Default handlers shared by every test. Tests add their own per case with
// `server.use(...)`.
export const handlers: RequestHandler[] = [chatHandlers.reply()];
