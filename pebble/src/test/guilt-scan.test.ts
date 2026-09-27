import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Guilt scan: principle 1 of specs/mission.md, "structure without guilt".
// Fails when UI copy, sample data, or agent prompts use a banned pattern.
// Roadmap 6.1 extends the patterns.

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

// What gets scanned: everything the user can read, as source files.
const SCANNED = [
  { dir: 'pebble/src', extensions: ['.ts', '.tsx', '.css'] }, // UI copy, styles, sample data
  { dir: 'backend/app', extensions: ['.py'] }, // prompts, fixed agent replies, the fake LLM's replies
];

// Tests and test helpers quote banned words on purpose.
const isSkipped = (path: string) => /\.test\.tsx?$/.test(path) || path.startsWith('pebble/src/test/');

// An apostrophe as it appears in source: ', ’, or an escaped \'.
const APOS = "(?:'|’|\\\\')";

interface Pattern {
  id: string;
  rule: string;
  regex: RegExp;
  // Kept in the file so each pattern's reach is checked below.
  banned: string[];
  allowed: string[];
}

const PATTERNS: Pattern[] = [
  {
    id: 'streak',
    rule: 'Streaks, or anything that resets to zero.',
    regex: /\bstreaks?\b|\bin a row\b|\bresets? to (?:zero|0)\b/i,
    banned: ['Keep your streak going!', '5 days in a row', 'Your count resets to zero'],
    allowed: ['You finished 14 steps this month', 'Move this to tomorrow'],
  },
  {
    id: 'overdue',
    rule: 'Late tasks are "still open", not "overdue".',
    regex: /over-?due/i, // also inside identifiers such as isOverdue
    banned: ['3 overdue tasks', 'isOverdue', 'Over-due'],
    allowed: ['Still open', 'This one is still open. Move it, make it smaller, or let it go?'],
  },
  {
    id: 'missed-days',
    rule: 'Counting missed days or time away.',
    regex: new RegExp(
      [
        '\\bmissed\\b',
        '\\b(?:days?|weeks?|months?) (?:away|missed|off)\\b',
        '\\b(?:been|were) (?:away|gone)\\b',
        '\\bsince you last\\b',
        `\\bhaven${APOS}?t (?:seen|heard from) you\\b`,
        '\\blast seen\\b',
      ].join('|'),
      'i'
    ),
    banned: [
      'You missed 3 days',
      '2 days away',
      "You've been away for a while",
      'Since you last opened Pebble',
      "We haven't seen you in a week",
      'Last seen 4 days ago',
    ],
    allowed: ['Want to pick one small thing?', 'Take a 10-minute walk', "It's getting late — you've done enough today."],
  },
  {
    id: 'loss-framing',
    rule: 'Loss framing ("don\'t lose your progress").',
    regex: new RegExp(
      [
        `\\bdon${APOS}?t (?:lose|break|miss|fall)\\b`,
        '\\b(?:lose|losing|lost) (?:all )?(?:your|the) (?:progress|streak|work)\\b',
        '\\bfall(?:ing|en)? behind\\b',
        '\\bbehind schedule\\b',
        `\\byou${APOS}?re behind\\b`,
        '\\blast chance\\b',
      ].join('|'),
      'i'
    ),
    banned: [
      "Don't lose your progress",
      "don\\'t break the chain",
      'You will lose all your progress',
      "You're falling behind",
      'Behind schedule',
      "you’re behind",
      'Last chance to finish',
    ],
    allowed: ['You finished 3 things', 'Letting go is fine', 'Glow behind dot'],
  },
  {
    id: 'alarm-styling',
    rule: 'Red or alarm styling.',
    regex: new RegExp(
      [
        '\\b(?:text|bg|border|ring|outline|fill|stroke|from|via|to|shadow|decoration|accent|divide)-(?:red|rose)-\\d{2,3}\\b',
        '(?::\\s*|[\'"])(?:red|darkred|crimson|firebrick)\\b',
        '#(?:f00|ff0000)\\b',
        '\\b(?:alarm|danger|urgent)\\b',
      ].join('|'),
      'i'
    ),
    banned: ['className="text-red-500"', 'color: red;', "{ color: 'crimson' }", 'background: #FF0000;', 'btn-danger', 'Urgent!'],
    allowed: ["color: 'var(--accent-coral)'", 'background: #E8856A;', 'rgba(232,133,106,0.1)', 'bg-amber-200', 'Reading level'],
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
            if (pattern.regex.test(line)) matches.push({ file, lineNumber: i + 1, line: line.trim(), pattern });
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

    expect(files).toContain('pebble/src/features/tasks/data/sampleTasks.ts');
    expect(files).toContain('pebble/src/data/pebbleMessages.ts');
    expect(files).toContain('pebble/src/features/tasks/components/TodayView.tsx');
    expect(files).toContain('pebble/src/app/globals.css');
    expect(files).toContain('backend/app/application/prompts.py');
    expect(files).toContain('backend/app/application/agents/orchestrator.py');
    expect(files).toContain('backend/app/infrastructure/llm/fake.py');
    expect(files).not.toContain('pebble/src/test/guilt-scan.test.ts');
  });

  it('finds no banned patterns', () => {
    const violations = matches
      .filter((m) => !exceptionFor(m))
      .map((m) => `${m.file}:${m.lineNumber} [${m.pattern.id}] ${m.pattern.rule}\n    ${m.line}`);

    expect(violations, `Banned patterns found:\n${violations.join('\n')}`).toEqual([]);
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
      expect(text).toMatch(pattern.regex);
    });

    it.each(pattern.allowed)('allows %j', (text) => {
      expect(text).not.toMatch(pattern.regex);
    });
  });
});
