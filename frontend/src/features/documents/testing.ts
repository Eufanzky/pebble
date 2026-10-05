import type { DocumentItem } from './types';

/** A small document with a text per level and a comprehension question. */
export function testDocument(overrides: Partial<DocumentItem> = {}): DocumentItem {
  return {
    id: 'doc-test',
    source: 'example',
    title: 'Clean Architecture',
    type: 'technical',
    tags: ['Reading'],
    original: 'The original, hard text.',
    levels: { 3: 'Very simple text.', 5: 'Fairly simple text.', 8: 'Mostly full text.' },
    extractedTasks: [
      { title: 'Read chapter 1', timeEstimate: '~20 min', tag: 'study' },
      { title: 'Summarise the goal', timeEstimate: '~10 min', tag: 'study' },
    ],
    comprehensionQuestion: {
      question: 'What is the goal?',
      correctAnswer: 'Less effort to build',
      wrongAnswer: 'Newest frameworks',
      pebbleCorrect: 'Exactly!',
      pebbleWrong: 'Not quite. Want me to simplify that section?',
    },
    ...overrides,
  };
}
