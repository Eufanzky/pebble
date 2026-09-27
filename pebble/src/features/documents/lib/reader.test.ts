import { describe, expect, it } from 'vitest';
import { displayText, focusPosition, stepFontSize, wordCount } from './reader';
import { simulateTranslation } from './translation';

describe('simulateTranslation', () => {
  it('swaps known words and keeps the rest', () => {
    expect(simulateTranslation('The design is good', 'Spanish')).toBe('El diseño es bueno');
    expect(simulateTranslation('zzz design', 'French')).toBe('zzz conception');
  });

  it('leaves English and unknown languages alone', () => {
    expect(simulateTranslation('The design', 'English')).toBe('The design');
    expect(simulateTranslation('The design', 'Klingon')).toBe('The design');
  });
});

describe('displayText', () => {
  it('translates, then splits syllables', () => {
    expect(displayText('the prototype', 'English', true)).toBe('the pro·to·ty·pe');
    expect(displayText('the prototype', 'Portuguese', false)).toBe('o protótipo');
  });
});

describe('stepFontSize', () => {
  it('steps by 2 px within 12–32', () => {
    expect(stepFontSize(18, 1)).toBe(20);
    expect(stepFontSize(18, -1)).toBe(16);
    expect(stepFontSize(12, -1)).toBe(12);
    expect(stepFontSize(32, 1)).toBe(32);
  });
});

describe('focusPosition', () => {
  it('maps the pointer to a percentage, 5% from the edges', () => {
    expect(focusPosition(150, 100, 200)).toBe(25);
    expect(focusPosition(100, 100, 200)).toBe(5);
    expect(focusPosition(310, 100, 200)).toBe(95);
  });
});

describe('wordCount', () => {
  it('counts words', () => {
    expect(wordCount('one two  three')).toBe(3);
  });
});
