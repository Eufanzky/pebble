'use client';

import { useCallback } from 'react';
import { defaultPreferences, usePreferences } from '@/shared/preferences';
import { useToast } from '@/shared/ui/ToastContext';

/** Puts the preferences back to their defaults, after asking. Tasks and the activity log are kept. */
export function useResetPreferences() {
  const { showToast } = useToast();
  const { setPreferences } = usePreferences();

  return useCallback(() => {
    if (!window.confirm('This will reset all settings to default. Your tasks and documents will be kept. Continue?')) return;
    setPreferences(defaultPreferences);
    showToast('Preferences reset to defaults');
  }, [showToast, setPreferences]);
}
