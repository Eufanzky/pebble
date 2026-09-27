import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders } from '@/test/render';
import { useActivityLog } from '@/features/activity';
import { testDocument } from '../testing';
import { useComprehensionCheck } from './useComprehensionCheck';

const { comprehensionQuestion: question } = testDocument();

function renderCheck() {
  return renderHookWithProviders(() => ({ ...useComprehensionCheck(question, 'Doc'), log: useActivityLog() }));
}

afterEach(() => vi.restoreAllMocks());

describe('useComprehensionCheck', () => {
  it('shuffles the two choices', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    expect(renderCheck().result.current.options).toEqual([question.correctAnswer, question.wrongAnswer]);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    expect(renderCheck().result.current.options).toEqual([question.wrongAnswer, question.correctAnswer]);
  });

  it('praises a correct answer and logs it', () => {
    const { result } = renderCheck();

    act(() => result.current.answer(question.correctAnswer));

    expect(result.current).toMatchObject({ answered: 'correct', feedback: 'Exactly!' });
    expect(result.current.log.entries[0]).toMatchObject({ action: 'Comprehension check passed for "Doc"' });
  });

  it('offers to simplify after a wrong answer, and keeps the first answer', () => {
    const { result } = renderCheck();
    const before = result.current.log.entries.length;

    act(() => result.current.answer(question.wrongAnswer));
    act(() => result.current.answer(question.correctAnswer));

    expect(result.current).toMatchObject({ answered: 'wrong', feedback: question.pebbleWrong });
    expect(result.current.log.entries).toHaveLength(before + 1);
    expect(result.current.log.entries[0].action).toBe('Comprehension check for "Doc" — offered to simplify further');
  });

  it('has no feedback before an answer', () => {
    expect(renderCheck().result.current.feedback).toBeNull();
  });
});
