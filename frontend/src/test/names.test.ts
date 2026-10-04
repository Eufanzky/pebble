// @vitest-environment node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// The app has one name (roadmap 6.4). Its hackathon name stays only in the docs that record history.
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

describe('names', () => {
  it('calls the app Pebble everywhere in the code', () => {
    const self = relative(REPO, __filename);
    const old = SCANNED.flatMap(files).filter(
      (path) => path !== self && /\.(tsx?|css|html|json|py|toml|ya?ml)$/.test(path) && /focus ?buddy/i.test(readFileSync(join(REPO, path), 'utf8')),
    );

    expect(old).toEqual([]);
  });
});
