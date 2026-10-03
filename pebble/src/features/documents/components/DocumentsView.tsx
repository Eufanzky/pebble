'use client';

import { useCallback, useState } from 'react';
import { useActivityLog } from '@/features/activity';
import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import { Screen, ScreenHeader } from '@/shared/ui';
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
    <Screen>
      <ScreenHeader
        title="Documents"
        lead="Your readings, simplified and organized."
        companion={
          <>
            <PebbleSpeechBubble className="ui-screen-header__bubble" message="Drop a doc, I'll help you understand it" />
            <PebbleCharacter mood={mood} size="small" />
          </>
        }
      />

      <div className="documents-grid">
        <UploadZone onUpload={upload} />
        {[...uploadedDocs, ...sampleDocuments].map((doc) => (
          <DocumentCard key={doc.id} document={doc} onClick={() => openDoc(doc)} />
        ))}
      </div>

      {selectedDoc && <DocumentModal document={selectedDoc} onClose={closeDoc} />}
    </Screen>
  );
}
