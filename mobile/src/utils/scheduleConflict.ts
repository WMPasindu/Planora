import type { TrackedGoal } from '@/types';

import { formatYmd, parseYmdLocal } from './goalLifecycle';

const DAY_MS = 86400000;

/** Half-open interval [a,b) overlap in minutes same day. */
export function intervalsOverlapMinutes(a0: number, a1: number, b0: number, b1: number): boolean {
  return Math.max(a0, b0) < Math.min(a1, b1);
}

export function computeScheduleEndMinutes(
  startMinutes: number,
  durationMinutes: number
): { endMinutes: number; ok: boolean } {
  const end = startMinutes + durationMinutes;
  if (end > 24 * 60) {
    return { endMinutes: 24 * 60, ok: false };
  }
  return { endMinutes: end, ok: true };
}

/** YYYY-MM-DD dates when this goal's time block applies (for overlap checks). */
export function expandScheduleOccurrenceDates(goal: TrackedGoal): string[] {
  if (goal.scheduleStartMinutes == null || goal.scheduleDurationMinutes == null) {
    return [];
  }
  const startMs = parseYmdLocal(goal.startDate);
  const endMs = goal.endDate != null ? parseYmdLocal(goal.endDate) : startMs + 180 * DAY_MS;

  const out: string[] = [];

  if (goal.cadence === 'daily') {
    for (let t = startMs; t <= endMs; t += DAY_MS) {
      out.push(formatYmd(new Date(t)));
    }
  } else if (goal.cadence === 'weekly') {
    for (let t = startMs; t <= endMs; t += 7 * DAY_MS) {
      out.push(formatYmd(new Date(t)));
    }
  } else {
    const d = new Date(startMs);
    const end = new Date(endMs);
    while (d.getTime() <= end.getTime()) {
      out.push(formatYmd(new Date(d)));
      const next = new Date(d);
      next.setMonth(next.getMonth() + 1);
      d.setTime(next.getTime());
    }
  }
  if (!goal.excludedDates || goal.excludedDates.length === 0) {
    return out;
  }
  const excluded = new Set(goal.excludedDates);
  return out.filter((d) => !excluded.has(d));
}

function windowForGoal(g: TrackedGoal): { start: number; end: number } | null {
  if (g.scheduleStartMinutes == null || g.scheduleDurationMinutes == null) return null;
  const start = g.scheduleStartMinutes;
  const end =
    g.scheduleEndMinutes != null
      ? g.scheduleEndMinutes
      : start + g.scheduleDurationMinutes;
  return { start, end };
}

/**
 * Returns other goals that overlap this candidate's time window on at least one shared day.
 * Pass `excludeId` when editing an existing goal.
 */
export function findScheduleConflicts(
  candidate: Pick<
    TrackedGoal,
    | 'id'
    | 'startDate'
    | 'endDate'
    | 'cadence'
    | 'scheduleStartMinutes'
    | 'scheduleDurationMinutes'
    | 'scheduleEndMinutes'
  >,
  allGoals: TrackedGoal[],
  excludeId?: string
): TrackedGoal[] {
  if (candidate.scheduleStartMinutes == null || candidate.scheduleDurationMinutes == null) {
    return [];
  }
  const cw = windowForGoal(candidate as TrackedGoal);
  if (!cw) return [];

  const candDates = new Set(expandScheduleOccurrenceDates(candidate as TrackedGoal));
  if (candDates.size === 0) return [];

  const conflicts: TrackedGoal[] = [];
  const seen = new Set<string>();

  for (const g of allGoals) {
    if (g.id === excludeId || g.id === candidate.id) continue;
    const gw = windowForGoal(g);
    if (!gw) continue;
    const gDates = expandScheduleOccurrenceDates(g);
    let overlap = false;
    for (const d of gDates) {
      if (!candDates.has(d)) continue;
      if (intervalsOverlapMinutes(cw.start, cw.end, gw.start, gw.end)) {
        overlap = true;
        break;
      }
    }
    if (overlap && !seen.has(g.id)) {
      seen.add(g.id);
      conflicts.push(g);
    }
  }

  return conflicts;
}
