import { describe, expect, it } from 'vitest';
import { settingsGreeting } from './greeting';

describe('settingsGreeting', () => {
  it.each([['gentle', 'Make this space yours'], ['playful', "Let's make this purr-fect!"], ['calm', 'Your settings.']] as const)(
    '%s → %s',
    (personality, text) => {
      expect(settingsGreeting(personality)).toBe(text);
    },
  );
});
