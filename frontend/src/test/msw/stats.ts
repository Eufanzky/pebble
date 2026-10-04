import { http, HttpResponse } from 'msw';
import type { ApiSchema } from '@/shared/api';

// A fake /api/stats: by default an account that hasn't finished anything yet.
// Tests set the summary they need with `statsStore.set(...)`, and read the
// focus sessions the app reported.
type StatsOut = ApiSchema<'StatsOut'>;

const ZERO = { tasks: 0, steps: 0, focusMinutes: 0 };
let summary: ((days: number) => StatsOut) | null = null;
let focus: number[] = [];

/** `days` quiet days ending on 2026-10-03. */
export function quietStats(days: number): StatsOut {
  const end = new Date(Date.UTC(2026, 9, 3));
  const list = Array.from({ length: days }, (_, i) => {
    const day = new Date(end);
    day.setUTCDate(end.getUTCDate() - (days - 1 - i));
    return { date: day.toISOString().slice(0, 10), ...ZERO };
  });
  return {
    start: list[0].date,
    end: list[list.length - 1].date,
    totals: ZERO,
    byTag: { study: 0, communication: 0, project: 0, wellbeing: 0 },
    days: list,
    allTime: ZERO,
  };
}

export const statsStore = {
  /** What the server answers, per range. */
  set(make: (days: number) => StatsOut) {
    summary = make;
  },
  /** The focus sessions the app reported, in minutes. */
  focusSessions: () => [...focus],
  reset() {
    summary = null;
    focus = [];
  },
};

export const statsHandlers = {
  api: () => [
    http.get('/api/stats', ({ request }) => {
      const days = Number(new URL(request.url).searchParams.get('days') ?? 7);
      return HttpResponse.json<StatsOut>((summary ?? quietStats)(days));
    }),
    http.post('/api/stats/focus', async ({ request }) => {
      focus.push(((await request.json()) as ApiSchema<'FocusSession'>).minutes);
      return new HttpResponse(null, { status: 204 });
    }),
  ],
  status: (status: number) => http.all('/api/stats*', () => HttpResponse.json({ detail: 'down' }, { status })),
};
