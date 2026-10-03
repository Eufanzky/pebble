'use client';

import { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Chip, type ChipTone } from './Chip';
import { Dialog } from './Dialog';
import { Field } from './Field';
import { IconButton } from './IconButton';

const COLOURS = [
  'bg', 'surface-1', 'surface-2', 'surface-3', 'line', 'line-strong', 'text', 'text-2', 'text-3', 'accent',
  'accent-soft', 'tag-study', 'tag-communication', 'tag-project', 'tag-wellbeing',
];
const TYPE = ['3xl', '2xl', 'xl', 'lg', 'md', 'sm', 'xs'];
const SPACE = [1, 2, 3, 4, 5, 6, 7, 8];
const RADII = ['sm', 'md', 'lg', 'xl', 'pill'];
const TONES: ChipTone[] = ['study', 'communication', 'project', 'wellbeing'];

const label = { fontSize: 'var(--text-xs)', color: 'var(--color-text-3)' };
const heading = {
  fontFamily: 'var(--font-display)',
  fontWeight: 'var(--weight-display)',
  fontSize: 'var(--text-xl)',
  margin: 'var(--space-6) 0 var(--space-3)',
};

/** Every token and primitive on one page, for building screens (dev only: /design-system). */
export function DesignSystemPreview() {
  const [open, setOpen] = useState<null | 'center' | 'sheet'>(null);
  const [filter, setFilter] = useState<ChipTone | null>(null);

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: 'var(--space-6) var(--space-4)', color: 'var(--color-text)' }}>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--weight-display)',
          fontSize: 'var(--text-3xl)',
          lineHeight: 'var(--leading-tight)',
        }}
      >
        Design system
      </h1>
      <p style={{ color: 'var(--color-text-2)' }}>Tokens in shared/ui/tokens.css, primitives in shared/ui.</p>

      <h2 style={heading}>Colour</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))', gap: 'var(--space-3)' }}>
        {COLOURS.map((name) => (
          <div key={name}>
            <div
              style={{
                height: '3rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-line)',
                background: `var(--color-${name})`,
              }}
            />
            <code style={label}>--color-{name}</code>
          </div>
        ))}
      </div>

      <h2 style={heading}>Type</h2>
      {TYPE.map((size) => (
        <p key={size} style={{ fontSize: `var(--text-${size})`, margin: 'var(--space-2) 0', lineHeight: 'var(--leading-tight)' }}>
          <span style={{ fontFamily: size.includes('xl') ? 'var(--font-display)' : 'var(--font-body)' }}>
            Pebble is here when you&apos;re ready
          </span>{' '}
          <code style={label}>--text-{size}</code>
        </p>
      ))}

      <h2 style={heading}>Space and radius</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'flex-end' }}>
        {SPACE.map((n) => (
          <div key={n} style={{ textAlign: 'center' }}>
            <div style={{ width: `var(--space-${n})`, height: `var(--space-${n})`, background: 'var(--color-accent)' }} />
            <code style={label}>{n}</code>
          </div>
        ))}
        {RADII.map((r) => (
          <div key={r} style={{ textAlign: 'center' }}>
            <div
              style={{ width: '4rem', height: '3rem', borderRadius: `var(--radius-${r})`, background: 'var(--color-surface-3)' }}
            />
            <code style={label}>{r}</code>
          </div>
        ))}
      </div>

      <h2 style={heading}>Primitives</h2>
      <Card as="section" aria-label="Primitives" padding="lg">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', alignItems: 'center' }}>
          <Button variant="primary" onClick={() => setOpen('center')}>
            Open a dialog
          </Button>
          <Button variant="quiet" onClick={() => setOpen('sheet')}>
            Open a sheet
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="quiet" size="sm">
            Small
          </Button>
          <Button variant="primary" busy>
            Busy
          </Button>
          <IconButton label="Settings">⚙</IconButton>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', margin: 'var(--space-5) 0' }}>
          {TONES.map((tone) => (
            <Chip key={tone} tone={tone} pressed={filter === tone} onClick={() => setFilter(filter === tone ? null : tone)}>
              {tone[0].toUpperCase() + tone.slice(1)}
            </Chip>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: '28rem' }}>
          <Field label="What do you need to do?" placeholder="Read Chapter 4" hint="One thing is enough." />
          <Field label="Notes" multiline note="Add a few words." />
        </div>
        <Card tone="raised" padding="sm" style={{ marginTop: 'var(--space-5)' }}>
          A raised card sits on a flat one.
        </Card>
      </Card>

      {open && (
        <Dialog title={open === 'sheet' ? 'A sheet' : 'A dialog'} variant={open} onClose={() => setOpen(null)}>
          <p style={{ color: 'var(--color-text-2)', marginBottom: 'var(--space-5)' }}>
            Focus stays inside until it closes.
          </p>
          <Button variant="primary" onClick={() => setOpen(null)}>
            Done
          </Button>
        </Dialog>
      )}
    </div>
  );
}
