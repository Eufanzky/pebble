'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/ui/ToastContext';
import { useTasks } from '@/features/tasks';
import type { DocumentItem, ExtractedTask } from '../types';

/** Turning a document's action items into tasks on Today, one by one or as a study plan. */
export function useDocumentActions(doc: DocumentItem, tasks: ExtractedTask[], why: string, onDone: () => void) {
  const router = useRouter();
  const { addTaskFromDocument, deleteTask } = useTasks();
  const { showToast } = useToast();
  const kind = doc.type === 'meeting' ? 'meeting' : 'academic';
  const count = tasks.length;

  /** Says what was added, with an undo that takes those tasks off Today again (7.5), then goes to Today. */
  const finish = useCallback(
    (toast: string, added: (string | undefined)[]) => {
      const ids = added.filter((id): id is string => id !== undefined);
      showToast(toast, ids.length > 0 ? { label: 'Undo', onAction: () => ids.forEach(deleteTask) } : undefined);
      onDone();
      router.push('/today');
    },
    [showToast, deleteTask, onDone, router],
  );

  const turnIntoTasks = useCallback(() => {
    const added = tasks.map((t) => addTaskFromDocument(t.title, kind, why));
    finish(`Added ${count} tasks from ${doc.title}`, added);
  }, [doc, tasks, why, kind, count, addTaskFromDocument, finish]);

  const makeStudyPlan = useCallback(() => {
    const added = tasks.map((t, i) => addTaskFromDocument(`Day ${i + 1}: ${t.title}`, kind, why));
    finish(`Created a study plan from ${doc.title}`, added);
  }, [doc, tasks, why, kind, addTaskFromDocument, finish]);

  return { turnIntoTasks, makeStudyPlan };
}
