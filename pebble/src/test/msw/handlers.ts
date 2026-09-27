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

const READER_TOKEN = '/api/documents/immersive-reader/token';

export const readerHandlers = {
  token: () => http.get(READER_TOKEN, () => HttpResponse.json({ token: 'test-token', subdomain: 'test' })),
  // What a backend without Immersive Reader configured answers.
  unavailable: () =>
    http.get(READER_TOKEN, () => HttpResponse.json({ detail: 'Immersive Reader is not configured' }, { status: 503 })),
};

export const documentHandlers = {
  // Reading a multipart body hangs under jsdom, so the handler only checks
  // that one was sent.
  parsed: (text = 'Parsed text.', type = 'technical') =>
    http.post('/api/documents/parse', ({ request }) =>
      request.headers.get('Content-Type')?.startsWith('multipart/form-data')
        ? HttpResponse.json({ title: 'document', type, text, pages: 1 })
        : HttpResponse.json({ detail: 'Expected a file upload' }, { status: 422 })),
  status: (status: number) =>
    http.post('/api/documents/parse', () => HttpResponse.json({ detail: 'Could not read it' }, { status })),
};

// Default handlers shared by every test. Tests add their own per case with
// `server.use(...)`.
export const handlers: RequestHandler[] = [chatHandlers.reply(), readerHandlers.unavailable()];
