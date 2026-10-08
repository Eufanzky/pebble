'use client';

import { useStats } from '../hooks/useStats';
import { allTimeSentence } from '../lib/summary';
import './Stats.css';

/**
 * One line of what the user has finished since they started (8.2), for screens other than /stats.
 * All-time totals only: a window such as "this month" would drop old days and go down. Nothing shows
 * until there's something to count, or while the stats can't be loaded.
 */
export default function ProgressSoFar({ className = '' }: { className?: string }) {
  const stats = useStats(1);
  const sentence = stats.data ? allTimeSentence(stats.data.allTime) : '';
  if (!sentence) return null;
  return <p className={`progress-so-far ${className}`.trim()}>{sentence}</p>;
}
