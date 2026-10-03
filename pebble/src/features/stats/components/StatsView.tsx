'use client';

import { useState } from 'react';
import { Button, Card, Chip } from '@/shared/ui';
import { useStats } from '../hooks/useStats';
import { allTimeSentence, dayLabel, MEASURES, rangeSentence } from '../lib/summary';
import type { Measure } from '../types';
import DayChart from './DayChart';
import TagBars from './TagBars';
import './Stats.css';

const RANGES = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
];

/**
 * Progress that only adds up (roadmap 5.6): what the user finished, by day and
 * by tag, and everything since they started. Nothing goes back to zero; no goals, no comparisons.
 */
export default function StatsView() {
  const [days, setDays] = useState(7);
  const [measure, setMeasure] = useState<Measure>('steps');
  const stats = useStats(days);

  return (
    <div className="stats">
      <header className="stats__header">
        <h1 className="stats__title">Your progress</h1>
        <p className="stats__lead">Everything you finish is counted here. It only adds up.</p>
        <div role="group" aria-label="Range" className="stats__chips">
          {RANGES.map((range) => (
            <Chip key={range.days} pressed={days === range.days} onClick={() => setDays(range.days)}>
              {range.label}
            </Chip>
          ))}
        </div>
      </header>

      {stats.isError ? (
        <Card padding="md" className="stats__note" role="status">
          <p>Pebble couldn&apos;t load your progress just now.</p>
          <Button variant="quiet" onClick={() => void stats.refetch()}>
            Try again
          </Button>
        </Card>
      ) : !stats.data ? (
        <p role="status" className="stats__loading">
          Adding it up…
        </p>
      ) : (
        <>
          <section aria-labelledby="stats-summary" className="stats__summary">
            <h2 id="stats-summary" className="ui-visually-hidden">
              Summary
            </h2>
            <p className="stats__sentence">{rangeSentence(stats.data.totals, days)}</p>
            {allTimeSentence(stats.data.allTime) && (
              <p className="stats__all-time">{allTimeSentence(stats.data.allTime)}</p>
            )}
          </section>

          <Card as="section" padding="md" aria-labelledby="stats-days">
            <div className="stats__section-head">
              <h2 id="stats-days" className="stats__section-title">
                Each day
              </h2>
              <div role="group" aria-label="What to show" className="stats__chips">
                {MEASURES.map((m) => (
                  <Chip key={m.id} pressed={measure === m.id} onClick={() => setMeasure(m.id)}>
                    {m.label}
                  </Chip>
                ))}
              </div>
            </div>
            <DayChart days={stats.data.days} measure={measure} />
            <details className="stats__table">
              <summary>Show as a table</summary>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Steps</th>
                    <th scope="col">Tasks</th>
                    <th scope="col">Focus minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.data.days.map((day) => (
                    <tr key={day.date}>
                      <th scope="row">{dayLabel(day.date, 30)}</th>
                      <td>{day.steps}</td>
                      <td>{day.tasks}</td>
                      <td>{day.focusMinutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </Card>

          <Card as="section" padding="md" aria-labelledby="stats-tags">
            <h2 id="stats-tags" className="stats__section-title">
              Tasks finished by tag
            </h2>
            <TagBars byTag={stats.data.byTag} />
          </Card>
        </>
      )}
    </div>
  );
}
