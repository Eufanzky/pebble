import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/test/render';
import { expectLogged } from '@/test/activity';
import { setTestPreferences } from '@/test/preferences';
import { taskStore } from '@/test/msw/tasks';
import { testDocument } from '../testing';
import DocumentModal from './DocumentModal';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

beforeEach(() => {
  push.mockClear();
  setTestPreferences({ readingLevel: 5, reduceAnimations: true, calmMode: false });
});

function renderModal(onClose = vi.fn()) {
  return { ...renderWithProviders(<DocumentModal document={testDocument()} onClose={onClose} />), onClose };
}

const simplified = () => screen.getByTestId('simplified-text');
const slider = () => screen.getByRole('slider', { name: 'Complexity (FK)' });

describe('DocumentModal', () => {
  it("opens at the user's reading level, beside the original", () => {
    renderModal();

    expect(screen.getByRole('dialog', { name: 'Clean Architecture' })).toBeInTheDocument();
    expect(slider()).toHaveValue('5');
    expect(simplified()).toHaveTextContent('Fairly simple text.');
    expect(screen.getByText('The original, hard text.')).toBeInTheDocument();
    expect(screen.getByText('Simplified to level 5 (your default).')).toBeInTheDocument();
  });

  describe('reading-level slider', () => {
    it.each([
      ['2', 'Very simple text.', 'Showing level 2. Your default is 5.'],
      ['8', 'Mostly full text.', 'Showing level 8. Your default is 5.'],
      ['10', 'The original, hard text.', 'Showing level 10. Your default is 5.'],
    ])('at %s shows the matching text and says why', (level, text, note) => {
      renderModal();

      fireEvent.change(slider(), { target: { value: level } });

      expect(simplified()).toHaveTextContent(text);
      expect(screen.getByText(note)).toBeInTheDocument();
      expect(slider()).toHaveAttribute('aria-valuetext', `Reading level ${level} of 10`);
    });

    it('logs the change for AdaptLens', async () => {
      renderModal();

      fireEvent.change(slider(), { target: { value: '3' } });

      await expectLogged({ agent: 'AdaptLens', action: 'Reading level adjusted to 3 for "Clean Architecture"' });
    });
  });

  it('shows the reader view with the original folded away', async () => {
    const { user } = renderModal();

    await user.click(screen.getByRole('button', { name: 'reader' }));

    expect(screen.queryByText('The original, hard text.')).not.toBeInTheDocument();
    expect(screen.getByText('Simplified to level 5 (your default). Drag the slider above to adjust.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show original text' }));
    expect(screen.getByText('The original, hard text.')).toBeInTheDocument();
  });

  it('runs the comprehension check', async () => {
    const { user } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Check my understanding' }));
    await user.click(screen.getByRole('button', { name: 'Less effort to build' }));

    expect(screen.getByRole('status')).toHaveTextContent('Exactly!');
  });

  it('turns the document into tasks on Today', async () => {
    const { user, onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Tasks' }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(push).toHaveBeenCalledWith('/today');
    await waitFor(() => expect(taskStore.all()).toHaveLength(2));
  });

  it('closes on Escape and on the close button', async () => {
    const { user, onClose } = renderModal();

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Close document' }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('opens the built-in reader when Immersive Reader is unavailable; Escape closes only the reader', async () => {
    const { user, onClose } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Reader' }));

    const reader = await screen.findByRole('dialog', { name: 'Reader' });
    expect(reader).toHaveTextContent('Fairly simple text.');

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Reader' })).not.toBeInTheDocument());
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Clean Architecture' })).toBeInTheDocument();
  });
});
