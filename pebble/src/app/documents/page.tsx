'use client';

import { useState, useCallback } from 'react';
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
  const { mood, flashMood } = usePebble();
  const { addEntry } = useActivityLog();
  const { showToast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<DocumentItem[]>([]);

  const handleOpenDoc = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    addEntry(
      'CalmSense',
      `User opened "${doc.title}"`,
      `Document type: ${doc.type}. Displaying at user's default reading level.`
    );
  };

  const handleUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string'
        ? reader.result
        : 'Binary file uploaded. Content will be parsed by Azure Document Intelligence.';

      const name = file.name.replace(/\.[^.]+$/, '');
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const docType: DocumentItem['type'] = ext === 'pdf' || ext === 'doc' || ext === 'docx'
        ? 'technical' : 'academic';

      const newDoc: DocumentItem = {
        id: `upload-${Date.now()}`,
        title: name,
        type: docType,
        tags: ['uploaded'],
        original: text,
        levels: {
          1: text,
          3: text,
          5: text,
          7: text,
          10: text,
        },
        extractedTasks: [],
        comprehensionQuestion: {
          question: '',
          correctAnswer: '',
          wrongAnswer: '',
          pebbleCorrect: 'Nice work!',
          pebbleWrong: 'No worries, let\'s look at it again.',
        },
      };

      setUploadedDocs((prev) => [newDoc, ...prev]);
      flashMood('excited', 2000);
      showToast(`"${name}" uploaded — tap to read it`);
      addEntry(
        'SimplifyCore',
        `User uploaded "${file.name}" (${(file.size / 1024).toFixed(0)} KB)`,
        `File type: ${file.type || ext}. Ready for simplification at user's reading level.`
      );
    };

    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else {
      // For PDF/Word, show filename — real parsing goes through backend
      const name = file.name.replace(/\.[^.]+$/, '');
      const newDoc: DocumentItem = {
        id: `upload-${Date.now()}`,
        title: name,
        type: 'technical',
        tags: ['uploaded'],
        original: `[${file.name}] — This document will be parsed by Azure Document Intelligence.\n\nFile size: ${(file.size / 1024).toFixed(0)} KB\nType: ${file.type}`,
        levels: {},
        extractedTasks: [],
        comprehensionQuestion: {
          question: '',
          correctAnswer: '',
          wrongAnswer: '',
          pebbleCorrect: '',
          pebbleWrong: '',
        },
      };
      setUploadedDocs((prev) => [newDoc, ...prev]);
      flashMood('excited', 2000);
      showToast(`"${name}" uploaded — tap to read it`);
      addEntry(
        'SimplifyCore',
        `User uploaded "${file.name}" (${(file.size / 1024).toFixed(0)} KB)`,
        `File type: ${file.type}. Queued for Azure Document Intelligence parsing.`
      );
    }
  }, [addEntry, flashMood, showToast]);

  const allDocs = [...uploadedDocs, ...sampleDocuments];

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
          {allDocs.map((doc) => (
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
