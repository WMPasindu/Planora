export type GoalCadence = 'daily' | 'weekly' | 'monthly';
export type CheckInFrequency = 'daily' | 'weekly' | 'weekdays';
export type ThemePreference = 'light' | 'dark' | 'system';

export type User = {
  id: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: string;
};

export type TrackedGoal = {
  id: string;
  userId: string;
  title: string;
  logged: string;
  target: string;
  progress: number;
  timerActive: boolean;
  cadence: GoalCadence;
  startDate: string;
  endDate: string | null;
  ongoing: boolean;
  completedAt: string | null;
  createdAt: string;
  scheduleStartMinutes: number | null;
  scheduleDurationMinutes: number | null;
  scheduleEndMinutes: number | null;
  excludedDates: string[];
};

export type CheckIn = {
  id: string;
  userId: string;
  note: string;
  createdAt: string;
};

export type NotificationPreferences = {
  userId: string;
  dailyAccountability: boolean;
  weeklySummary: boolean;
  customGoalReminders: boolean;
  deepFocusMode: boolean;
  reflectionHour: number;
  reflectionMinute: number;
  checkInFrequency: CheckInFrequency;
};

export type AppPreferences = {
  userId: string;
  achievementAlerts: boolean;
  missedGapAlerts: boolean;
  themePreference: ThemePreference;
  lastSyncAt: string | null;
};

export type SubscriptionSnapshot = {
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'inactive';
  planCode: string | null;
  currentPeriodEnd: string | null;
};

