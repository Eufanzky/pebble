'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import { useTasks } from '@/contexts/TasksContext';

const navItems = [
  { href: '/today', label: 'Today', icon: '✦' },
  { href: '/documents', label: 'Documents', icon: '✦' },
  { href: '/activity', label: 'Activity', icon: '✦' },
  { href: '/settings', label: 'Settings', icon: '✦' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { tasks } = useTasks();

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const circ = 97.4;
  const offset = circ - (circ * pct) / 100;

  return (
    <aside
      className="flex flex-col h-screen py-6"
      style={{
        width: 260,
        minWidth: 260,
        background: 'rgba(15, 13, 10, 0.95)',
        borderRight: '1px solid var(--border-soft)',
        zIndex: 20,
      }}
    >
      {/* Brand */}
      <div
        className="px-6 mb-7 opacity-90"
        style={{
          fontFamily: 'var(--font-baloo)',
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--accent-cream)',
          letterSpacing: '-0.5px',
        }}
      >
        pebble
      </div>

      {/* Pebble area */}
      <div className="flex flex-col items-center px-5 pb-5 pt-2 mb-2">
        <PebbleSpeechBubble />
        <PebbleCharacter />
        <div
          className="mt-2 uppercase tracking-widest"
          style={{
            fontFamily: 'var(--font-nunito)',
            fontSize: 12,
            color: 'var(--text-muted)',
          }}
        >
          Pebble
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (pathname === '/' && item.href === '/today');
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-[10px] no-underline transition-all duration-200"
              style={{
                padding: active ? '10px 13px 10px 13px' : '10px 16px',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: active ? 'rgba(196, 181, 212, 0.1)' : 'transparent',
                borderLeft: active ? '3px solid var(--accent-lavender)' : '3px solid transparent',
                fontFamily: 'var(--font-nunito)',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <span className="w-5 text-center text-[15px]" style={{ opacity: active ? 1 : 0.7 }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Stats ring */}
      <div
        className="flex items-center gap-3 px-6 pt-4"
        style={{ borderTop: '1px solid var(--border-soft)' }}
      >
        <svg viewBox="0 0 36 36" width={36} height={36} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={18} cy={18} r={15.5} fill="none" stroke="var(--border-soft)" strokeWidth={3} />
          <circle
            cx={18} cy={18} r={15.5} fill="none"
            stroke="var(--accent-sage)" strokeWidth={3} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            {done} tasks
          </strong>
          <br />
          done today
        </div>
      </div>
    </aside>
  );
}
