import type { CheckInFrequency, ThemePreference } from '@/stores/preferencesStore';

import { apiRequest } from './client';

export type RemotePreferences = {
  achievementAlerts: boolean;
  missedGapAlerts: boolean;
  dailyAccountability: boolean;
  weeklySummary: boolean;
  customGoalReminders: boolean;
  deepFocusMode: boolean;
  reflectionHour: number;
  reflectionMinute: number;
  checkInFrequency: CheckInFrequency;
  themePreference: ThemePreference;
  lastSyncAt: number | null;
};

export async function fetchPreferences(): Promise<RemotePreferences | null> {
  const data = await apiRequest<{
    app: Record<string, unknown> | null;
    notifications: Record<string, unknown> | null;
  }>('/v1/preferences');
  const appData = data.app;
  const notifData = data.notifications;
  if (!appData || !notifData) return null;

  return {
    achievementAlerts: Boolean(appData.achievement_alerts),
    missedGapAlerts: Boolean(appData.missed_gap_alerts),
    dailyAccountability: Boolean(notifData.daily_accountability),
    weeklySummary: Boolean(notifData.weekly_summary),
    customGoalReminders: Boolean(notifData.custom_goal_reminders),
    deepFocusMode: Boolean(notifData.deep_focus_mode),
    reflectionHour: Number(notifData.reflection_hour ?? 20),
    reflectionMinute: Number(notifData.reflection_minute ?? 0),
    checkInFrequency: (notifData.check_in_frequency as CheckInFrequency) ?? 'daily',
    themePreference: (appData.theme_preference as ThemePreference) ?? 'light',
    lastSyncAt: appData.last_sync_at ? new Date(String(appData.last_sync_at)).getTime() : null,
  };
}

export async function savePreferences(prefs: RemotePreferences): Promise<void> {
  await apiRequest('/v1/preferences', {
    method: 'PUT',
    body: {
      app: {
        achievementAlerts: prefs.achievementAlerts,
        missedGapAlerts: prefs.missedGapAlerts,
        themePreference: prefs.themePreference,
        lastSyncAt: prefs.lastSyncAt ? new Date(prefs.lastSyncAt).toISOString() : null,
      },
      notifications: {
        dailyAccountability: prefs.dailyAccountability,
        weeklySummary: prefs.weeklySummary,
        customGoalReminders: prefs.customGoalReminders,
        deepFocusMode: prefs.deepFocusMode,
        reflectionHour: prefs.reflectionHour,
        reflectionMinute: prefs.reflectionMinute,
        checkInFrequency: prefs.checkInFrequency,
      },
    },
  });
}

