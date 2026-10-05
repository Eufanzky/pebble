import { http, HttpResponse } from 'msw';
import type { ApiSchema } from '@/shared/api';

// SimplifyCore (`POST /api/agents/simplify`), as the backend's fake LLM answers: the level and the text's
// first sentence, and one action item. It records what it was asked.
type SimplifyRequest = ApiSchema<'SimplifyRequest'>;
type SimplifyResponse = ApiSchema<'SimplifyResponse'>;

let asked: { text: string; readingLevel: number }[] = [];

export const simplifyStore = {
  /** Every request, in order. */
  asked: () => [...asked],
  reset() {
    asked = [];
  },
};

function simplified(text: string, level: number, overrides: Partial<SimplifyResponse> = {}): SimplifyResponse {
  return {
    simplified: `Level ${level}: ${text.split(/(?<=[.!?])\s/)[0]}`,
    extractedTasks: [{ title: 'Read the first part', timeEstimate: '~10 min', tag: 'study' }],
    tags: ['reading'],
    whyExplanation: `I wrote this at level ${level}.`,
    groundedness: { grounded: true, ungroundedPercentage: 0 },
    ...overrides,
  };
}

export const simplifyHandlers = {
  /** The fake SimplifyCore; a default handler. `overrides` change every answer. */
  reply: (overrides: Partial<SimplifyResponse> = {}) =>
    http.post('/api/agents/simplify', async ({ request }) => {
      const { text, readingLevel = 5 } = (await request.json()) as SimplifyRequest;
      asked.push({ text, readingLevel });
      return HttpResponse.json<SimplifyResponse>(simplified(text, readingLevel, overrides));
    }),
  /** SimplifyCore can't answer. */
  status: (status: number) =>
    http.post('/api/agents/simplify', () => HttpResponse.json({ detail: "Pebble couldn't answer just now." }, { status })),
};
