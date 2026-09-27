import { describe, expect, it } from 'vitest';
import { MAX_UPLOAD_BYTES, documentFromBinary, documentFromText, isAcceptedUpload, isTextFile } from './upload';

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
  it('uses the text at every level, titled after the file', () => {
    const doc = documentFromText('My notes.txt', 'Hello', 7);

    expect(doc).toMatchObject({ id: 'upload-7', title: 'My notes', type: 'academic', tags: ['uploaded'], original: 'Hello' });
    expect(Object.values(doc.levels)).toEqual(['Hello', 'Hello', 'Hello', 'Hello', 'Hello']);
    expect(doc.comprehensionQuestion.question).toBe('');
  });
});

describe('documentFromBinary', () => {
  it('is a technical placeholder with the file name and size', () => {
    const doc = documentFromBinary(file('Spec.pdf', 'application/pdf', 20480), 9);

    expect(doc).toMatchObject({ id: 'upload-9', title: 'Spec', type: 'technical', levels: {} });
    expect(doc.original).toContain('[Spec.pdf]');
    expect(doc.original).toContain('File size: 20 KB');
  });
});
