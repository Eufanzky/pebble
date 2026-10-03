'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { postJson } from '@/shared/lib/api';
import { forgetLocalData, IMPORT_MARK, importUnderWay, isEmpty, readLocalData } from './importLocalData';

/**
 * Once, after sign-in: moves the tasks, preferences and activity log this
 * browser kept before accounts existed into the account (`POST /api/import`),
 * then forgets the browser's copy. If the import fails, the copy stays and the
 * next visit tries again.
 */
export function useImportLocalData() {
  const client = useQueryClient();

  useEffect(() => {
    let storage: Storage;
    try {
      storage = window.localStorage;
    } catch {
      return;
    }
    const { body, found } = readLocalData(storage);
    if (!found || importUnderWay(storage)) return;
    if (isEmpty(body)) {
      forgetLocalData(storage);
      return;
    }
    storage.setItem(IMPORT_MARK, String(Date.now()));
    postJson('/api/import', body)
      .then(async () => {
        forgetLocalData(storage);
        // A first load still under way began before the import: drop it, or the
        // reload would reuse it and miss what was just imported
        await client.cancelQueries();
        await client.invalidateQueries();
      })
      .catch(() => storage.removeItem(IMPORT_MARK));
  }, [client]);
}
