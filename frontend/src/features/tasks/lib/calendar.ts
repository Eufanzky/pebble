/** When a calendar plan starts by default: the next quarter hour (7.7). */
export function nextQuarterHour(now: Date): Date {
  const next = new Date(now);
  next.setSeconds(0, 0);
  next.setMinutes(Math.ceil((now.getMinutes() + (now.getSeconds() || now.getMilliseconds() ? 1 : 0)) / 15) * 15);
  return next;
}

/** `2026-10-06T11:15:00+02:00`: the local time with its UTC offset, so the backend can say it the user's way. */
export function localIso(date: Date): string {
  const pad = (n: number) => String(Math.abs(n)).padStart(2, '0');
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(Math.abs(offset) / 60))}:${pad(Math.abs(offset) % 60)}`
  );
}

/** A file name from a task's title: `read-chapter-4.ics`. */
export function calendarFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
  return `${slug || 'pebble-plan'}.ics`;
}
