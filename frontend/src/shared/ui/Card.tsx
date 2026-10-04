import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li';
  /** `raised` is one step lighter, for what sits on top of other cards. */
  tone?: 'flat' | 'raised';
  padding?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

/** A surface for grouped content: separated by tone and a hairline, not a shadow. */
export function Card({ as: Tag = 'div', tone = 'flat', padding = 'md', className = '', children, ...rest }: CardProps) {
  const classes = ['ui-card', tone === 'raised' && 'ui-card--raised', `ui-card--pad-${padding}`, className]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
}
