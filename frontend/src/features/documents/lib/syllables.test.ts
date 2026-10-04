import { describe, expect, it } from 'vitest';
import { applySyllables, breakIntoSyllables } from './syllables';

describe('breakIntoSyllables', () => {
  // A naive rule, pinned as it is: it splits after every vowel that has a
  // consonant and at least one more letter after it.
  it('splits after a vowel followed by a consonant', () => {
    expect(breakIntoSyllables('prototype')).toBe('pro·to·ty·pe');
    expect(breakIntoSyllables('Design')).toBe('De·si·gn');
  });

  it('leaves short words and single syllables alone', () => {
    expect(breakIntoSyllables('app')).toBe('app');
    expect(breakIntoSyllables('trees')).toBe('trees');
  });
});

describe('applySyllables', () => {
  it('only touches words of four letters or more', () => {
    expect(applySyllables('the prototype is done')).toBe('the pro·to·ty·pe is do·ne');
  });
});
