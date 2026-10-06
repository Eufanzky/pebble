'use client';

import { PebbleFace } from '@/features/companion';
import { Button, Card } from '@/shared/ui';
import { useSuggestion } from '../hooks/useSuggestion';
import type { Suggestion } from '../api/suggestions';
import './SuggestionCard.css';

function question(suggestion: Suggestion): { ask: string; yes: string } {
  if (suggestion.preference === 'readingLevel') {
    return { ask: `Make level ${suggestion.value} your default?`, yes: `Use level ${suggestion.value}` };
  }
  return { ask: `Use ${suggestion.value} steps from now on?`, yes: `Use ${suggestion.value} steps` };
}

/** AdaptLens's one suggestion, if it has one: what it noticed, and a choice. Nothing changes without a yes. */
export default function SuggestionCard() {
  const { suggestion, failed, accept, dismiss } = useSuggestion();
  if (!suggestion) return null;
  const { ask, yes } = question(suggestion);

  return (
    <Card as="section" className="suggestion" aria-label="A suggestion from AdaptLens">
      <div className="suggestion__head">
        <PebbleFace size={22} />
        <p className="suggestion__by">AdaptLens noticed something</p>
      </div>
      <p className="suggestion__reason">{suggestion.reason}</p>
      <p className="suggestion__ask">{ask}</p>
      {failed && (
        <p className="suggestion__note" role="status">
          That didn&apos;t go through. Nothing was changed.
        </p>
      )}
      <div className="suggestion__actions">
        <Button variant="primary" size="sm" onClick={accept}>
          {yes}
        </Button>
        <Button variant="ghost" size="sm" onClick={dismiss}>
          Not now
        </Button>
      </div>
    </Card>
  );
}
