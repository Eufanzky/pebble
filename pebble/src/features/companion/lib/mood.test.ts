import { describe, expect, it } from 'vitest';
import { moodForCompletion } from './mood';

describe('moodForCompletion', () => {
  it.each([[0, 'sleepy'], [1, 'normal'], [49, 'normal'], [50, 'happy'], [99, 'happy'], [100, 'excited']])(
    '%i%% → %s',
    (percent, mood) => {
      expect(moodForCompletion(percent)).toBe(mood);
    },
  );
});
