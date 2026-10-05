import { describe, expect, it } from 'vitest';
import { excerptForSimplifying } from './simplify';

describe('excerptForSimplifying', () => {
  it('keeps a short text whole', () => {
    expect(excerptForSimplifying('  Short text.  ', 100)).toEqual({ text: 'Short text.', partial: false });
  });

  it('cuts a long text at the last paragraph break before the limit', () => {
    const text = `${'a'.repeat(60)}\n\n${'b'.repeat(30)}\n\n${'c'.repeat(50)}`;

    expect(excerptForSimplifying(text, 100)).toEqual({ text: `${'a'.repeat(60)}\n\n${'b'.repeat(30)}`, partial: true });
  });

  it('cuts at the last sentence when there is no paragraph break late enough', () => {
    const text = `${'One sentence here. '.repeat(10)}`;

    const { text: cut, partial } = excerptForSimplifying(text, 100);

    expect(partial).toBe(true);
    expect(cut.endsWith('here.')).toBe(true);
    expect(cut.length).toBeLessThanOrEqual(100);
  });

  it('cuts at the limit when there is no break at all', () => {
    expect(excerptForSimplifying('x'.repeat(150), 100)).toEqual({ text: 'x'.repeat(100), partial: true });
  });
});
