// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// Every relative link in the repo's Markdown docs points at a file that exists (roadmap 6.2),
// and every repo path the current docs name in backticks exists too, so a rename can't leave them behind (6.4).
const REPO = join(__dirname, '../../..');
const DOCS = [
  'README.md',
  'CLAUDE.md',
  'backend/README.md',
  'backend/tests/evals/README.md',
  ...readdirSync(join(REPO, 'specs'))
    .filter((name) => name.endsWith('.md'))
    .map((name) => `specs/${name}`),
  'specs/changes/README.md',
];

function links(markdown: string): string[] {
  // [text](target) outside code; images too
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  return [...withoutCode.matchAll(/\]\(([^)\s]+)\)/g)].map((m) => m[1]);
}

// The roadmap and the audit record what was, so they name old paths on purpose.
const CURRENT_DOCS = DOCS.filter((doc) => !['specs/roadmap.md', 'specs/audit.md', 'specs/changes/README.md'].includes(doc));

/** `frontend/src/...`, `backend/app/...` and the like, written in backticks; not patterns or files setup creates. */
function repoPaths(markdown: string): string[] {
  return [...markdown.matchAll(/`((?:frontend|backend|specs|docker|\.github)\/[^`\s]*)`/g)]
    .map((m) => m[1].replace(/:\d+$/, ''))
    .filter((path) => !/[<>*{}…]/.test(path) && !/\.env(\.local)?$/.test(path));
}

describe('docs links', () => {
  it.each(DOCS)('%s links only to files that exist', (doc) => {
    const broken = links(readFileSync(join(REPO, doc), 'utf8'))
      .filter((target) => !/^(https?:|mailto:|#)/.test(target))
      .map((target) => target.split('#')[0])
      .filter((target) => target && !existsSync(join(REPO, dirname(doc), target)))
      .map((target) => relative(REPO, join(REPO, dirname(doc), target)));

    expect(broken).toEqual([]);
  });

  it.each(CURRENT_DOCS)('%s names only repo paths that exist', (doc) => {
    const missing = repoPaths(readFileSync(join(REPO, doc), 'utf8')).filter((path) => !existsSync(join(REPO, path)));

    expect([...new Set(missing)]).toEqual([]);
  });

  it.each(DOCS)('%s links to this repository by its real name on GitHub', (doc) => {
    // A folder rename once rewrote these too (`github.com/Eufanzky/frontend`, A-030)
    const elsewhere = [...readFileSync(join(REPO, doc), 'utf8').matchAll(/github\.com\/Eufanzky\/([\w.-]+)/g)]
      .map((m) => m[1])
      .filter((repo) => repo !== 'pebble');

    expect(elsewhere).toEqual([]);
  });
});
