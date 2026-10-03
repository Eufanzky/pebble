import type { ReactNode } from 'react';
import type { Greeting } from '../lib/today';

interface TodayGreetingProps {
  greeting: Greeting;
  date: string;
  /** Pebble beside the greeting, on screens without the companion column. */
  companion?: ReactNode;
}

/** The top of Today: Pebble saying hello, and how the day looks. */
export default function TodayGreeting({ greeting, date, companion }: TodayGreetingProps) {
  return (
    <header className="today-greeting" data-muted={greeting.muted || undefined}>
      {companion && <div className="today-greeting__pebble">{companion}</div>}
      <div className="today-greeting__text">
        <p className="today-greeting__date">{date}</p>
        <p className="today-greeting__hello">{greeting.text}</p>
        <p className="today-greeting__sub">{greeting.sub}</p>
      </div>
    </header>
  );
}
