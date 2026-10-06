import { http, HttpResponse } from 'msw';
import type { ApiSchema } from '@/shared/api';
import { accountStore } from './account';

// A fake /api/suggestions (AdaptLens, 7.6): no suggestion unless a test offers one. Accepting applies it to the
// fake account's preferences; both answers are recorded.
type Suggestion = ApiSchema<'SuggestionOut'>;

let offered: Suggestion | null = null;
let answers: { key: string; answer: 'accept' | 'dismiss' }[] = [];

export const suggestionStore = {
  offer(suggestion: Suggestion) {
    offered = suggestion;
  },
  answers: () => [...answers],
  reset() {
    offered = null;
    answers = [];
  },
};

export const suggestionHandlers = {
  /** The fake; a default handler. */
  api: () => [
    http.get('/api/suggestions', () => HttpResponse.json<Suggestion | null>(offered)),
    http.post('/api/suggestions/accept', async ({ request }) => {
      const { key } = (await request.json()) as ApiSchema<'SuggestionAnswer'>;
      if (!offered || offered.key !== key) return HttpResponse.json({ detail: 'That suggestion has changed.' }, { status: 409 });
      answers.push({ key, answer: 'accept' });
      accountStore.setPreferences({ [offered.preference]: offered.value } as Partial<ApiSchema<'PreferencesOut'>>);
      offered = null;
      return HttpResponse.json(accountStore.preferences());
    }),
    http.post('/api/suggestions/dismiss', async ({ request }) => {
      const { key } = (await request.json()) as ApiSchema<'SuggestionAnswer'>;
      answers.push({ key, answer: 'dismiss' });
      offered = null;
      return new HttpResponse(null, { status: 204 });
    }),
  ],
};
