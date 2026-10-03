'use client';

import { useState } from 'react';
import { isAcceptedUpload } from '../lib/upload';
import './documents.css';

/** Drop a file here, or pick one (also by keyboard: the input is hidden but focusable). */
export default function UploadZone({ onUpload }: { onUpload?: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (isAcceptedUpload(file)) onUpload?.(file);
  };

  return (
    <label
      className="upload-zone"
      data-dragging={isDragging || undefined}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <input
        type="file"
        aria-label="Upload a document"
        className="ui-visually-hidden"
        accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <span className="upload-zone__plus" aria-hidden="true">
        +
      </span>
      <span className="upload-zone__text">{isDragging ? 'Drop your file here' : 'Upload a PDF, doc, or text file'}</span>
    </label>
  );
}
