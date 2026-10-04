import { describe, expect, it } from 'vitest';
import { tagLabel } from './tags';

describe('tagLabel', () => {
  it('shows the emoji normally and hides it in calm mode', () => {
    expect(tagLabel('study', false)).toBe('📚 Study');
    expect(tagLabel('communication', true)).toBe('Comms');
  });
});
