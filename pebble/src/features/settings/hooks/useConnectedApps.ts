'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useActivityLog } from '@/features/activity';
import { useTasks } from '@/features/tasks';
import { useToast } from '@/shared/ui/ToastContext';
import { SYNC_TASKS, connectedApps } from '../data/options';

export const SYNC_MS = 1500;

/**
 * The connected-apps toggles. Connecting is simulated: after a short wait it
 * adds canned tasks (A-020 in specs/audit.md).
 */
export function useConnectedApps() {
  const { addTask } = useTasks();
  const { addEntry } = useActivityLog();
  const { showToast } = useToast();
  const [connected, setConnected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(connectedApps.map((app) => [app.name, app.defaultOn])),
  );
  const [syncing, setSyncing] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const toggle = useCallback(
    (name: string) => {
      const next = !connected[name];
      setConnected((prev) => ({ ...prev, [name]: next }));

      if (!next) {
        setSyncing(null);
        showToast(`${name} disconnected`);
        addEntry('BridgeBot', `${name} disconnected`, `User removed ${name} integration.`);
        return;
      }

      setSyncing(name);
      addEntry('BridgeBot', `Connecting to ${name}...`, `Authenticating via Azure API Management OAuth flow.`);
      timer.current = setTimeout(() => {
        const tasks = SYNC_TASKS[name] || [];
        tasks.forEach((t) => addTask({ title: t.title, timeEstimate: t.time, tag: t.tag, priority: 'medium', completed: false }));
        setSyncing(null);
        showToast(`${name} synced — ${tasks.length} item${tasks.length !== 1 ? 's' : ''} imported`);
        addEntry('BridgeBot', `${name} connected — synced ${tasks.length} items`, `Imported ${tasks.length} tasks via ${name} API integration.`);
      }, SYNC_MS);
    },
    [connected, addTask, addEntry, showToast],
  );

  return { connected, syncing, toggle };
}
