import type { TrackedGoal } from '@/types';

import { formatYmd, parseYmdLocal } from './goalLifecycle';

const DAY_MS = 86_400_000;

/** Base accent per block — used for border + tinted background. */
export const BLOCK_ACCENTS = [
  '#1a237e',
  '#0d47a1',
  '#00695c',
  '#e65100',
  '#4a148c',
  '#1b5e20',
  '#b71c1c',
  '#f57f17',
  '#004d40',
  '#311b92',
] as const;

export function blockColorForGoal(goal: TrackedGoal, allGoals: TrackedGoal[]): string {
  const idx = allGoals.findIndex((g) => g.id === goal.id);
  return BLOCK_ACCENTS[(idx >= 0 ? idx : 0) % BLOCK_ACCENTS.length];
}

/** 20 % opacity tint for the block fill so overlapping items remain visible. */
export function blockBgForGoal(accent: string): string {
  return `${accent}22`;
}

export function goalOccursOnDate(goal: TrackedGoal, dateYmd: string): boolean {
  if (goal.scheduleStartMinutes == null || goal.scheduleDurationMinutes == null) return false;
  if (goal.excludedDates?.includes(dateYmd)) return false;

  const dateMs = parseYmdLocal(dateYmd);
  const startMs = parseYmdLocal(goal.startDate);
  const endMs = goal.endDate != null ? parseYmdLocal(goal.endDate) : startMs + 365 * DAY_MS;

  if (dateMs < startMs || dateMs > endMs) return false;

  if (goal.cadence === 'daily') return true;

  if (goal.cadence === 'weekly') {
    const startDay = new Date(startMs).getDay();
    const dateDay = new Date(dateMs).getDay();
    return startDay === dateDay;
  }

  if (goal.cadence === 'monthly') {
    const startDom = new Date(startMs).getDate();
    const dateDom = new Date(dateMs).getDate();
    return startDom === dateDom;
  }

  return false;
}

export function getGoalsForDate(goals: TrackedGoal[], dateYmd: string): TrackedGoal[] {
  return goals
    .filter((g) => goalOccursOnDate(g, dateYmd))
    .sort((a, b) => (a.scheduleStartMinutes ?? 0) - (b.scheduleStartMinutes ?? 0));
}

export function getWeekDates(anchor: Date): Date[] {
  const d = new Date(anchor);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(monday.getDate() + mondayOffset);
  const out: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const dd = new Date(monday);
    dd.setDate(dd.getDate() + i);
    out.push(dd);
  }
  return out;
}

export function getMonthCalendarGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const day = first.getDay();
  const startOffset = day === 0 ? -6 : 1 - day;
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() + startOffset);

  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(d.getDate() + i);
    cells.push(d);
  }
  return cells;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export function shortDayName(d: Date): string {
  const day = d.getDay();
  return SHORT_DAYS[day === 0 ? 6 : day - 1];
}

export function dateHasBlocks(goals: TrackedGoal[], dateYmd: string): boolean {
  return goals.some((g) => goalOccursOnDate(g, dateYmd));
}
