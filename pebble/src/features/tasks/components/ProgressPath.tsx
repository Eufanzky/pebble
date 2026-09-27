'use client';

import { usePreferences } from '@/contexts/PreferencesContext';

interface ProgressPathProps {
  completed: number;
  total: number;
  percentage: number;
}

export default function ProgressPath({ completed, total, percentage }: ProgressPathProps) {
  const { preferences } = usePreferences();
  const noMotion = preferences.reduceAnimations;

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
        style={{ display: 'block', overflow: 'visible' }}
      >
        {/* Background path */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--border-soft)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Travelled portion */}
        <path
          d={pathD}
          fill="none"
          stroke="var(--accent-lavender)"
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
          fill="var(--accent-lavender)"
          stroke="var(--bg-deep)"
          strokeWidth="2"
          style={noMotion ? undefined : { transition: 'cx 0.6s ease-out, cy 0.6s ease-out' }}
        />
        {/* Glow behind dot */}
        <circle
          cx={dotX}
          cy={dotY}
          r="10"
          fill="var(--accent-lavender)"
          opacity="0.15"
          style={noMotion ? undefined : { transition: 'cx 0.6s ease-out, cy 0.6s ease-out' }}
        />
      </svg>
      <div style={{
        fontFamily: 'var(--font-jetbrains)',
        fontSize: 13,
        color: 'var(--text-muted)',
        marginTop: 8,
      }}>
        {completed} of {total} tasks done
      </div>
    </div>
  );
}
