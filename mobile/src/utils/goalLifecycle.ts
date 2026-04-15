import type { GoalCadence, GoalLifecycle, TrackedGoal } from '@/types';

export type PlanCadenceFilter = 'all' | GoalCadence | 'other';

export function filterGoalsByPlanCadence(
  goals: TrackedGoal[],
  filter: PlanCadenceFilter
): TrackedGoal[] {
  if (filter === 'all') return goals;
  if (filter === 'other') {
    return goals.filter((g) => !(['daily', 'weekly', 'monthly'] as const).includes(g.cadence));
  }
  return goals.filter((g) => g.cadence === filter);
}

/** Parse target strings like "8h", "7h 30m", "0h 0m" from stored goals. */
export function parseTargetToHM(target: string): { hours: number; minutes: number } {
  const t = target.trim();
  let hours = 0;
  let minutes = 0;
  const hMatch = t.match(/(\d+)\s*h/i);
  if (hMatch) hours = parseInt(hMatch[1], 10);
  const mMatch = t.match(/(\d+)\s*m/i);
  if (mMatch) minutes = parseInt(mMatch[1], 10);
  return { hours, minutes };
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse YYYY-MM-DD in local calendar (no UTC shift). */
export function parseYmdLocal(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

export function startOfTodayLocal(): number {
  const x = new Date();
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function cadenceLabel(c: GoalCadence): string {
  switch (c) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'monthly':
      return 'Monthly';
    default:
      return 'Weekly';
  }
}

export function formatGoalRange(goal: TrackedGoal): string {
  const cadence = cadenceLabel(goal.cadence);
  if (goal.ongoing || goal.endDate == null) {
    return `Starts ${formatShortYmd(goal.startDate)} · ${cadence} · Ongoing`;
  }
  return `${formatShortYmd(goal.startDate)} → ${formatShortYmd(goal.endDate)} · ${cadence}`;
}

/** e.g. "9:00 AM–10:00 AM" for cards; null when no fixed block */
export function formatClockFromMinutes(mins: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setMinutes(mins);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export function formatScheduleBlock(goal: TrackedGoal): string | null {
  if (goal.scheduleStartMinutes == null || goal.scheduleDurationMinutes == null) {
    return null;
  }
  const endM =
    goal.scheduleEndMinutes != null
      ? goal.scheduleEndMinutes
      : goal.scheduleStartMinutes + goal.scheduleDurationMinutes;
  return `${formatClockFromMinutes(goal.scheduleStartMinutes)}–${formatClockFromMinutes(endM)}`;
}

function formatShortYmd(ymd: string): string {
  const t = parseYmdLocal(ymd);
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function deriveLifecycle(goal: TrackedGoal, now: Date = new Date()): GoalLifecycle {
  if (goal.completedAt) {
    return 'completed';
  }
  const today = startOfTodayLocal();
  const start = parseYmdLocal(goal.startDate);
  if (!goal.ongoing && goal.endDate != null) {
    const end = parseYmdLocal(goal.endDate);
    if (end < today) {
      return 'completed';
    }
  }
  if (start > today) {
    return 'planned';
  }
  return 'active';
}

/** True when this series still has occurrences from `fromDate` onwards. */
export function hasUpcomingWindow(goal: TrackedGoal, fromDate: Date = new Date()): boolean {
  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0);
  if (goal.endDate == null) return true;
  return parseYmdLocal(goal.endDate) >= from.getTime();
}

export function partitionByLifecycle(goals: TrackedGoal[]): {
  planned: TrackedGoal[];
  active: TrackedGoal[];
  completed: TrackedGoal[];
} {
  const planned: TrackedGoal[] = [];
  const active: TrackedGoal[] = [];
  const completed: TrackedGoal[] = [];
  for (const g of goals) {
    const l = deriveLifecycle(g);
    if (l === 'planned') planned.push(g);
    else if (l === 'active') active.push(g);
    else completed.push(g);
  }
  return { planned, active, completed };
}
