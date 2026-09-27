import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders, renderWithProviders, screen, waitFor, within } from '@/test/render';
import { usePreferences } from '@/contexts/PreferencesContext';
import { readerHandlers } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import ImmersiveReader from './ImmersiveReader';

const launchAsync = vi.fn();
vi.mock('@microsoft/immersive-reader-sdk', () => ({ launchAsync: (...args: unknown[]) => launchAsync(...args) }));

beforeEach(() => {
  launchAsync.mockReset();
  const { result, unmount } = renderHookWithProviders(() => usePreferences());
  act(() => result.current.setPreferences((prev) => ({ ...prev, calmMode: false, reduceAnimations: true })));
  unmount();
});

async function openBuiltIn(text = 'The design is good') {
  const onClose = vi.fn();
  const view = renderWithProviders(<ImmersiveReader text={text} title="Doc" onClose={onClose} />);
  const reader = await screen.findByRole('dialog', { name: 'Reader' });
  return { ...view, onClose, reader, text: () => within(reader).getByTestId('reader-text') };
}

describe('ImmersiveReader', () => {
  it('shows a loading message, then the built-in reader when Immersive Reader is not configured', async () => {
    renderWithProviders(<ImmersiveReader text="Hello there" onClose={vi.fn()} />);

    expect(screen.getByRole('status')).toHaveTextContent('Launching Azure Immersive Reader...');
    expect(await screen.findByRole('dialog', { name: 'Reader' })).toHaveTextContent('Hello there');
    expect(launchAsync).not.toHaveBeenCalled();
  });

  it('falls back to the built-in reader when the backend is down', async () => {
    server.use(readerHandlers.unavailable());

    const { text } = await openBuiltIn();

    expect(text()).toHaveTextContent('The design is good');
  });

  it('draws nothing itself when Azure Immersive Reader launches', async () => {
    server.use(readerHandlers.token());
    launchAsync.mockResolvedValue({});

    renderWithProviders(<ImmersiveReader text="Hello" onClose={vi.fn()} />);

    await waitFor(() => expect(launchAsync).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('built-in reader', () => {
    it('splits words into syllables', async () => {
      const { user, text } = await openBuiltIn('the prototype');

      await user.click(screen.getByRole('button', { name: 'Syllables' }));

      expect(text()).toHaveTextContent('the pro·to·ty·pe');
      expect(screen.getByRole('button', { name: 'Syllables' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('marks parts of speech and shows a legend', async () => {
      const { user, text } = await openBuiltIn();

      await user.click(screen.getByRole('button', { name: 'Parts of Speech' }));

      expect(screen.getByText('Nouns')).toBeInTheDocument();
      expect(within(text()).getByText('design')).toHaveAttribute('data-pos', 'noun');
      expect(within(text()).getByText('good')).toHaveAttribute('data-pos', 'adj');
    });

    it('translates the text', async () => {
      const { user, text } = await openBuiltIn();

      await user.click(screen.getByRole('button', { name: /Translate/ }));
      await user.click(screen.getByRole('button', { name: /Spanish/ }));

      expect(text()).toHaveTextContent('El diseño es bueno');
      expect(screen.getByText(/Translated to Spanish/)).toBeInTheDocument();
    });

    it('changes the text size within limits', async () => {
      const { user } = await openBuiltIn();

      await user.click(screen.getByRole('button', { name: 'Bigger text' }));
      expect(screen.getByText('20px')).toBeInTheDocument();

      for (let i = 0; i < 6; i++) await user.click(screen.getByRole('button', { name: 'Smaller text' }));
      expect(screen.getByText('12px')).toBeInTheDocument();
    });

    it('turns line focus on', async () => {
      const { user, reader } = await openBuiltIn();

      await user.click(screen.getByRole('button', { name: 'Line Focus' }));

      expect(screen.getByRole('button', { name: 'Line Focus' })).toHaveAttribute('aria-pressed', 'true');
      expect(reader.querySelector('[aria-hidden="true"][style*="linear-gradient"]')).not.toBeNull();
    });

    it('hides flags in calm mode', async () => {
      const { result, unmount } = renderHookWithProviders(() => usePreferences());
      act(() => result.current.setPreferences((prev) => ({ ...prev, calmMode: true })));
      unmount();
      const { user } = await openBuiltIn();

      await user.click(screen.getByRole('button', { name: 'Translate' }));

      expect(screen.getByRole('button', { name: 'English' })).toBeInTheDocument();
    });

    it('closes with Exit Reader and with Escape', async () => {
      const { user, onClose } = await openBuiltIn();

      await user.click(screen.getByRole('button', { name: 'Exit Reader' }));
      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(2);
    });
  });
});
