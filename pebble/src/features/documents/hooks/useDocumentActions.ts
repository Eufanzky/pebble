'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { useToast } from '@/contexts/ToastContext';
import { useTasks } from '@/features/tasks';
import type { DocumentItem } from '../types';

/** Turning a document into tasks on Today, one by one or as a study plan. */
export function useDocumentActions(doc: DocumentItem, onDone: () => void) {
  const router = useRouter();
  const { addTaskFromDocument } = useTasks();
  const { addEntry } = useActivityLog();
  const { showToast } = useToast();
  const kind = doc.type === 'meeting' ? 'meeting' : 'academic';
  const count = doc.extractedTasks.length;

  const finish = useCallback(
    (toast: string) => {
      showToast(toast);
      onDone();
      router.push('/today');
    },
    [showToast, onDone, router],
  );

  const turnIntoTasks = useCallback(() => {
    doc.extractedTasks.forEach((t) => addTaskFromDocument(t.title, doc.title, kind));
    addEntry('SimplifyCore', `Extracted ${count} tasks from "${doc.title}" and added to Today`, `Document type: ${doc.type}. Tasks extracted based on action items.`);
    finish(`Added ${count} tasks from ${doc.title}`);
  }, [doc, kind, count, addTaskFromDocument, addEntry, finish]);

  const makeStudyPlan = useCallback(() => {
    doc.extractedTasks.forEach((t, i) => addTaskFromDocument(`Day ${i + 1}: ${t.title}`, doc.title, kind));
    addEntry('SimplifyCore', `Created study plan from "${doc.title}" — ${count} reading sessions`, `Sequential study plan generated from document.`);
    finish(`Created a study plan from ${doc.title}`);
  }, [doc, kind, count, addTaskFromDocument, addEntry, finish]);

  const logReaderOpened = useCallback(() => {
    addEntry('PebbleVoice', `Launched Immersive Reader for "${doc.title}"`, 'Azure AI Immersive Reader launched.');
  }, [addEntry, doc.title]);

  return { turnIntoTasks, makeStudyPlan, logReaderOpened };
}
