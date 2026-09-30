import { http, HttpResponse } from 'msw';
import type { ApiSchema } from '@/shared/api';

// Fakes of the account's preferences, activity log and import, with the
// backend's behaviour, so providers load and save against state that persists
// across renders. Reset after each test (setup.ts).
type PreferencesOut = ApiSchema<'PreferencesOut'>;
type ActivityEntryOut = ApiSchema<'ActivityEntryOut'>;
type ImportRequest = ApiSchema<'ImportRequest'>;

const DEFAULTS: PreferencesOut = {
  readingLevel: 5,
  chunkSize: 'medium',
  reduceAnimations: false,
  calmMode: false,
  pebbleColor: 'lavender',
  pebblePersonality: 'gentle',
  pebbleModel: 'chonky-plus',
};

let preferences: PreferencesOut = { ...DEFAULTS };
let entries: ActivityEntryOut[] = []; // newest first
let imports: ImportRequest[] = [];
let deleted = false;
let nextId = 1;

export const accountStore = {
  preferences: () => ({ ...preferences }),
  setPreferences(changes: Partial<PreferencesOut>) {
    preferences = { ...preferences, ...changes };
  },
  /** The log, newest first. */
  activity: () => structuredClone(entries),
  setActivity(list: Omit<ActivityEntryOut, 'id'>[]) {
    entries = list.map((e) => ({ ...e, id: `entry-${nextId++}` }));
  },
  /** Every import the app sent. */
  imports: () => structuredClone(imports),
  /** Whether the app asked to delete the account. */
  deleted: () => deleted,
  reset() {
    preferences = { ...DEFAULTS };
    entries = [];
    imports = [];
    deleted = false;
    nextId = 1;
  },
};

export const accountHandlers = {
  api: () => [
    http.get('/api/preferences', () => HttpResponse.json<PreferencesOut>(preferences)),
    http.patch('/api/preferences', async ({ request }) => {
      preferences = { ...preferences, ...((await request.json()) as Partial<PreferencesOut>) };
      return HttpResponse.json<PreferencesOut>(preferences);
    }),
    http.get('/api/activity', () => HttpResponse.json<ActivityEntryOut[]>(entries)),
    http.post('/api/activity', async ({ request }) => {
      const body = (await request.json()) as ApiSchema<'ActivityEntryIn'>;
      const entry: ActivityEntryOut = {
        id: `entry-${nextId++}`,
        timestamp: new Date().toISOString(),
        agent: body.agent,
        action: body.action,
        reasoning: body.reasoning ?? '',
        safetyStatus: body.safetyStatus ?? 'passed',
      };
      entries = [entry, ...entries];
      return HttpResponse.json<ActivityEntryOut>(entry, { status: 201 });
    }),
    http.get('/api/account/export', () =>
      HttpResponse.json({
        exportedAt: new Date().toISOString(),
        userId: 'dev:test',
        data: { preferences: [preferences], activity_entries: entries },
      }),
    ),
    http.delete('/api/account', () => {
      deleted = true;
      preferences = { ...DEFAULTS };
      entries = [];
      return new HttpResponse(null, { status: 204 });
    }),
    http.post('/api/import', async ({ request }) => {
      const body = (await request.json()) as ImportRequest;
      imports.push(body);
      return HttpResponse.json<ApiSchema<'ImportResponse'>>({
        tasks: body.tasks?.length ?? 0,
        preferences: body.preferences != null,
        activity: body.activity?.length ?? 0,
      });
    }),
  ],
  /** Every preferences, activity, import or account request answers `status`. */
  status: (status: number) => [
    http.all('/api/preferences', () => HttpResponse.json({ detail: 'down' }, { status })),
    http.all('/api/activity', () => HttpResponse.json({ detail: 'down' }, { status })),
    http.all('/api/import', () => HttpResponse.json({ detail: 'down' }, { status })),
    http.all('/api/account*', () => HttpResponse.json({ detail: 'down' }, { status })),
  ],
};
