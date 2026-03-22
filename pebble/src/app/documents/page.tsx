'use client';

import { useState } from 'react';
import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import DocumentCard, { UploadZone } from '@/components/documents/DocumentCard';
import DocumentModal from '@/components/documents/DocumentModal';
import { usePebble } from '@/contexts/PebbleContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { useToast } from '@/contexts/ToastContext';
import { sampleDocuments } from '@/data/sampleDocuments';
import type { DocumentItem } from '@/lib/types';

export default function DocumentsPage() {
  const { mood } = usePebble();
  const { addEntry } = useActivityLog();
  const { showToast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  const handleOpenDoc = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    addEntry(
      'CalmSense',
      `User opened "${doc.title}"`,
      `Document type: ${doc.type}. Displaying at user's default reading level.`
    );
  };

  const handleUpload = () => {
    showToast('Upload coming soon — try our sample documents!');
  };

  return (
    <>
      <ScreenBackground scene="library" />
      <div className="relative z-[1] p-10 px-12">
        {/* Header with Pebble */}
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

        {/* Document grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
        }}>
          <UploadZone onUpload={handleUpload} />
          {sampleDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onClick={() => handleOpenDoc(doc)} />
          ))}
        </div>
      </div>

      {/* Document modal */}
      {selectedDoc && (
        <DocumentModal
          document={selectedDoc}
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </>
  );
}
