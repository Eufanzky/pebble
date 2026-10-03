import type { ApiSchema } from '@/shared/api';

export type Stats = ApiSchema<'StatsOut'>;
export type Totals = ApiSchema<'TotalsOut'>;
export type StatsDay = ApiSchema<'DayOut'>;
/** What the day chart shows. */
export type Measure = 'steps' | 'tasks' | 'focusMinutes';
