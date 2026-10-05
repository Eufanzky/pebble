'use client';

import { useState } from 'react';
import { usePreferences } from '@/shared/preferences';
import { PAGE_SIZE, entryTime, feedEntries, showMoreLabel } from '../lib/feed';
import type { ActivityEntry } from '../types';
import './ActivityFeed.css';

const AGENTS = ['All', 'CalmSense', 'AdaptLens', 'SimplifyCore', 'PebbleVoice', 'WhyBot', 'BridgeBot'] as const;

const AGENT_COLORS: Record<string, string> = {
  CalmSense: 'var(--color-tag-wellbeing)',
  AdaptLens: 'var(--color-sky)',
  SimplifyCore: 'var(--color-tag-project)',
  PebbleVoice: 'var(--color-accent)',
  WhyBot: 'var(--color-tag-communication)',
  BridgeBot: 'var(--color-text)',
};

interface ActivityFeedProps {
  entries: ActivityEntry[];
  maxHeight?: string;
}

function EntryCard({ entry, isNew }: { entry: ActivityEntry; isNew: boolean }) {
  const { reduceMotion } = usePreferences();
  const noMotion = reduceMotion;
  const [showReasoning, setShowReasoning] = useState(false);

  const agentColor = AGENT_COLORS[entry.agent] ?? 'var(--color-text-3)';
  const safetyColor = entry.safetyStatus === 'passed' ? 'var(--color-tag-wellbeing)' : 'var(--color-tag-project)';
  const safetyBg = entry.safetyStatus === 'passed' ? 'rgba(143,175,138,0.1)' : 'rgba(232,133,106,0.1)';

  return (
    <div
      className={`activity-entry ${isNew && !noMotion ? 'new-entry' : ''}`}
      style={{ '--agent-color': agentColor } as React.CSSProperties}
    >
      {/* Top row: agent + timestamp */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span
          className="agent-badge"
          style={{
            background: `color-mix(in srgb, ${agentColor} 15%, transparent)`,
            color: agentColor,
          }}
        >
          {entry.agent}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums', fontSize: 11, color: 'var(--color-text-3)' }}>
          {entryTime(entry.timestamp)}
        </span>
      </div>

      {/* Action text + safety badge */}
      <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 8 }}>
        {entry.action}
        <span className="safety-badge" style={{ background: safetyBg, color: safetyColor }}>
          {entry.safetyStatus === 'passed' ? 'Content Safety: passed' : 'Content Safety: flagged'}
        </span>
      </div>

      {/* WhyBot's plain-language why (7.4) */}
      {entry.explanation && entry.explanation !== entry.reasoning && (
        <p className="activity-why">
          <span className="activity-why__label">WhyBot: </span>
          {entry.explanation}
        </p>
      )}

      {/* The agent's own reasoning (collapsible) */}
      <div>
        <button
          className="reasoning-toggle"
          onClick={() => setShowReasoning(!showReasoning)}
          aria-expanded={showReasoning}
        >
          {showReasoning ? 'Hide reasoning' : 'Show reasoning'}
        </button>
        <div
          className="reasoning-content"
          style={{ maxHeight: showReasoning ? 500 : 0 }}
        >
          <div style={{
            fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--color-text-2)',
            lineHeight: 1.6, marginTop: 8, paddingLeft: 10,
            borderLeft: `2px solid ${agentColor}`, opacity: 0.8,
          }}>
            {entry.reasoning}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ActivityFeed({ entries, maxHeight }: ActivityFeedProps) {
  const [filter, setFilter] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sorted = feedEntries(entries, filter);
  const visible = sorted.slice(0, visibleCount);
  const moreLabel = showMoreLabel(sorted.length - visibleCount);

  const handleFilterChange = (agent: string) => {
    setFilter(agent);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="activity-filters" role="group" aria-label="Filter by agent">
        {AGENTS.map((agent) => {
          const active = filter === agent;
          const color = agent === 'All' ? 'var(--color-accent)' : AGENT_COLORS[agent];
          return (
            <button
              key={agent}
              className={`activity-filter-btn ${active ? 'active' : ''}`}
              style={{ '--filter-color': color } as React.CSSProperties}
              onClick={() => handleFilterChange(agent)}
              aria-pressed={active}
              aria-label={`Filter by ${agent}${active ? ' (active)' : ''}`}
            >
              {agent}
            </button>
          );
        })}
      </div>

      {/* Count */}
      {sorted.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--color-text-3)', marginBottom: 12 }}>
          Showing {visible.length} of {sorted.length} entries
        </div>
      )}

      {/* Feed */}
      <div
        className="activity-feed"
        style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
      >
        {visible.map((entry, i) => (
          <EntryCard key={entry.id} entry={entry} isNew={i === 0} />
        ))}
        {sorted.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-3)', fontSize: 13 }}>
            No entries from {filter} yet.
          </div>
        )}
      </div>

      {/* Show more */}
      {moreLabel && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="activity-show-more"
          >
            {moreLabel}
          </button>
        </div>
      )}
    </div>
  );
}
