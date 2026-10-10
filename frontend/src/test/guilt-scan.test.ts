import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Guilt scan: principle 1 of specs/mission.md, "structure without guilt".
// Fails when UI copy, sample data, or agent prompts use a banned pattern.
// Every rule in principle 1 has a pattern below (8.1). What a pattern can't see is tested where it lives:
// counts that never go down (8.2), the deadline bar (8.3), "still open" (8.4), coming back (8.5), reminders (8.6).

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

// What gets scanned: everything the user can read, as source files.
const SCANNED = [
  { dir: 'frontend/src', extensions: ['.ts', '.tsx', '.css'] }, // UI copy, styles, sample data
  { dir: 'frontend/public', extensions: ['.html', '.js'] }, // the offline page and the service worker
  { dir: 'backend/app', extensions: ['.py'] }, // prompts, fixed agent replies, the fake LLM's replies
];

// Tests and test helpers quote banned words on purpose.
const isSkipped = (path: string) => /\.test\.tsx?$/.test(path) || path.startsWith('frontend/src/test/');

// An apostrophe as it appears in source: ', ’, or an escaped \'.
const APOS = "(?:'|’|\\\\')";

interface Pattern {
  id: string;
  rule: string;
  matches: (line: string) => boolean;
  // Kept in the file so each pattern's reach is checked below.
  banned: string[];
  allowed: string[];
}

const byRegex = (regex: RegExp) => (line: string) => regex.test(line);

// A colour literal: #rgb, #rrggbb (with or without alpha) or rgb()/rgba().
const COLOUR = /#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/gi;

function rgbOf(literal: string): [number, number, number] {
  if (!literal.startsWith('#')) return literal.match(/\d+/g)!.slice(0, 3).map(Number) as [number, number, number];
  const hex = literal.length === 4 ? [...literal.slice(1)].map((c) => c + c).join('') : literal.slice(1, 7);
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/** Red, as an alarm reads it: a hue within 12° of pure red, saturated, neither near-black nor pastel. */
function isRed(literal: string): boolean {
  const [r, g, b] = rgbOf(literal).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min || max !== r) return false;
  const saturation = (max - min) / (1 - Math.abs(2 * lightness - 1));
  const hue = ((60 * (g - b)) / (max - min) + 360) % 360;
  return (hue <= 12 || hue >= 348) && saturation >= 0.5 && lightness >= 0.25 && lightness <= 0.7;
}

const PATTERNS: Pattern[] = [
  {
    id: 'streak',
    rule: 'Streaks, or anything that resets to zero.',
    matches: byRegex(
      new RegExp(
        [
          '\\bstreaks?\\b',
          '\\bin a row\\b',
          '\\bresets? to (?:zero|0)\\b',
          '(?<!\\bnothing )\\b(?:goes|go|went|drops?|falls?) back to (?:zero|0)\\b', // "Nothing goes back to zero" is the promise
          '\\bstart(?:s|ing)? (?:over|again) from (?:zero|scratch|0)\\b',
          '\\bbreak(?:s|ing)? the chain\\b',
          '\\bconsecutive days?\\b',
        ].join('|'),
        'i'
      )
    ),
    banned: [
      'Keep your streak going!',
      '5 days in a row',
      'Your count resets to zero',
      'Your count goes back to 0',
      'Starting over from scratch',
      "Don't break the chain",
      '3 consecutive days',
    ],
    allowed: ['You finished 14 steps this month', 'Move this to tomorrow', 'Start again whenever you like', 'Nothing goes back to zero'],
  },
  {
    id: 'overdue',
    rule: 'Late tasks are "still open", not "overdue".',
    matches: byRegex(
      new RegExp(
        [
          'over-?due', // also inside identifiers such as isOverdue
          '\\bpast[- ]due\\b',
          '\\blate tasks?\\b', // late steps are steps late in the day
          '\\b(?:tasks?|steps?) (?:is|are|was|were|running) late\\b',
          '\\b(?:deadline|due date) (?:has |have )?passed\\b',
        ].join('|'),
        'i'
      )
    ),
    banned: ['3 overdue tasks', 'isOverdue', 'Over-due', 'Past due', '2 late tasks', 'This task is late', 'The deadline has passed'],
    allowed: [
      'Still open',
      'This one is still open. Move it, make it smaller, or let it go?',
      "It's getting late — you've done enough today.",
      'CalmSense keeps late steps short.',
    ],
  },
  {
    id: 'missed-days',
    rule: 'Counting missed days or time away.',
    matches: byRegex(new RegExp(
      [
        '\\bmissed\\b',
        '\\b(?:days?|weeks?|months?) (?:away|missed|off)\\b',
        '\\b(?:been|were) (?:away|gone)\\b',
        '\\bsince you last\\b',
        `\\bhaven${APOS}?t (?:seen|heard from) you\\b`,
        '\\blast seen\\b',
        `\\bit${APOS}?s been (?:a while|ages|a few days|\\d+)\\b`,
        '\\blong time no see\\b',
        '\\bwhere (?:have )?you been\\b',
        '\\b\\d+ (?:days?|weeks?|months?) (?:since|without)\\b',
        '\\binactive for\\b',
        '\\bafter (?:\\d+|a few|several|many|some) (?:days?|weeks?|months?)\\b', // "Welcome back after 6 days" (8.5)
        '\\b(?:\\d+|a few|several|many) (?:days?|weeks?|months?) ago\\b',
      ].join('|'),
      'i'
    )),
    banned: [
      'You missed 3 days',
      '2 days away',
      "You've been away for a while",
      'Since you last opened Pebble',
      "We haven't seen you in a week",
      'Last seen 4 days ago',
      "It's been a while!",
      "It’s been 5 days",
      'Long time no see',
      'Where have you been?',
      '6 days without a finished task',
      'Inactive for 2 weeks',
      'Welcome back after 6 days!',
      'You opened Pebble 3 weeks ago',
      'after a few days off',
    ],
    allowed: [
      'Want to pick one small thing?',
      'Take a 10-minute walk',
      "It's getting late — you've done enough today.",
      'You finished 14 steps in the last 30 days',
      'Start wherever you like. One small thing is enough.',
      'Next week',
    ],
  },
  {
    id: 'loss-framing',
    rule: 'Loss framing ("don\'t lose your progress").',
    matches: byRegex(new RegExp(
      [
        `\\bdon${APOS}?t (?:lose|break|miss|fall)\\b`,
        '\\b(?:lose|losing|lost) (?:all )?(?:your|the) (?:progress|streak|work)\\b',
        '\\bfall(?:ing|en)? behind\\b',
        '\\bbehind schedule\\b',
        `\\byou${APOS}?re behind\\b`,
        '\\blast chance\\b',
        `\\bbefore it${APOS}?s too late\\b`,
        `\\byou${APOS}?(?:ll| will) lose\\b`,
        `\\bdon${APOS}?t let (?:it|this|them|that) slip\\b`,
        '\\bwasted\\b',
      ].join('|'),
      'i'
    )),
    banned: [
      "Don't lose your progress",
      "don\\'t break the chain",
      'You will lose all your progress',
      "You're falling behind",
      'Behind schedule',
      "you’re behind",
      'Last chance to finish',
      "Finish it before it's too late",
      "You'll lose your place",
      "Don't let it slip",
      'A wasted day',
    ],
    allowed: ['You finished 3 things', 'Letting go is fine', 'Glow behind dot'],
  },
  {
    id: 'alarm-styling',
    rule: 'Red or alarm styling.',
    matches: byRegex(new RegExp(
      [
        '\\b(?:text|bg|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|accent|divide)-(?:red|rose)-\\d{2,3}\\b',
        '(?::\\s*|[\'"])(?:red|darkred|crimson|firebrick)\\b',
        '#(?:f00|ff0000)\\b',
        '\\b(?:alarm|danger|urgent)\\b',
        '[\\u{1F6A8}\\u{26A0}\\u{2757}\\u{203C}\\u{26D4}\\u{1F534}]', // 🚨 ⚠ ❗ ‼ ⛔ 🔴
      ].join('|'),
      'iu'
    )),
    banned: ['className="text-red-500"', 'color: red;', "{ color: 'crimson' }", 'background: #FF0000;', 'btn-danger', 'Urgent!', '⚠️ Still open', '🚨'],
    allowed: ["color: 'var(--color-tag-project)'", 'background: #E8856A;', 'rgba(232,133,106,0.1)', 'bg-amber-200', 'Reading level', '✦'],
  },
  {
    id: 'red-colour',
    rule: 'Red or alarm styling (any red colour literal, by its hue).',
    matches: (line) => (line.match(COLOUR) ?? []).some(isRed),
    banned: ['color: #f00;', 'border-color: #dc2626;', "background: '#EF4444'", 'rgba(220, 20, 60, 0.4)', '--color-error: #e53e3e;', '#f43f5e'],
    allowed: [
      '--color-tag-project: #e8856a;', // the coral tag colour, 13° from red
      'background: #E8A0B0;', // a pastel pink
      'color: #D07050;',
      '--color-bg: #0f0d0a;',
      'rgba(232,133,106,0.1)',
      'issue #123',
    ],
  },
  {
    id: 'stopping-early',
    rule: 'Stopping a focus session early is fine.',
    matches: byRegex(
      new RegExp(
        [
          '\\b(?:gave|give|giving) up on (?:the |your |this )?(?:session|focus|timer|task|step)\\b',
          '\\b(?:abandoned|failed|broken|incomplete|wasted) (?:focus )?(?:sessions?|focus|pomodoros?)\\b',
          '\\bpenalt(?:y|ies)\\b',
          '\\bquitter\\b',
          '\\bonly (?:lasted|managed|focused)\\b',
        ].join('|'),
        'i'
      )
    ),
    banned: ['You gave up on the session', '2 abandoned sessions', 'Failed pomodoro', 'No penalty this time', 'Quitter!', 'You only lasted 8 minutes'],
    allowed: ['Taking a breather? Pick it up whenever you like.', 'Stop whenever you need to.', 'I give up'],
  },
  {
    id: 'unasked-nudge',
    rule: 'Nudges nobody asked for: a notification needs a reminder the user set (8.6).',
    matches: byRegex(/\bnew (?:window\.)?Notification\(|\bNotification\.requestPermission\b|\bshowNotification\(|\bnavigator\.vibrate\(/),
    banned: ["new Notification('Time to focus')", "new window.Notification('Pebble')", 'await Notification.requestPermission()', "registration.showNotification('Hi')", 'navigator.vibrate(200)'],
    allowed: ['Reminders are off unless you turn them on.', 'notificationsEnabled: false'],
  },
];

// A known, justified match. Each one needs a written reason.
interface Exception {
  file: string;
  pattern: string;
  line: string; // a substring of the matching line
  reason: string;
}

const EXCEPTIONS: Exception[] = [
  {
    file: 'backend/app/application/prompts.py',
    pattern: 'loss-framing',
    line: 'Never say "you should have", "you\'re behind"',
    reason: 'The voice rules quote the phrase to forbid it.',
  },
  {
    file: 'frontend/src/features/reminders/lib/notifications.ts',
    pattern: 'unasked-nudge',
    line: 'window.Notification.requestPermission()',
    reason: 'Asked only when the user turns on notifications for a reminder they set (8.6, ReminderSettings).',
  },
  {
    file: 'frontend/src/features/reminders/lib/notifications.ts',
    pattern: 'unasked-nudge',
    line: "new window.Notification('Pebble'",
    reason: 'Only for the reminder the user set, with notifications they turned on (8.6, useReminder).',
  },
  {
    file: 'backend/app/application/prompts.py',
    pattern: 'streak',
    line: 'No guilt (principle 1): no streaks',
    reason: 'The voice rules name principle 1 to forbid it.',
  },
  {
    file: 'backend/app/application/prompts.py',
    pattern: 'missed-days',
    line: 'No guilt (principle 1): no streaks',
    reason: 'The voice rules name principle 1 to forbid it.',
  },
  {
    file: 'backend/app/application/prompts.py',
    pattern: 'overdue',
    line: 'No guilt (principle 1): no streaks',
    reason: 'The voice rules name principle 1 to forbid it.',
  },
  {
    file: 'backend/app/application/prompts.py',
    pattern: 'streak',
    line: 'No guilt: never mention streaks, missed days',
    reason: 'The voice rules name principle 1 to forbid it.',
  },
  {
    file: 'backend/app/application/prompts.py',
    pattern: 'missed-days',
    line: 'No guilt: never mention streaks, missed days',
    reason: 'The voice rules name principle 1 to forbid it.',
  },
  {
    file: 'backend/app/application/prompts.py',
    pattern: 'overdue',
    line: 'A late task is "still open", never "overdue"',
    reason: 'The voice rules name principle 1 to forbid it.',
  },
  {
    file: 'backend/app/application/prompts.py',
    pattern: 'loss-framing',
    line: 'No loss framing: never "don\'t lose your progress"',
    reason: 'The voice rules name principle 1 to forbid it.',
  },
];

function listFiles(dir: string, extensions: string[]): string[] {
  const entries = readdirSync(join(repoRoot, dir), { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && extensions.some((ext) => e.name.endsWith(ext)))
    .map((e) => relative(repoRoot, join(e.parentPath, e.name)))
    .filter((path) => !path.includes('__pycache__') && !isSkipped(path))
    .sort();
}

interface Match {
  file: string;
  lineNumber: number;
  line: string;
  pattern: Pattern;
}

function scan(): Match[] {
  const matches: Match[] = [];
  for (const { dir, extensions } of SCANNED) {
    for (const file of listFiles(dir, extensions)) {
      readFileSync(join(repoRoot, file), 'utf8')
        .split('\n')
        .forEach((line, i) => {
          for (const pattern of PATTERNS) {
            if (pattern.matches(line)) matches.push({ file, lineNumber: i + 1, line: line.trim(), pattern });
          }
        });
    }
  }
  return matches;
}

function exceptionFor(match: Match) {
  return EXCEPTIONS.find(
    (e) => e.file === match.file && e.pattern === match.pattern.id && match.line.includes(e.line)
  );
}

describe('guilt scan', () => {
  const matches = scan();

  it('scans the UI source, sample data and agent prompts', () => {
    const files = SCANNED.flatMap(({ dir, extensions }) => listFiles(dir, extensions));

    expect(files).toContain('frontend/src/features/tasks/data/sampleTasks.ts');
    expect(files).toContain('frontend/src/features/companion/data/pebbleMessages.ts');
    expect(files).toContain('frontend/src/features/tasks/components/TodayView.tsx');
    expect(files).toContain('frontend/src/app/globals.css');
    expect(files).toContain('frontend/public/offline.html');
    expect(files).toContain('backend/app/application/prompts.py');
    expect(files).toContain('backend/app/application/agents/orchestrator.py');
    expect(files).toContain('backend/app/infrastructure/llm/fake.py');
    expect(files).not.toContain('frontend/src/test/guilt-scan.test.ts');
  });

  it('finds no banned patterns', () => {
    const violations = matches
      .filter((m) => !exceptionFor(m))
      .map((m) => `${m.file}:${m.lineNumber} [${m.pattern.id}] ${m.pattern.rule}\n    ${m.line}`);

    expect(violations, `Banned patterns found:\n${violations.join('\n')}`).toEqual([]);
  });

  // Roadmap 10.4: being over the limit is never the user's fault, and it's said without pressure
  it('passes the resting message, where the backend and the frontend keep it', () => {
    const files = SCANNED.flatMap(({ dir, extensions }) => listFiles(dir, extensions));
    expect(files).toContain('backend/app/api/errors.py');
    expect(files).toContain('frontend/src/shared/lib/api.ts');

    const message = 'Pebble is resting for a moment. Try again in a little while.';
    expect(PATTERNS.filter((p) => p.matches(message)).map((p) => p.id)).toEqual([]);
    expect(readFileSync(join(repoRoot, 'frontend/src/shared/lib/api.ts'), 'utf8')).toContain(message);
  });

  it('has no stale exceptions', () => {
    const stale = EXCEPTIONS.filter((e) => !matches.some((m) => exceptionFor(m) === e));

    expect(stale).toEqual([]);
  });

  it('gives every exception a reason', () => {
    for (const e of EXCEPTIONS) expect(e.reason.trim()).not.toBe('');
  });

  describe.each(PATTERNS)('pattern $id', (pattern) => {
    it.each(pattern.banned)('catches %j', (text) => {
      expect(pattern.matches(text)).toBe(true);
    });

    it.each(pattern.allowed)('allows %j', (text) => {
      expect(pattern.matches(text)).toBe(false);
    });
  });
});
