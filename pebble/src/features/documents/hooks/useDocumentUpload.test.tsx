import { describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders } from '@/test/render';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import type { DocumentItem } from '../types';
import { useDocumentUpload } from './useDocumentUpload';

function renderUpload() {
  const onAdded = vi.fn<(doc: DocumentItem) => void>();
  const { result } = renderHookWithProviders(() => ({ upload: useDocumentUpload(onAdded), log: useActivityLog() }));
  return { result, onAdded };
}

describe('useDocumentUpload', () => {
  it('reads a text file into a document', async () => {
    const { result, onAdded } = renderUpload();

    await act(() => result.current.upload(new File(['My notes'], 'notes.txt', { type: 'text/plain' })));

    expect(onAdded).toHaveBeenCalledWith(expect.objectContaining({ title: 'notes', original: 'My notes' }));
    expect(result.current.log.entries[0]).toMatchObject({
      agent: 'SimplifyCore',
      action: 'User uploaded "notes.txt" (0 KB)',
      reasoning: expect.stringContaining('Ready for simplification'),
    });
  });

  it('adds a placeholder for a PDF', async () => {
    const { result, onAdded } = renderUpload();

    await act(() => result.current.upload(new File(['%PDF'], 'Spec.pdf', { type: 'application/pdf' })));

    expect(onAdded).toHaveBeenCalledWith(expect.objectContaining({ title: 'Spec', type: 'technical' }));
    expect(result.current.log.entries[0]).toMatchObject({ reasoning: expect.stringContaining('application/pdf') });
  });
});
