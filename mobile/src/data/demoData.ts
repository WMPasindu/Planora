import type { TrackedGoal, User } from '@/types';
import { formatYmd, startOfTodayLocal } from '@/utils/goalLifecycle';

/** Pre-filled user for one-tap “Try demo” on the login screen. */
export const DEMO_USER: User = {
  id: 'demo-user',
  email: 'demo@planora.app',
  displayName: 'Alex Morgan',
};

export function createDemoGoals(): TrackedGoal[] {
  const t0 = startOfTodayLocal();
  const started = new Date(t0);
  started.setDate(started.getDate() - 14);
  const startsFuture = new Date(t0);
  startsFuture.setDate(startsFuture.getDate() + 4);
  const endsInMonth = new Date(t0);
  endsInMonth.setDate(endsInMonth.getDate() + 28);
  const ended = new Date(t0);
  ended.setDate(ended.getDate() - 3);

  const created = new Date(t0 - 20 * 86400000).toISOString();

  return [
    {
      id: 'demo-1',
      title: 'Learning Python',
      logged: '2h 15m',
      target: '5h',
      progress: 0.45,
      timerActive: true,
      cadence: 'weekly',
      startDate: formatYmd(started),
      endDate: formatYmd(endsInMonth),
      ongoing: false,
      completedAt: null,
      createdAt: created,
      scheduleStartMinutes: null,
      scheduleDurationMinutes: null,
      scheduleEndMinutes: null,
    },
    {
      id: 'demo-2',
      title: 'UX Case Study',
      logged: '0h 0m',
      target: '3h',
      progress: 0,
      timerActive: false,
      cadence: 'weekly',
      startDate: formatYmd(startsFuture),
      endDate: formatYmd(endsInMonth),
      ongoing: false,
      completedAt: null,
      createdAt: created,
      scheduleStartMinutes: 9 * 60,
      scheduleDurationMinutes: 60,
      scheduleEndMinutes: 10 * 60,
    },
    {
      id: 'demo-3',
      title: 'Morning Mobility',
      logged: '0h 20m',
      target: '1h',
      progress: 1,
      timerActive: false,
      cadence: 'daily',
      startDate: formatYmd(new Date(t0 - 21 * 86400000)),
      endDate: formatYmd(ended),
      ongoing: false,
      completedAt: null,
      createdAt: created,
      scheduleStartMinutes: null,
      scheduleDurationMinutes: null,
      scheduleEndMinutes: null,
    },
  ];
}
