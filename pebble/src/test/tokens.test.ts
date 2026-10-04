import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// Design tokens (roadmap 5.1, 6.2): colours are defined once, in shared/ui/tokens.css,
// and every custom property used anywhere is defined somewhere.
const SRC = join(__dirname, '..');
const TOKENS = 'shared/ui/tokens.css';

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(css|tsx?)$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

const sources = files(SRC).map((path) => ({ path: relative(SRC, path), text: readFileSync(path, 'utf8') }));
const COLOUR_VALUE = /^\s*(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|color-mix\()/i;

/** `--name: value` in CSS, `'--name': value` in inline styles, `setProperty('--name', ...)` in code. */
function definitions(text: string): { name: string; value: string }[] {
  const css = [...text.matchAll(/(--[\w-]+)\s*:\s*([^;}\n]+)/g)].map((m) => ({ name: m[1], value: m[2] }));
  const inline = [...text.matchAll(/['"](--[\w-]+)['"]\s*:\s*([^,}\n]+)/g)].map((m) => ({ name: m[1], value: m[2] }));
  const js = [...text.matchAll(/setProperty\(\s*['"](--[\w-]+)['"]/g)].map((m) => ({ name: m[1], value: '' }));
  return [...css, ...inline, ...js];
}

describe('design tokens', () => {
  it('defines colours only in tokens.css (plus the Pebble colour defaults in globals.css)', () => {
    const outside = sources
      .filter(({ path }) => path !== TOKENS)
      .flatMap(({ path, text }) =>
        definitions(text)
          .filter(({ name, value }) => COLOUR_VALUE.test(value) && !name.startsWith('--pebble-'))
          .map(({ name }) => `${path}: ${name}`),
      );

    expect(outside).toEqual([]);
  });

  it('uses only custom properties that are defined somewhere', () => {
    const defined = new Set(sources.flatMap(({ text }) => definitions(text).map((d) => d.name)));
    // Set by next/font on <html> in app/layout.tsx
    for (const font of ['--font-nunito', '--font-baloo']) defined.add(font);

    const unknown = sources.flatMap(({ path, text }) =>
      [...text.matchAll(/var\((--[\w-]+)/g)]
        .map((m) => m[1])
        // `var(--color-${name})` in a template literal is checked by the names it's built from
        .filter((name) => !name.endsWith('-') && !defined.has(name))
        .map((name) => `${path}: ${name}`),
    );

    expect([...new Set(unknown)]).toEqual([]);
  });
});
