export type UserId = string;

export interface User {
  id: UserId;
  email: string;
  displayName?: string;
}

export type GoalTimeframe = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Goal {
  id: string;
  title: string;
  notes?: string;
  timeframe: GoalTimeframe;
  targetDate?: string;
  createdAt: string;
  progress: number;
}

export type GoalCadence = 'daily' | 'weekly' | 'monthly';

/** Derived from dates + completedAt (see `deriveLifecycle`). */
export type GoalLifecycle = 'planned' | 'active' | 'completed';

/** Runtime row for dashboard / hub cards (logged time + timer toggle). */
export interface TrackedGoal {
  id: string;
  title: string;
  logged: string;
  target: string;
  progress: number;
  timerActive: boolean;
  cadence: GoalCadence;
  /** Local calendar day YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD when not ongoing; null means open-ended */
  endDate: string | null;
  ongoing: boolean;
  /** Set when user marks complete; also treated complete when past end (non-ongoing). */
  completedAt: string | null;
  createdAt: string;
  /** Allocated block on scheduled days: minutes from midnight; null = no fixed clock time */
  scheduleStartMinutes: number | null;
  scheduleDurationMinutes: number | null;
  /** start + duration, same day (≤ 24h total from start) */
  scheduleEndMinutes: number | null;
  /** Dates skipped from recurring series (YYYY-MM-DD). */
  excludedDates?: string[];
}

export type NotificationChannel = 'push' | 'email' | 'in_app';

export interface NotificationPreference {
  channel: NotificationChannel;
  enabled: boolean;
}
