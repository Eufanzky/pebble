'use client';

import { useState } from 'react';
import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import DocumentCard, { UploadZone } from '@/components/documents/DocumentCard';
import DocumentModal from '@/components/documents/DocumentModal';
import { usePebble } from '@/contexts/PebbleContext';
import { useToast } from '@/contexts/ToastContext';
import { sampleDocuments } from '@/data/sampleDocuments';
import type { DocumentItem } from '@/lib/types';

export default function DocumentsPage() {
  const { mood } = usePebble();
  const { showToast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  return (
    <>
      <ScreenBackground scene="library" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Documents</h1>
          <p className="screen-subtitle">Your readings, simplified and organized.</p>
        </div>

        {/* Document grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
          <UploadZone />
          {sampleDocuments.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onClick={() => setSelectedDoc(doc)} />
          ))}
        </div>

        {/* Pebble corner */}
        <div className="flex justify-end mr-4">
          <div className="flex flex-col items-center gap-3">
            <PebbleSpeechBubble message="Drop a doc, I'll help you understand it" />
            <PebbleCharacter mood={mood} size="small" />
          </div>
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
