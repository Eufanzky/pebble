import type { ApiSchema } from '@/shared/api';

/** The import, with every part present (possibly empty). */
type ImportRequest = Required<ApiSchema<'ImportRequest'>>;
type ImportTask = ImportRequest['tasks'][number];
type ImportEntry = ImportRequest['activity'][number];
type Storage = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Where the app kept things in the browser before sign-in (up to roadmap 4.4). */
export const LEGACY_KEYS = ['pebble-tasks', 'pebble-preferences', 'pebble-activity'] as const;
/** Set while an import is on its way, so a second tab doesn't send it twice. */
export const IMPORT_MARK = 'pebble-import-started';
const STALE_MARK_MS = 60_000;

const TAGS = ['study', 'communication', 'project', 'wellbeing'];
const PRIORITIES = ['high', 'medium', 'low'];
const AGENTS = ['CalmSense', 'AdaptLens', 'SimplifyCore', 'PebbleVoice', 'WhyBot', 'BridgeBot'];
const PREFERENCE_VALUES: Record<string, (v: unknown) => boolean> = {
  readingLevel: (v) => Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 10,
  chunkSize: (v) => ['small', 'medium', 'large'].includes(v as string),
  reduceAnimations: (v) => typeof v === 'boolean',
  calmMode: (v) => typeof v === 'boolean',
  pebbleColor: (v) => ['lavender', 'sage', 'coral', 'amber', 'sky'].includes(v as string),
  pebblePersonality: (v) => ['gentle', 'playful', 'calm'].includes(v as string),
  pebbleModel: (v) =>
    ['classic', 'chonky', 'mochi', 'minimal', 'chonky-plus', 'mochi-plus', 'minimal-plus'].includes(v as string),
};

type Loose = Record<string, unknown>;

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isObject = (v: unknown): v is Loose => typeof v === 'object' && v !== null && !Array.isArray(v);

function parse(storage: Storage, key: string): unknown {
  try {
    const raw = storage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function tasksFrom(value: unknown): ImportTask[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isObject).flatMap((t) => {
    const title = text(t.title, 500);
    if (!title) return [];
    const steps = Array.isArray(t.subtasks) ? t.subtasks.filter(isObject) : [];
    return [
      {
        title,
        timeEstimate: text(t.timeEstimate, 50),
        tag: (TAGS.includes(t.tag as string) ? t.tag : 'project') as ImportTask['tag'],
        priority: (PRIORITIES.includes(t.priority as string) ? t.priority : 'medium') as ImportTask['priority'],
        completed: t.completed === true,
        whyExplanation: text(t.whyExplanation, 5000),
        subtasks: steps
          .map((s) => ({
            title: text(s.title, 500),
            timeEstimate: text(s.timeEstimate, 50),
            completed: s.completed === true,
          }))
          .filter((s) => s.title)
          .slice(0, 50),
      },
    ];
  }).slice(0, 500);
}

function preferencesFrom(value: unknown): ImportRequest['preferences'] {
  if (!isObject(value)) return null;
  const valid = Object.fromEntries(Object.entries(value).filter(([k, v]) => PREFERENCE_VALUES[k]?.(v)));
  return Object.keys(valid).length > 0 ? (valid as ImportRequest['preferences']) : null;
}

function activityFrom(value: unknown): ImportEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isObject).flatMap((e) => {
    const action = text(e.action, 500);
    const time = new Date(e.timestamp as string);
    if (!action || !AGENTS.includes(e.agent as string) || Number.isNaN(time.getTime())) return [];
    return [
      {
        agent: e.agent as ImportEntry['agent'],
        action,
        reasoning: text(e.reasoning, 2000),
        safetyStatus: e.safetyStatus === 'flagged' ? ('flagged' as const) : ('passed' as const),
        timestamp: time.toISOString(),
      },
    ];
  }).slice(0, 1000);
}

/**
 * What this browser kept before sign-in, as an import for the account, and
 * whether any of it was there at all. Damaged entries are left out rather
 * than failing the whole import.
 */
export function readLocalData(storage: Storage): { body: ImportRequest; found: boolean } {
  const found = LEGACY_KEYS.some((key) => storage.getItem(key) !== null);
  const body: ImportRequest = {
    tasks: tasksFrom(parse(storage, 'pebble-tasks')),
    preferences: preferencesFrom(parse(storage, 'pebble-preferences')),
    activity: activityFrom(parse(storage, 'pebble-activity')),
  };
  return { body, found };
}

export function isEmpty(body: ImportRequest): boolean {
  return body.tasks.length === 0 && body.preferences == null && body.activity.length === 0;
}

/** Another tab is importing right now (a mark older than a minute is from a tab that closed). */
export function importUnderWay(storage: Storage, now = Date.now()): boolean {
  const started = Number(storage.getItem(IMPORT_MARK));
  return Number.isFinite(started) && started > 0 && now - started < STALE_MARK_MS;
}

/** The browser's copy is in the account now: forget it. */
export function forgetLocalData(storage: Storage) {
  for (const key of LEGACY_KEYS) storage.removeItem(key);
  storage.removeItem(IMPORT_MARK);
}
