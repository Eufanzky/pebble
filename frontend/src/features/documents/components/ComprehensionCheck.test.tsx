import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { testDocument } from '../testing';
import ComprehensionCheck from './ComprehensionCheck';

const { comprehensionQuestion: question } = testDocument();

describe('ComprehensionCheck', () => {
  it('asks the question with both answers', () => {
    renderWithProviders(<ComprehensionCheck question={question} />);

    expect(screen.getByText('What is the goal?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: question.correctAnswer })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: question.wrongAnswer })).toBeInTheDocument();
  });

  it("shows Pebble's reply to a correct answer", async () => {
    const { user } = renderWithProviders(<ComprehensionCheck question={question} />);

    await user.click(screen.getByRole('button', { name: question.correctAnswer }));

    expect(screen.getByRole('status')).toHaveTextContent('Exactly!');
  });

  it('offers to simplify after a wrong answer, and ignores a second click', async () => {
    const { user } = renderWithProviders(<ComprehensionCheck question={question} />);

    await user.click(screen.getByRole('button', { name: question.wrongAnswer }));
    await user.click(screen.getByRole('button', { name: question.correctAnswer }));

    expect(screen.getByRole('status')).toHaveTextContent('Want me to simplify that section?');
    expect(screen.getByRole('button', { name: question.correctAnswer })).toHaveAttribute('aria-disabled', 'true');
  });
});
