import type { AnalyticsTimeframe } from '@/components/analytics/AnalyticsTimeframeBar';
import type { ArchivedItem, MissedItem } from '@/components/analytics/AnalyticsListCards';

export type ChartStack = { u: number; m: number };

const ARCHIVED: Record<AnalyticsTimeframe, ArchivedItem[]> = {
  DAY: [
    {
      id: 'a-d1',
      title: 'Design critique',
      meta: 'PRODUCT • 1.2H',
      badge: '+8% vs avg',
      badgeTone: 'success',
    },
    {
      id: 'a-d2',
      title: 'Email triage',
      meta: 'OPS • 0.4H',
      icon: 'checkmark',
    },
  ],
  WEEK: [
    {
      id: 'a-w1',
      title: 'Quarterly Finance Review',
      meta: 'PROJECT ALPHA • 3.5H',
      badge: '+12% Efficient',
      badgeTone: 'success',
    },
    {
      id: 'a-w2',
      title: 'Client Onboarding Flow',
      meta: 'SERVICE DESIGN • 1.2H',
      icon: 'checkmark',
    },
    {
      id: 'a-w3',
      title: 'System Documentation',
      meta: 'OPS • 2.0H',
      badge: 'Archived',
      badgeTone: 'neutral',
    },
  ],
  MONTH: [
    {
      id: 'a-m1',
      title: 'Roadmap Q2',
      meta: 'STRATEGY • 6.0H',
      badge: 'Complete',
      badgeTone: 'success',
    },
    {
      id: 'a-m2',
      title: 'Hiring loop',
      meta: 'PEOPLE • 2.5H',
      icon: 'checkmark',
    },
  ],
  '3 MONTH': [
    {
      id: 'a-q1',
      title: 'Annual planning',
      meta: 'LEADERSHIP • 12H',
      badge: '+18% focus',
      badgeTone: 'success',
    },
    {
      id: 'a-q2',
      title: 'Infrastructure upgrade',
      meta: 'ENGINEERING • 8.5H',
      icon: 'checkmark',
    },
    {
      id: 'a-q3',
      title: 'Research synthesis',
      meta: 'R&D • 4.0H',
      badge: 'Archived',
      badgeTone: 'neutral',
    },
  ],
};

const MISSED: Record<AnalyticsTimeframe, MissedItem[]> = {
  DAY: [
    {
      id: 'm-d1',
      title: 'Stand-up prep',
      meta: 'TEAM • -0.3H',
      badge: 'Slip',
      sub: 'Moved to 15:00',
    },
  ],
  WEEK: [
    {
      id: 'm-w1',
      title: 'Database Optimization',
      meta: 'TECH DEBT • -1.5H DEFICIT',
      badge: 'Delayed',
      sub: 'Pushed to tomorrow 09:00',
    },
    {
      id: 'm-w2',
      title: 'Team Feedback Loop',
      meta: 'LEADERSHIP • -0.8H DEFICIT',
      icon: 'alert',
    },
  ],
  MONTH: [
    {
      id: 'm-m1',
      title: 'Budget review',
      meta: 'FINANCE • -2.1H',
      badge: 'Rescheduled',
    },
    {
      id: 'm-m2',
      title: 'Vendor calls',
      meta: 'OPS • -1.0H',
      icon: 'alert',
    },
  ],
  '3 MONTH': [
    {
      id: 'm-q1',
      title: 'Certification course',
      meta: 'SKILLS • -6H',
      badge: 'Deferred',
      sub: 'Revisit next quarter',
    },
  ],
};

const INSIGHTS: Record<AnalyticsTimeframe, string> = {
  DAY:
    'Your peak focus occurs between 12:00 and 13:30. Consider scheduling high-value Deep Work during this window.',
  WEEK:
    'Mid-week blocks show the highest utilization. Front-load harder work on Tuesday–Wednesday next week.',
  MONTH:
    'You recovered 14% more missed time in the last two weeks than in the first half of the month.',
  '3 MONTH':
    'Long-horizon goals with weekly check-ins are 22% more likely to stay green—keep the cadence.',
};

const CHARTS: Record<AnalyticsTimeframe, ChartStack[]> = {
  DAY: [
    { u: 0.42, m: 0.12 },
    { u: 0.55, m: 0.18 },
    { u: 0.62, m: 0.08 },
    { u: 0.5, m: 0.22 },
    { u: 0.38, m: 0.15 },
    { u: 0.28, m: 0.1 },
  ],
  WEEK: [
    { u: 0.5, m: 0.1 },
    { u: 0.58, m: 0.14 },
    { u: 0.48, m: 0.2 },
    { u: 0.52, m: 0.12 },
    { u: 0.45, m: 0.18 },
    { u: 0.4, m: 0.16 },
  ],
  MONTH: [
    { u: 0.55, m: 0.08 },
    { u: 0.52, m: 0.1 },
    { u: 0.6, m: 0.06 },
    { u: 0.5, m: 0.14 },
    { u: 0.47, m: 0.12 },
    { u: 0.44, m: 0.1 },
  ],
  '3 MONTH': [
    { u: 0.48, m: 0.06 },
    { u: 0.5, m: 0.08 },
    { u: 0.54, m: 0.05 },
    { u: 0.52, m: 0.07 },
    { u: 0.5, m: 0.06 },
    { u: 0.46, m: 0.08 },
  ],
};

export function getAnalyticsBundle(tf: AnalyticsTimeframe) {
  const score =
    tf === 'DAY' ? 84.3 : tf === 'WEEK' ? 81.1 : tf === 'MONTH' ? 78.6 : 76.2;
  const utilized = tf === 'DAY' ? 14.2 : tf === 'WEEK' ? 62.4 : tf === 'MONTH' ? 118.0 : 410.0;
  const missed = tf === 'DAY' ? 2.8 : tf === 'WEEK' ? 9.1 : tf === 'MONTH' ? 24.5 : 88.0;

  return {
    score,
    utilizedHours: utilized,
    missedHours: missed,
    insight: INSIGHTS[tf],
    archived: ARCHIVED[tf],
    missed: MISSED[tf],
    chartStacks: CHARTS[tf],
  };
}
