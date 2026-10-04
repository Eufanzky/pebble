'use client';

import { useState, type KeyboardEvent } from 'react';
import { dayLabel, labelledDays, MEASURES, scale } from '../lib/summary';
import type { Measure, StatsDay } from '../types';

interface DayChartProps {
  days: StatsDay[];
  measure: Measure;
}

/**
 * One column per day for one measure, in the Pebble colour. A quiet day is an
 * empty slot, never marked. Hover a column, or focus the chart and use the
 * arrow keys, to read a day; the same numbers are in the table below.
 */
export default function DayChart({ days, measure }: DayChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const unit = MEASURES.find((m) => m.id === measure)!.unit;
  const values = days.map((d) => d[measure]);
  const { max, ticks } = scale(values);
  const labelled = labelledDays(days);
  const shown = active === null ? null : days[active];

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    const edge = { Home: 0, End: days.length - 1 }[e.key];
    if (step === undefined && edge === undefined) return;
    e.preventDefault();
    setActive((current) =>
      edge !== undefined ? edge : Math.max(0, Math.min(days.length - 1, (current ?? days.length - 1) + step!)),
    );
  };

  return (
    <figure className="day-chart">
      <div
        className="day-chart__plot"
        tabIndex={0}
        role="group"
        aria-label={`${MEASURES.find((m) => m.id === measure)!.label} each day. Use the arrow keys to read a day.`}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        onMouseLeave={() => setActive(null)}
      >
        <div className="day-chart__grid" aria-hidden="true">
          {[...ticks].reverse().map((tick) => (
            <div key={tick} className="day-chart__gridline" style={{ bottom: `${(tick / max) * 100}%` }}>
              <span>{tick}</span>
            </div>
          ))}
        </div>
        <div className="day-chart__columns" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
          {days.map((day, i) => (
            <div
              key={day.date}
              className="day-chart__slot"
              data-active={active === i || undefined}
              onMouseEnter={() => setActive(i)}
              aria-hidden="true"
            >
              {values[i] > 0 && (
                <div className="day-chart__column" style={{ height: `${(values[i] / max) * 100}%` }} />
              )}
            </div>
          ))}
        </div>
        {shown && (
          <div
            className="day-chart__tooltip"
            // Kept on screen: it leans left near the right edge, right near the left one
            data-side={active! < days.length / 4 ? 'start' : active! >= (days.length * 3) / 4 ? 'end' : undefined}
            style={{ left: `${((active! + 0.5) / days.length) * 100}%` }}
            aria-hidden="true"
          >
            <strong>{dayLabel(shown.date, 7)}</strong>
            <span>{unit(shown[measure])}</span>
          </div>
        )}
      </div>
      <div className="day-chart__axis" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }} aria-hidden="true">
        {days.map((day, i) => (
          <span key={day.date}>{labelled.has(i) ? dayLabel(day.date, days.length) : ''}</span>
        ))}
      </div>
      <p className="ui-visually-hidden" aria-live="polite">
        {shown ? `${dayLabel(shown.date, 7)}: ${unit(shown[measure])}` : ''}
      </p>
    </figure>
  );
}
