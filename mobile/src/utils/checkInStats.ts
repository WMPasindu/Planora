import type { TrackedGoal } from '@/types';

import type { CheckIn } from '@/stores/activityStore';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** Consecutive days with at least one check-in (anchored at today if present, else yesterday). */
export function computeStreak(checkIns: CheckIn[]): number {
  if (checkIns.length === 0) return 0;
  const days = new Set<number>();
  for (const c of checkIns) {
    days.add(startOfLocalDay(new Date(c.createdAt)));
  }
  let streak = 0;
  let cursor = startOfLocalDay(new Date());
  if (!days.has(cursor)) {
    cursor -= DAY_MS;
  }
  while (days.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

export type WeekDot = { id: string; label: string; done: boolean };

/** Current week Mon–Sun, whether a check-in exists on that calendar day. */
export function getWeekDots(checkIns: CheckIn[]): WeekDot[] {
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const daysWithCheckIn = new Set<number>();
  for (const c of checkIns) {
    daysWithCheckIn.add(startOfLocalDay(new Date(c.createdAt)));
  }

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const t = startOfLocalDay(d);
    return {
      id: `w-${i}`,
      label,
      done: daysWithCheckIn.has(t),
    };
  });
}

/** Lightweight score for the Goals hub metric tile (local-only). */
export function computeHubScore(
  goals: TrackedGoal[],
  streak: number,
  checkInCount: number
): number {
  const avgP = goals.length ? goals.reduce((s, g) => s + g.progress, 0) / goals.length : 0;
  const raw = avgP * 55 + streak * 6 + Math.min(18, checkInCount * 1.5);
  return Math.min(99, Math.max(40, Math.round(raw * 10) / 10));
}

export function countCheckInsThisWeek(checkIns: CheckIn[]): number {
  const now = new Date();
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);
  const t0 = monday.getTime();
  let n = 0;
  for (const c of checkIns) {
    if (new Date(c.createdAt).getTime() >= t0) n += 1;
  }
  return n;
}
