import { describe, expect, it } from 'vitest';
import { isDistressInput } from './distress';

describe('isDistressInput', () => {
  it.each([
    "I can't do this anymore",
    'I’m overwhelmed', // curly apostrophe
    'this is TOO MUCH',
    'honestly I give up',
    'I want to quit',
  ])('catches %j', (text) => {
    expect(isDistressInput(text)).toBe(true);
  });

  it.each(['Write the essay intro', 'Email the professor', ''])('lets %j through as a task', (text) => {
    expect(isDistressInput(text)).toBe(false);
  });
});
