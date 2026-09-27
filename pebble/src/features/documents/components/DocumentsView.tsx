'use client';

import { useCallback, useState } from 'react';
import { PebbleCharacter } from '@/features/companion';
import { PebbleSpeechBubble } from '@/features/companion';
import { useActivityLog } from '@/features/activity';
import { usePebble } from '@/features/companion';
import { sampleDocuments } from '../data/sampleDocuments';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import type { DocumentItem } from '../types';
import DocumentCard from './DocumentCard';
import DocumentModal from './DocumentModal';
import UploadZone from './UploadZone';

/** The documents screen: uploads and sample readings, opened in a modal. */
export default function DocumentsView() {
  const { mood } = usePebble();
  const { addEntry } = useActivityLog();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<DocumentItem[]>([]);

  const upload = useDocumentUpload(useCallback((doc: DocumentItem) => setUploadedDocs((prev) => [doc, ...prev]), []));

  const openDoc = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    addEntry(
      'CalmSense',
      `User opened "${doc.title}"`,
      `Document type: ${doc.type}. Displaying at user's default reading level.`
    );
  };
  const closeDoc = useCallback(() => setSelectedDoc(null), []);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="screen-title" style={{ textTransform: 'lowercase' }}>documents</h1>
          <p className="screen-subtitle">Your readings, simplified and organized.</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PebbleSpeechBubble message="Drop a doc, I'll help you understand it" />
          <PebbleCharacter mood={mood} size="small" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        <UploadZone onUpload={upload} />
        {[...uploadedDocs, ...sampleDocuments].map((doc) => (
          <DocumentCard key={doc.id} document={doc} onClick={() => openDoc(doc)} />
        ))}
      </div>

      {selectedDoc && <DocumentModal document={selectedDoc} onClose={closeDoc} />}
    </>
  );
}
