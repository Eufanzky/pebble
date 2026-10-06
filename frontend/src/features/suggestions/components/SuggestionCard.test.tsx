import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { server } from '@/test/msw/server';
import { accountStore } from '@/test/msw/account';
import { suggestionStore } from '@/test/msw/suggestions';
import { setTestPreferences } from '@/test/preferences';
import { usePreferences } from '@/shared/preferences';
import SuggestionCard from './SuggestionCard';

const READING_LEVEL = {
  key: 'reading_level:3',
  preference: 'readingLevel',
  value: 3,
  reason: 'You picked level 3 for 4 of your last 5 documents. Your default is 5.',
};

function Level() {
  const { preferences } = usePreferences();
  return <p data-testid="level">{preferences.readingLevel}</p>;
}

function renderCard() {
  return renderWithProviders(
    <>
      <SuggestionCard />
      <Level />
    </>,
  );
}

describe('SuggestionCard', () => {
  it('shows nothing when AdaptLens has no suggestion', async () => {
    renderCard();

    await waitFor(() => expect(screen.getByTestId('level')).toHaveTextContent('5'));
    expect(screen.queryByRole('region', { name: 'A suggestion from AdaptLens' })).not.toBeInTheDocument();
  });

  it('says what AdaptLens noticed, and changes nothing by itself', async () => {
    setTestPreferences({ readingLevel: 5 });
    suggestionStore.offer(READING_LEVEL);
    renderCard();

    expect(await screen.findByRole('region', { name: 'A suggestion from AdaptLens' })).toHaveTextContent(READING_LEVEL.reason);
    expect(screen.getByText('Make level 3 your default?')).toBeInTheDocument();
    expect(screen.getByTestId('level')).toHaveTextContent('5');
    expect(accountStore.preferences().readingLevel).toBe(5);
  });

  it('applies it only when accepted', async () => {
    setTestPreferences({ readingLevel: 5 });
    suggestionStore.offer(READING_LEVEL);
    const { user } = renderCard();

    await user.click(await screen.findByRole('button', { name: 'Use level 3' }));

    expect(suggestionStore.answers()).toEqual([{ key: 'reading_level:3', answer: 'accept' }]);
    await waitFor(() => expect(screen.getByTestId('level')).toHaveTextContent('3'));
    expect(accountStore.preferences().readingLevel).toBe(3);
    expect(screen.queryByRole('region', { name: 'A suggestion from AdaptLens' })).not.toBeInTheDocument();
  });

  it('goes away on "Not now", and changes nothing', async () => {
    setTestPreferences({ readingLevel: 5 });
    suggestionStore.offer(READING_LEVEL);
    const { user } = renderCard();

    await user.click(await screen.findByRole('button', { name: 'Not now' }));

    expect(screen.queryByRole('region', { name: 'A suggestion from AdaptLens' })).not.toBeInTheDocument();
    await waitFor(() => expect(suggestionStore.answers()).toEqual([{ key: 'reading_level:3', answer: 'dismiss' }]));
    expect(screen.getByTestId('level')).toHaveTextContent('5');
  });

  it('says so gently when accepting doesn\'t go through, and changes nothing', async () => {
    setTestPreferences({ readingLevel: 5 });
    suggestionStore.offer(READING_LEVEL);
    server.use(http.post('/api/suggestions/accept', () => HttpResponse.json({ detail: 'Changed.' }, { status: 409 })));
    const { user } = renderCard();

    await user.click(await screen.findByRole('button', { name: 'Use level 3' }));

    expect(await screen.findByText("That didn't go through. Nothing was changed.")).toBeInTheDocument();
    expect(screen.getByTestId('level')).toHaveTextContent('5');
  });

  it('asks about larger steps', async () => {
    suggestionStore.offer({ key: 'step_size:large', preference: 'stepSize', value: 'large', reason: 'You skipped most steps.' });
    renderCard();

    expect(await screen.findByText('Use large steps from now on?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Use large steps' })).toBeInTheDocument();
  });
});
