import { describe, expect, it } from 'vitest';
import { getPOS } from './partsOfSpeech';

describe('getPOS', () => {
  it.each([['design', 'noun'], ['Build', 'verb'], ['iterative', 'adj'], ['banana', null]])('%s → %s', (word, pos) => {
    expect(getPOS(word)).toBe(pos);
  });
});
