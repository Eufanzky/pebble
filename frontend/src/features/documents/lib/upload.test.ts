import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api';
import { MAX_UPLOAD_BYTES, documentFromText, isAcceptedUpload, isTextFile, toDocumentType, uploadErrorMessage } from './upload';

const file = (name: string, type: string, size = 1024) => ({ name, type, size });

describe('isAcceptedUpload', () => {
  it.each([
    file('a.pdf', 'application/pdf'),
    file('a.docx', ''),
    file('notes.TXT', ''),
    file('x', 'text/plain'),
  ])('accepts %j', (f) => {
    expect(isAcceptedUpload(f)).toBe(true);
  });

  it('rejects other types and files over 10 MB', () => {
    expect(isAcceptedUpload(file('a.png', 'image/png'))).toBe(false);
    expect(isAcceptedUpload(file('a.pdf', 'application/pdf', MAX_UPLOAD_BYTES + 1))).toBe(false);
  });
});

describe('isTextFile', () => {
  it('knows text files by type or extension', () => {
    expect(isTextFile(file('a', 'text/plain'))).toBe(true);
    expect(isTextFile(file('a.txt', ''))).toBe(true);
    expect(isTextFile(file('a.pdf', 'application/pdf'))).toBe(false);
  });
});

describe('documentFromText', () => {
  it('is an upload titled after the file, with no levels until SimplifyCore writes them', () => {
    const doc = documentFromText('My notes.txt', 'Hello', undefined, 7);

    expect(doc).toMatchObject({ id: 'upload-7', source: 'upload', title: 'My notes', type: 'academic', tags: ['uploaded'], original: 'Hello' });
    expect(doc.levels).toEqual({});
    expect(doc.comprehensionQuestion.question).toBe('');
  });

  it('keeps the type the backend guessed', () => {
    expect(documentFromText('Meeting minutes.pdf', 'Hi', 'meeting').type).toBe('meeting');
  });
});

describe('uploadErrorMessage', () => {
  const general = 'Pebble couldn\'t read "a.pdf" just now. Text files always work.';

  it("passes on the backend's explanation for a file it can't read", () => {
    const error = new ApiError(422, JSON.stringify({ detail: 'Pebble found no text in a.pdf.' }));
    expect(uploadErrorMessage(error, 'a.pdf')).toBe('Pebble found no text in a.pdf.');
  });

  it.each([
    ['a server error', new ApiError(503, JSON.stringify({ detail: 'LLM down' }))],
    ['no connection', new ApiError(null, 'Failed to fetch')],
    ['a non-JSON body', new ApiError(413, 'Too large')],
    ['a detail that is not text', new ApiError(422, JSON.stringify({ detail: [{ loc: 'file' }] }))],
    ['any other error', new Error('boom')],
  ])('uses a general message for %s', (_, error) => {
    expect(uploadErrorMessage(error, 'a.pdf')).toBe(general);
  });
});

describe('toDocumentType', () => {
  it('keeps the types the UI knows and falls back to technical', () => {
    expect(toDocumentType('meeting')).toBe('meeting');
    expect(toDocumentType('academic')).toBe('academic');
    expect(toDocumentType('poem')).toBe('technical');
  });
});
