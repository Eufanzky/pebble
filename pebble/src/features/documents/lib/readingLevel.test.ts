import { describe, expect, it } from 'vitest';
import type { DocumentItem } from '../types';
import { getTextForLevel, levelNote, sliderFill } from './readingLevel';

const doc = {
  original: 'original',
  levels: { 3: 'three', 5: 'five', 8: 'eight' },
} as unknown as DocumentItem;

describe('getTextForLevel', () => {
  it.each([
    [1, 'three'], [3, 'three'], [4, 'five'], [6, 'five'], [7, 'eight'], [9, 'eight'], [10, 'original'],
  ])('level %i shows %s', (level, text) => {
    expect(getTextForLevel(doc, level)).toBe(text);
  });

  it('falls back to the nearest harder text, then the original', () => {
    const sparse = { original: 'original', levels: { 8: 'eight' } } as unknown as DocumentItem;
    expect(getTextForLevel(sparse, 5)).toBe('eight');
    expect(getTextForLevel(sparse, 2)).toBe('original');
    expect(getTextForLevel({ original: 'o', levels: {} } as unknown as DocumentItem, 8)).toBe('o');
  });
});

describe('levelNote', () => {
  it('says when the default level is shown', () => {
    expect(levelNote(5, 5, false)).toBe('Simplified to level 5 (your default).');
    expect(levelNote(5, 5, true)).toBe('Simplified to level 5 (your default). Drag the slider above to adjust.');
  });

  it('names the default when another level is shown', () => {
    expect(levelNote(2, 5, false)).toBe('Showing level 2. Your default is 5.');
    expect(levelNote(2, 5, true)).toBe('Showing level 2. Your default is 5. Update it in Settings to remember.');
  });
});

describe('sliderFill', () => {
  it('runs from empty at 1 to full at 10', () => {
    expect(sliderFill(1)).toBe(0);
    expect(sliderFill(10)).toBeCloseTo(99.9);
  });
});
