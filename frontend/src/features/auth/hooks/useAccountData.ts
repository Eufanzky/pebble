'use client';

import { useCallback, useState } from 'react';
import { signOut } from 'next-auth/react';
import { deleteRequest, getJson } from '@/shared/lib/api';
import { saveFile } from '@/shared/lib/download';

export const DELETE_CONFIRM =
  'This deletes your tasks, settings and activity log for good. It can’t be undone. Delete your account?';
export const EXPORT_FAILED = "Pebble couldn't get your data just now. Try again in a little while.";
export const DELETE_FAILED = "Pebble couldn't delete your account just now. Nothing was removed. Try again in a little while.";

/** Saves `data` as a JSON file named `filename` (the browser's download). */
function saveJson(data: unknown, filename: string) {
  saveFile(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), filename);
}

/** Download everything the account holds, or delete the account and sign out. */
export function useAccountData(now: () => Date = () => new Date()) {
  const [busy, setBusy] = useState<'export' | 'delete' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async () => {
    setBusy('export');
    setError(null);
    try {
      const data = await getJson<unknown>('/api/account/export');
      saveJson(data, `pebble-data-${now().toISOString().slice(0, 10)}.json`);
    } catch {
      setError(EXPORT_FAILED);
    } finally {
      setBusy(null);
    }
  }, [now]);

  const deleteAccount = useCallback(async () => {
    if (!window.confirm(DELETE_CONFIRM)) return;
    setBusy('delete');
    setError(null);
    try {
      await deleteRequest('/api/account');
    } catch {
      setError(DELETE_FAILED);
      setBusy(null);
      return;
    }
    await signOut({ redirectTo: '/signin' });
  }, []);

  return { busy, error, download, deleteAccount };
}
