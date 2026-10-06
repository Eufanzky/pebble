'use client';

import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useActivityLog } from '@/features/activity';
import { usePreferences } from '@/shared/preferences';
import { acceptSuggestion, dismissSuggestion, getSuggestion, type Suggestion } from '../api/suggestions';

const SUGGESTION_KEY = ['suggestion'] as const;

/**
 * AdaptLens's suggestion (7.6). It's asked for whenever a screen that shows it opens, since what the user did
 * elsewhere may have changed it. Nothing changes until the user accepts; "Not now" hides it for 14 days.
 */
export function useSuggestion() {
  const client = useQueryClient();
  const { adopt } = usePreferences();
  const { refresh: refreshLog } = useActivityLog();
  const query = useQuery({ queryKey: SUGGESTION_KEY, queryFn: getSuggestion, refetchOnMount: 'always' });
  const [failed, setFailed] = useState(false);

  const hide = useCallback(() => client.setQueryData<Suggestion | null>(SUGGESTION_KEY, null), [client]);

  const accept = useCallback(async () => {
    const suggestion = query.data;
    if (!suggestion) return;
    setFailed(false);
    try {
      adopt(await acceptSuggestion(suggestion.key));
      hide();
      // The backend logged it as AdaptLens
      refreshLog();
    } catch {
      setFailed(true);
      void client.invalidateQueries({ queryKey: SUGGESTION_KEY });
    }
  }, [query.data, adopt, hide, refreshLog, client]);

  const dismiss = useCallback(() => {
    const suggestion = query.data;
    if (!suggestion) return;
    hide();
    void dismissSuggestion(suggestion.key).catch(() => undefined);
  }, [query.data, hide]);

  return { suggestion: query.data ?? null, failed, accept, dismiss };
}
