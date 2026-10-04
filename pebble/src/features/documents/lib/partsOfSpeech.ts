// A small dictionary, enough to highlight the sample documents.
const NOUNS = new Set([
  'course', 'design', 'prototype', 'research', 'report', 'feedback', 'solution', 'app',
  'student', 'team', 'project', 'week', 'time', 'process', 'data', 'user', 'tool',
  'system', 'document', 'task', 'class', 'assignment', 'presentation', 'section',
  'requirement', 'architecture', 'service', 'safety', 'decision', 'experience',
  'people', 'method', 'idea', 'version', 'text', 'level', 'language', 'reading',
  'pattern', 'agent', 'model', 'content', 'output', 'input', 'response', 'question',
  'answer', 'meeting', 'note', 'work', 'session', 'break', 'goal', 'step', 'feature',
  'calendar', 'message', 'chapter', 'book', 'information', 'result', 'analysis',
  'person', 'interview', 'cycle', 'insight', 'deliverable', 'documentation',
  'blocker', 'animation', 'component', 'sidebar', 'navigation', 'character',
  'bubble', 'particle', 'screen', 'card', 'button', 'state', 'library',
]);

const VERBS = new Set([
  'build', 'create', 'demonstrate', 'implement', 'simplify', 'focus', 'read',
  'write', 'start', 'finish', 'use', 'make', 'help', 'work', 'show', 'find',
  'need', 'want', 'think', 'know', 'take', 'give', 'run', 'check', 'add',
  'get', 'set', 'let', 'try', 'keep', 'turn', 'talk', 'ask', 'tell', 'look',
  'provide', 'include', 'require', 'support', 'explain', 'engage', 'assess',
  'produce', 'address', 'articulate', 'synthesize', 'incorporate', 'consider',
  'leverage', 'apply', 'complete', 'submit', 'review', 'draft', 'fix',
  'improve', 'analyze', 'generate', 'detect', 'validate', 'filter', 'ensure',
]);

const ADJECTIVES = new Set([
  'iterative', 'functional', 'safe', 'clear', 'important', 'simple',
  'good', 'new', 'big', 'small', 'long', 'short', 'high', 'low',
  'main', 'key', 'final', 'real', 'full', 'major', 'quick', 'rough',
  'responsible', 'comprehensive', 'accessible', 'cognitive', 'actionable',
  'qualitative', 'structured', 'empathetic', 'mid-fidelity', 'enterprise-grade',
  'production-ready', 'multi-agent', 'human-centered', 'constrained',
]);

export type POS = 'noun' | 'verb' | 'adj';

/** The part of speech, for the words the reader knows. */
export function getPOS(word: string): POS | null {
  const lower = word.toLowerCase();
  if (NOUNS.has(lower)) return 'noun';
  if (VERBS.has(lower)) return 'verb';
  if (ADJECTIVES.has(lower)) return 'adj';
  return null;
}

export const POS_COLORS: Record<POS, string> = {
  noun: 'var(--color-accent)',
  verb: 'var(--color-tag-wellbeing)',
  adj: 'var(--color-tag-communication)',
};

export const POS_LABELS: Record<POS, string> = {
  noun: 'Nouns',
  verb: 'Verbs',
  adj: 'Adjectives',
};
