'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTasks } from '@/features/tasks';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import { IconButton } from '@/shared/ui';

const navItems = [
  { href: '/today', label: 'Today', icon: 'today' },
  { href: '/documents', label: 'Documents', icon: 'docs' },
  { href: '/activity', label: 'Activity', icon: 'activity' },
  { href: '/focus', label: 'Focus', icon: 'focus' },
  { href: '/settings', label: 'Settings', icon: 'settings' },
] as const;

function NavIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? 'var(--color-text)' : 'var(--color-text-2)';

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
    case 'focus':
      return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="4" width="12" height="9" rx="2" stroke={color} strokeWidth="1.5" />
          <circle cx="8" cy="8.5" r="2" stroke={color} strokeWidth="1.2" />
          <circle cx="5" cy="8.5" r="1" fill={color} opacity="0.4" />
          <circle cx="11" cy="8.5" r="1" fill={color} opacity="0.4" />
          <line x1="6" y1="2" x2="10" y2="2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
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
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" className="sidebar-brand-cat" aria-hidden="true">
      {/* Ears */}
      <polygon points="3,8 1,1 7,5" fill="var(--color-accent)" opacity="0.7" />
      <polygon points="17,8 19,1 13,5" fill="var(--color-accent)" opacity="0.7" />
      {/* Head */}
      <ellipse cx="10" cy="11" rx="8" ry="7" fill="var(--color-accent)" opacity="0.5" />
      {/* Eyes */}
      <circle cx="7" cy="10" r="1.2" fill="var(--color-bg)" />
      <circle cx="13" cy="10" r="1.2" fill="var(--color-bg)" />
      {/* Eye shine */}
      <circle cx="7.5" cy="9.5" r="0.4" fill="white" opacity="0.8" />
      <circle cx="13.5" cy="9.5" r="0.4" fill="white" opacity="0.8" />
    </svg>
  );
}

/**
 * The app's navigation: one list of links, laid out by shell.css as a sidebar
 * on wider screens (collapsible to an icon rail) and as a bottom tab bar on
 * phones. Labels stay readable to screen readers in every layout.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { tasks, completionPercentage } = useTasks();
  const [collapsed, setCollapsed] = useLocalStorage('pebble-nav-collapsed', false);

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;
  const circ = 2 * Math.PI * 14; // ~87.96
  const offset = circ - (circ * completionPercentage) / 100;

  return (
    <aside className="sidebar" data-collapsed={collapsed || undefined} aria-label="Main navigation">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <div className="sidebar-brand-main">
            <span className="sidebar-brand-name">pebble</span>
            <CatSilhouette />
          </div>
          <div className="sidebar-brand-sub">your calm corner</div>
        </div>
        <IconButton
          label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
          aria-expanded={!collapsed}
          className="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2.5" width="12" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
            <line x1="6" y1="3" x2="6" y2="13" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </IconButton>
      </div>

      <nav className="sidebar-nav" aria-label="App sections">
        {navItems.map((item) => {
          const active = pathname === item.href || (pathname === '/' && item.href === '/today');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-link ${active ? 'active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="sidebar-nav-icon" aria-hidden="true">
                <NavIcon type={item.icon} active={active} />
              </span>
              <span className="sidebar-nav-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer" role="status" aria-label={`${done} of ${total} tasks completed`}>
        <svg viewBox="0 0 36 36" width={36} height={36} className="sidebar-ring" aria-hidden="true">
          <circle cx="18" cy="18" r="14" fill="none" stroke="var(--color-line)" strokeWidth="3" />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="sidebar-ring-fill"
          />
        </svg>
        <div className="sidebar-footer-text" aria-hidden="true">
          <strong>
            {done} of {total}
          </strong>
          <span>tasks today</span>
        </div>
      </div>
    </aside>
  );
}
