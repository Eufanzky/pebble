'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTasks } from '@/contexts/TasksContext';

const navItems = [
  { href: '/today', label: 'Today', icon: 'today' },
  { href: '/documents', label: 'Documents', icon: 'docs' },
  { href: '/activity', label: 'Activity', icon: 'activity' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
] as const;

function NavIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? 'var(--text-primary)' : 'var(--text-secondary)';

  switch (type) {
    case 'today':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5" />
          <circle cx="8" cy="8" r="2" fill={color} />
          <line x1="8" y1="1" x2="8" y2="3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="13" x2="8" y2="15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="1" y1="8" x2="3" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="13" y1="8" x2="15" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'docs':
      return (
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
          <rect x="1" y="1" width="12" height="14" rx="2" stroke={color} strokeWidth="1.5" />
          <line x1="4" y1="5" x2="10" y2="5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="8" x2="10" y2="8" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="11" x2="8" y2="11" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case 'activity':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke={color} strokeWidth="1.5" />
          <line x1="8" y1="4" x2="8" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="8" x2="11" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'settings':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="2.5" stroke={color} strokeWidth="1.5" />
          {/* Pre-computed gear spokes to avoid SSR/client float mismatch */}
          <line x1="13" y1="8" x2="15" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10.5" y1="12.33" x2="11.5" y2="14.06" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="5.5" y1="12.33" x2="4.5" y2="14.06" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="8" x2="1" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="5.5" y1="3.67" x2="4.5" y2="1.94" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10.5" y1="3.67" x2="11.5" y2="1.94" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function CatSilhouette() {
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" className="inline-block ml-1.5 -mb-0.5">
      {/* Ears */}
      <polygon points="3,8 1,1 7,5" fill="var(--accent-lavender)" opacity="0.7" />
      <polygon points="17,8 19,1 13,5" fill="var(--accent-lavender)" opacity="0.7" />
      {/* Head */}
      <ellipse cx="10" cy="11" rx="8" ry="7" fill="var(--accent-lavender)" opacity="0.5" />
      {/* Eyes */}
      <circle cx="7" cy="10" r="1.2" fill="var(--bg-deep)" />
      <circle cx="13" cy="10" r="1.2" fill="var(--bg-deep)" />
      {/* Eye shine */}
      <circle cx="7.5" cy="9.5" r="0.4" fill="white" opacity="0.8" />
      <circle cx="13.5" cy="9.5" r="0.4" fill="white" opacity="0.8" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { tasks } = useTasks();

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const circ = 2 * Math.PI * 14; // ~87.96
  const offset = circ - (circ * pct) / 100;

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-main">
          pebble
          <CatSilhouette />
        </div>
        <div className="sidebar-brand-sub">your calm corner</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const active = pathname === item.href || (pathname === '/' && item.href === '/today');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-link ${active ? 'active' : ''}`}
            >
              <span className="sidebar-nav-icon">
                <NavIcon type={item.icon} active={active} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Progress ring */}
      <div className="sidebar-footer">
        <svg viewBox="0 0 36 36" width={36} height={36} className="sidebar-ring">
          <circle
            cx="18" cy="18" r="14"
            fill="none"
            stroke="var(--border-soft)"
            strokeWidth="3"
          />
          <circle
            cx="18" cy="18" r="14"
            fill="none"
            stroke="var(--accent-sage)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="sidebar-ring-fill"
          />
        </svg>
        <div className="sidebar-footer-text">
          <strong>{done} / {total}</strong>
          <span>tasks today</span>
        </div>
      </div>
    </aside>
  );
}
