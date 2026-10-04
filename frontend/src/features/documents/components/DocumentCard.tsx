'use client';

import { Chip } from '@/shared/ui';
import type { DocumentItem } from '../types';
import './documents.css';

interface DocumentCardProps {
  document: DocumentItem;
  onClick: () => void;
}

const typeLabels: Record<string, string> = {
  academic: 'Academic',
  technical: 'Technical',
  meeting: 'Meeting transcript',
};

/** A page drawn in CSS, tinted by the kind of document. */
function DocIcon({ type }: { type: string }) {
  return (
    <span className="doc-icon" data-type={type} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

/** One document on the shelf; opens it in the reader. */
export default function DocumentCard({ document: doc, onClick }: DocumentCardProps) {
  return (
    <button type="button" onClick={onClick} className="doc-card">
      <span className="doc-card__top">
        <DocIcon type={doc.type} />
        <span className="doc-card__title">{doc.title}</span>
        <span className="doc-card__type">{typeLabels[doc.type]}</span>
      </span>
      <span className="doc-card__tags">
        {doc.tags.map((tag) => (
          <Chip key={tag}>{tag[0].toUpperCase() + tag.slice(1)}</Chip>
        ))}
      </span>
    </button>
  );
}
