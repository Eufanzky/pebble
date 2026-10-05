import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderLoadedHook } from '@/test/render';
import { useActivityLog } from '@/features/activity';
import { testDocument } from '../testing';
import { useComprehensionCheck } from './useComprehensionCheck';

const { comprehensionQuestion: question } = testDocument();

function renderCheck() {
  return renderLoadedHook(() => ({ ...useComprehensionCheck(question), log: useActivityLog() }));
}

afterEach(() => vi.restoreAllMocks());

describe('useComprehensionCheck', () => {
  it('shuffles the two choices', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    expect((await renderCheck()).result.current.options).toEqual([question.correctAnswer, question.wrongAnswer]);

    vi.spyOn(Math, 'random').mockReturnValue(0.1);
    expect((await renderCheck()).result.current.options).toEqual([question.wrongAnswer, question.correctAnswer]);
  });

  it('praises a correct answer, and logs nothing in an agent\'s name', async () => {
    const { result } = await renderCheck();

    act(() => result.current.answer(question.correctAnswer));

    expect(result.current).toMatchObject({ answered: 'correct', feedback: 'Exactly!' });
    expect(result.current.log.entries).toEqual([]);
  });

  it('offers to simplify after a wrong answer, and keeps the first answer', async () => {
    const { result } = await renderCheck();
    act(() => result.current.answer(question.wrongAnswer));
    act(() => result.current.answer(question.correctAnswer));

    expect(result.current).toMatchObject({ answered: 'wrong', feedback: question.pebbleWrong });
  });

  it('has no feedback before an answer', async () => {
    expect((await renderCheck()).result.current.feedback).toBeNull();
  });
});
