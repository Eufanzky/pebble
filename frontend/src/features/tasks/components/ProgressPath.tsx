'use client';

import { usePreferences } from '@/shared/preferences';

interface ProgressPathProps {
  completed: number;
  total: number;
  percentage: number;
}

export default function ProgressPath({ completed, total, percentage }: ProgressPathProps) {
  const { reduceMotion } = usePreferences();
  const noMotion = reduceMotion;

  // S-curve path: gentle wave ~300px wide, ~40px tall
  const pathD = 'M 10,30 C 60,5 90,50 150,25 C 210,0 240,45 290,20';
  const pathLength = 400; // approximate
  const travelledLength = (percentage / 100) * pathLength;

  // Dot position along path (percentage mapped to x roughly)
  const dotX = 10 + (percentage / 100) * 280;
  // Y follows the wave: approximate with sine
  const dotY = 25 - Math.sin((percentage / 100) * Math.PI * 2) * 10;

  return (
    <div style={{ padding: '16px 0' }}>
      <svg
        viewBox="0 0 300 50"
        width={300}
        height={50}
        style={{ display: 'block', overflow: 'visible', maxWidth: '100%', height: 'auto' }}
      >
        {/* Background path */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-line-strong)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Travelled portion */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength - travelledLength}
          style={noMotion ? undefined : { transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
        {/* Dot */}
        <circle
          cx={dotX}
          cy={dotY}
          r="5"
          fill="var(--color-accent)"
          stroke="var(--color-bg)"
          strokeWidth="2"
          style={noMotion ? undefined : { transition: 'cx 0.6s ease-out, cy 0.6s ease-out' }}
        />
        {/* Glow behind dot */}
        <circle
          cx={dotX}
          cy={dotY}
          r="10"
          fill="var(--color-accent)"
          opacity="0.15"
          style={noMotion ? undefined : { transition: 'cx 0.6s ease-out, cy 0.6s ease-out' }}
        />
      </svg>
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-2)', marginTop: 'var(--space-2)' }}>
        {completed} of {total} tasks done
      </div>
    </div>
  );
}
