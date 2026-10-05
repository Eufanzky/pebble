'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/shared/ui/ToastContext';
import { useTasks } from '@/features/tasks';
import type { DocumentItem, ExtractedTask } from '../types';

/** Turning a document's action items into tasks on Today, one by one or as a study plan. */
export function useDocumentActions(doc: DocumentItem, tasks: ExtractedTask[], onDone: () => void) {
  const router = useRouter();
  const { addTaskFromDocument } = useTasks();
  const { showToast } = useToast();
  const kind = doc.type === 'meeting' ? 'meeting' : 'academic';
  const count = tasks.length;

  const finish = useCallback(
    (toast: string) => {
      showToast(toast);
      onDone();
      router.push('/today');
    },
    [showToast, onDone, router],
  );

  const turnIntoTasks = useCallback(() => {
    tasks.forEach((t) => addTaskFromDocument(t.title, doc.title, kind));
    finish(`Added ${count} tasks from ${doc.title}`);
  }, [doc, tasks, kind, count, addTaskFromDocument, finish]);

  const makeStudyPlan = useCallback(() => {
    tasks.forEach((t, i) => addTaskFromDocument(`Day ${i + 1}: ${t.title}`, doc.title, kind));
    finish(`Created a study plan from ${doc.title}`);
  }, [doc, tasks, kind, addTaskFromDocument, finish]);

  return { turnIntoTasks, makeStudyPlan };
}
