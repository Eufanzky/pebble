import { describe, expect, it, vi } from 'vitest';
import { act, renderHookWithProviders, screen } from '@/test/render';
import { documentHandlers } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { useActivityLog } from '@/features/activity';
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
    expect(result.current.log.entries).toEqual([]);
  });

  it('has the backend read a PDF, without storing it', async () => {
    server.use(documentHandlers.parsed('The PDF text.', 'meeting'));
    const { result, onAdded } = renderUpload();

    await act(() => result.current.upload(new File(['%PDF'], 'Minutes.pdf', { type: 'application/pdf' })));

    expect(onAdded).toHaveBeenCalledWith(expect.objectContaining({ title: 'Minutes', type: 'meeting', original: 'The PDF text.' }));
    expect(result.current.log.entries).toEqual([]);
  });

  it.each([
    ['the file is damaged', () => documentHandlers.status(422), 'Could not read it'],
    ['the backend is down', () => documentHandlers.status(503), 'Pebble couldn\'t read "Spec.pdf" just now. Text files always work.'],
  ])('adds nothing and says so gently when %s', async (_, handler, message) => {
    server.use(handler());
    const { result, onAdded } = renderUpload();
    const before = result.current.log.entries.length;

    await act(() => result.current.upload(new File(['%PDF'], 'Spec.pdf', { type: 'application/pdf' })));

    expect(onAdded).not.toHaveBeenCalled();
    expect(result.current.log.entries).toHaveLength(before);
    expect(await screen.findByText(message)).toBeInTheDocument();
  });
});
