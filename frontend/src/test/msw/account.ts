import { http, HttpResponse } from 'msw';
import type { ApiSchema } from '@/shared/api';
import { taskStore } from './tasks';

// Fakes of the account's preferences, activity log and import, with the
// backend's behaviour, so providers load and save against state that persists
// across renders. Reset after each test (setup.ts).
type PreferencesOut = ApiSchema<'PreferencesOut'>;
type ActivityEntryOut = ApiSchema<'ActivityEntryOut'>;
type ImportRequest = ApiSchema<'ImportRequest'>;

const DEFAULTS: PreferencesOut = {
  readingLevel: 5,
  stepSize: 'medium',
  reduceAnimations: false,
  calmMode: false,
  pebbleColor: 'lavender',
  pebblePersonality: 'gentle',
  pebbleModel: 'chonky-plus',
  reminderTime: '',
  reminderNotifications: false,
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
  /** Entries without WhyBot's `explanation` get an empty one, as older entries have. */
  setActivity(list: (Omit<ActivityEntryOut, 'id' | 'explanation'> & { explanation?: string })[]) {
    entries = list.map((e) => ({ explanation: '', ...e, id: `entry-${nextId++}` }));
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
      // Like the backend: imported tasks go after the account's own
      taskStore.replace([...taskStore.all(), ...taskStore.created(body.tasks ?? [])]);
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
