import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen, waitFor } from '@/test/render';
import { setTestPreferences } from '@/test/preferences';
import { taskStore } from '@/test/msw/tasks';
import { server } from '@/test/msw/server';
import { resting } from '@/test/msw/resting';
import { simplifyHandlers, simplifyStore } from '@/test/msw/simplify';
import { accountStore } from '@/test/msw/account';
import { useActivityLog } from '@/features/activity';
import { testDocument } from '../testing';
import DocumentModal from './DocumentModal';

const push = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

beforeEach(() => {
  push.mockClear();
  setTestPreferences({ readingLevel: 5, reduceAnimations: true, calmMode: false });
});

function renderModal(onClose = vi.fn(), doc = testDocument()) {
  return { ...renderWithProviders(<DocumentModal document={doc} onClose={onClose} />), onClose };
}

const upload = (original = 'The first hard sentence. The second hard sentence.') =>
  testDocument({ source: 'upload', original, levels: {}, extractedTasks: [] });

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

  describe('an upload, simplified by SimplifyCore', () => {
    it('asks SimplifyCore at the reading level, says so while it works, then shows its version', async () => {
      renderModal(vi.fn(), upload());

      expect(screen.getByRole('status')).toHaveTextContent('SimplifyCore is writing this at level 5…');
      expect(await screen.findByTestId('simplified-text')).toHaveTextContent('Level 5: The first hard sentence.');
      expect(simplifyStore.asked()).toEqual([
        { text: 'The first hard sentence. The second hard sentence.', readingLevel: 5 },
      ]);
      expect(screen.getByText('The first hard sentence. The second hard sentence.')).toBeInTheDocument();
    });

    it('asks once per level, and shows the original at level 10 without asking', async () => {
      renderModal(vi.fn(), upload());
      await screen.findByText(/^Level 5:/);

      fireEvent.change(slider(), { target: { value: '2' } });
      expect(await screen.findByText(/^Level 2:/)).toBeInTheDocument();
      fireEvent.change(slider(), { target: { value: '5' } });
      expect(simplified()).toHaveTextContent('Level 5: The first hard sentence.');
      fireEvent.change(slider(), { target: { value: '10' } });
      expect(simplified()).toHaveTextContent('The first hard sentence. The second hard sentence.');

      expect(simplifyStore.asked().map((a) => a.readingLevel)).toEqual([5, 2]);
    });

    it('says so gently when SimplifyCore can\'t answer, and tries again when asked', async () => {
      server.use(simplifyHandlers.status(503));
      const { user } = renderModal(vi.fn(), upload());

      expect(await screen.findByText("SimplifyCore couldn't simplify this just now. The original is still here.")).toBeInTheDocument();
      server.use(simplifyHandlers.reply());
      await user.click(screen.getByRole('button', { name: 'Try again' }));

      expect(await screen.findByText(/^Level 5:/)).toBeInTheDocument();
    });

    it.each(['limit', 'provider'] as const)('says Pebble is resting when the agents are (%s, 10.4)', async (kind) => {
      server.use(resting('/api/agents/simplify', kind));
      const { user } = renderModal(vi.fn(), upload());

      expect(
        await screen.findByText('Pebble is resting for a moment. Try again in a little while. The original is still here.'),
      ).toBeInTheDocument();
      server.use(simplifyHandlers.reply());
      await user.click(screen.getByRole('button', { name: 'Try again' }));

      expect(await screen.findByText(/^Level 5:/)).toBeInTheDocument();
    });

    it('adds the action items SimplifyCore found, and not before', async () => {
      const { user } = renderModal(vi.fn(), upload());
      expect(screen.getByRole('button', { name: 'Tasks' })).toBeDisabled();

      await screen.findByText(/^Level 5:/);
      await user.click(screen.getByRole('button', { name: 'Tasks' }));

      await waitFor(() => expect(taskStore.all().map((t) => t.title)).toEqual(['Read the first part']));
    });

    it('says when only the first part of a long upload was simplified', async () => {
      const long = Array.from({ length: 400 }, (_, i) => `Sentence number ${i} is here.`).join(' ');
      renderModal(vi.fn(), upload(long));

      expect(await screen.findByText('This is the first part of the document, simplified. The rest is in the original.')).toBeInTheDocument();
      expect(simplifyStore.asked()[0].text.length).toBeLessThanOrEqual(6000);
      expect(simplifyStore.asked()[0].text).toMatch(/\.$/);
    });

    it('reloads the activity log afterwards, to show what the backend logged', async () => {
      function LatestLog() {
        const { entries, isLoading } = useActivityLog();
        return <p data-testid="latest-log" data-loaded={!isLoading}>{entries[0]?.action}</p>;
      }
      accountStore.setActivity([]);
      renderWithProviders(
        <>
          <DocumentModal document={upload()} onClose={vi.fn()} />
          <LatestLog />
        </>,
      );
      // After the first load, so only a reload can show the new entry
      await waitFor(() => expect(screen.getByTestId('latest-log')).toHaveAttribute('data-loaded', 'true'));
      accountStore.setActivity([
        {
          agent: 'SimplifyCore',
          action: 'Simplified "The first hard sentence." to reading level 5',
          reasoning: 'Kept the main point.',
          safetyStatus: 'passed',
          timestamp: new Date().toISOString(),
        },
      ]);

      await screen.findByText(/^Level 5:/);

      await waitFor(() =>
        expect(screen.getByTestId('latest-log')).toHaveTextContent('Simplified "The first hard sentence." to reading level 5'),
      );
    });

    it('says when SimplifyCore\'s version may not match the original', async () => {
      server.use(simplifyHandlers.reply({ groundedness: { grounded: false, ungroundedPercentage: 40 } }));
      renderModal(vi.fn(), upload());

      expect(await screen.findByText(/may say things the original doesn.t/)).toBeInTheDocument();
    });
  });
});
