import type { TimeframeKey } from '@/components/dashboard/TimeframeTabs';

export type DashboardUtilization = {
  dayCapacityH: number;
  loggedH: number;
  plannedH: number;
  loggedLabel: string;
  plannedLabel: string;
  missedTitle: string;
  missedBody: string;
  goalsHeading: string;
  showLiveBadge: boolean;
};

function fmtHours(h: number): string {
  const whole = Math.floor(h);
  const m = Math.round((h - whole) * 60);
  if (m === 0) return `${whole}h`;
  return `${whole}h ${m}m`;
}

/** Deterministic mock utilization per dashboard tab (no backend yet). */
export function getDashboardUtilization(tf: TimeframeKey): DashboardUtilization {
  switch (tf) {
    case 'Day':
      return {
        dayCapacityH: 12,
        loggedH: 5.5,
        plannedH: 2.5,
        loggedLabel: fmtHours(5.5),
        plannedLabel: fmtHours(2.5),
        missedTitle: "Yesterday's Coding Gap: 1.5 hours",
        missedBody:
          "Your evening session was shorter than planned. You can redistribute this time to tomorrow's schedule.",
        goalsHeading: "Today's Active Goals",
        showLiveBadge: true,
      };
    case 'Week':
      return {
        dayCapacityH: 40,
        loggedH: 28,
        plannedH: 12,
        loggedLabel: fmtHours(28),
        plannedLabel: fmtHours(12),
        missedTitle: 'Weekly gap: 4.5 hours under target',
        missedBody:
          'Your deep-work blocks clustered mid-week. Try protecting two longer sessions next week.',
        goalsHeading: "This Week's Active Goals",
        showLiveBadge: false,
      };
    case 'Month':
      return {
        dayCapacityH: 160,
        loggedH: 112,
        plannedH: 36,
        loggedLabel: fmtHours(112),
        plannedLabel: fmtHours(36),
        missedTitle: 'Monthly rhythm: steady progress',
        missedBody:
          'You logged more focus time in the second half of the month. Keep the same guardrails going forward.',
        goalsHeading: 'This Month’s Focus',
        showLiveBadge: false,
      };
    case 'All Goals':
    default:
      return {
        dayCapacityH: 200,
        loggedH: 142,
        plannedH: 38,
        loggedLabel: fmtHours(142),
        plannedLabel: fmtHours(38),
        missedTitle: 'Across all goals: time to redistribute',
        missedBody:
          'One initiative is pulling most of your hours. Consider balancing toward your secondary goals.',
        goalsHeading: 'All Active Goals',
        showLiveBadge: false,
      };
  }
}
