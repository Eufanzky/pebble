import type { ReactNode } from 'react';

/** A screen's content column, with the shell's spacing. */
export function Screen({ children, width = 'wide' }: { children: ReactNode; width?: 'wide' | 'narrow' }) {
  return <div className={`ui-screen ui-screen--${width}`}>{children}</div>;
}

interface ScreenHeaderProps {
  title: string;
  lead?: string;
  /** Pebble (and what it's saying), beside the title; small, so the content starts high. */
  companion?: ReactNode;
}

/** The top of a screen: its name in sentence case, one line on what it's for, and Pebble beside it. */
export function ScreenHeader({ title, lead, companion }: ScreenHeaderProps) {
  return (
    <header className="ui-screen-header">
      <div className="ui-screen-header__text">
        <h1 className="ui-screen-header__title">{title}</h1>
        {lead && <p className="ui-screen-header__lead">{lead}</p>}
      </div>
      {companion && <div className="ui-screen-header__companion">{companion}</div>}
    </header>
  );
}
