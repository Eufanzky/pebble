// @vitest-environment node
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// Every relative link in the repo's Markdown docs points at a file that exists (roadmap 6.2).
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

describe('docs links', () => {
  it.each(DOCS)('%s links only to files that exist', (doc) => {
    const broken = links(readFileSync(join(REPO, doc), 'utf8'))
      .filter((target) => !/^(https?:|mailto:|#)/.test(target))
      .map((target) => target.split('#')[0])
      .filter((target) => target && !existsSync(join(REPO, dirname(doc), target)))
      .map((target) => relative(REPO, join(REPO, dirname(doc), target)));

    expect(broken).toEqual([]);
  });
});
