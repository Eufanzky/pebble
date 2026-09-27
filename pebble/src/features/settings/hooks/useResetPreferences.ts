'use client';

import { useCallback } from 'react';
import { useToast } from '@/shared/ui/ToastContext';

const RESET_KEYS = ['pebble-preferences', 'pebble-activity'];

/** Resets preferences (and the activity log) after asking; tasks are kept. */
export function useResetPreferences(reload: () => void = () => window.location.reload()) {
  const { showToast } = useToast();

  return useCallback(() => {
    if (!window.confirm('This will reset all settings to default. Your tasks and documents will be kept. Continue?')) return;
    RESET_KEYS.forEach((k) => localStorage.removeItem(k));
    showToast('Preferences reset to defaults');
    reload();
  }, [showToast, reload]);
}
