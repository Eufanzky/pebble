// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// One name for each thing (roadmap 6.4, 6.6). Old names stay only in the docs that record history, and in the
// code that reads data saved under them.
const REPO = join(__dirname, '../../..');
const SCANNED = [
  'frontend/src',
  'frontend/e2e',
  'frontend/public',
  'frontend/package.json',
  'backend/app',
  'backend/tests',
  'backend/pyproject.toml',
  'docker-compose.yml',
  '.github',
];

function files(path: string): string[] {
  const full = join(REPO, path);
  if (!statSync(full).isDirectory()) return [path];
  return readdirSync(full)
    .filter((name) => name !== '__pycache__' && name !== 'results')
    .flatMap((name) => files(join(path, name)));
}

const CODE = /\.(tsx?|css|html|json|py|toml|ya?ml)$/;
const SELF = relative(REPO, __filename);

/** Files in the code that say `pattern`, other than this test and the `allowed` ones. */
function saying(pattern: RegExp, allowed: string[] = []): string[] {
  return SCANNED.flatMap(files).filter(
    (path) => path !== SELF && !allowed.includes(path) && CODE.test(path) && pattern.test(readFileSync(join(REPO, path), 'utf8')),
  );
}

describe('names', () => {
  it('calls the app Pebble everywhere in the code', () => {
    expect(saying(/focus ?buddy/i)).toEqual([]);
  });

  it('calls a part of a task a step, and its size the step size', () => {
    const readersOfOldData = [
      // What a browser kept before accounts, and its test
      'frontend/src/app/(signed-in)/_shell/importLocalData.ts',
      'frontend/src/app/(signed-in)/_shell/importLocalData.test.ts',
      // Migration 0005 renamed the saved `chunk_size`; its test checks that
      'backend/tests/integration/test_migrations.py',
    ];

    expect(saying(/subtask|chunk.?size/i, readersOfOldData)).toEqual([]);
  });
});
