import { describe, expect, it } from 'vitest';
import manifest from './manifest';

describe('manifest', () => {
  it('describes Pebble as a standalone app that opens on Today, in the app colours', () => {
    const m = manifest();

    expect(m).toMatchObject({
      name: 'Pebble',
      short_name: 'Pebble',
      start_url: '/today',
      display: 'standalone',
      background_color: '#0F0D0A',
      theme_color: '#0F0D0A',
    });
  });

  it('has the icon sizes browsers need, including a maskable one', () => {
    const icons = manifest().icons ?? [];

    expect(icons.map((i) => [i.sizes, i.purpose])).toEqual([
      ['192x192', 'any'],
      ['512x512', 'any'],
      ['512x512', 'maskable'],
    ]);
    // Icon paths have a dot, so src/proxy.ts serves them without sign-in
    for (const icon of icons) expect(icon.src).toMatch(/^\/icons\/[\w-]+\.png$/);
  });
});
