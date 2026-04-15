import type {
  CheckInFrequency,
  ThemePreference,
} from '@/stores/preferencesStore';

import { getCurrentUserId, supabase } from '@/lib/supabase/client';

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
  const userId = await getCurrentUserId();

  const [{ data: appData, error: appErr }, { data: notifData, error: notifErr }] = await Promise.all([
    supabase.from('app_preferences').select('*').eq('user_id', userId).single(),
    supabase.from('notification_preferences').select('*').eq('user_id', userId).single(),
  ]);
  if (appErr) throw appErr;
  if (notifErr) throw notifErr;
  if (!appData || !notifData) return null;

  return {
    achievementAlerts: appData.achievement_alerts,
    missedGapAlerts: appData.missed_gap_alerts,
    dailyAccountability: notifData.daily_accountability,
    weeklySummary: notifData.weekly_summary,
    customGoalReminders: notifData.custom_goal_reminders,
    deepFocusMode: notifData.deep_focus_mode,
    reflectionHour: notifData.reflection_hour,
    reflectionMinute: notifData.reflection_minute,
    checkInFrequency: notifData.check_in_frequency,
    themePreference: appData.theme_preference,
    lastSyncAt: appData.last_sync_at ? new Date(appData.last_sync_at).getTime() : null,
  };
}

export async function savePreferences(prefs: RemotePreferences): Promise<void> {
  const userId = await getCurrentUserId();

  const [{ error: appErr }, { error: notifErr }] = await Promise.all([
    supabase.from('app_preferences').upsert({
      user_id: userId,
      achievement_alerts: prefs.achievementAlerts,
      missed_gap_alerts: prefs.missedGapAlerts,
      theme_preference: prefs.themePreference,
      last_sync_at: prefs.lastSyncAt ? new Date(prefs.lastSyncAt).toISOString() : null,
    }),
    supabase.from('notification_preferences').upsert({
      user_id: userId,
      daily_accountability: prefs.dailyAccountability,
      weekly_summary: prefs.weeklySummary,
      custom_goal_reminders: prefs.customGoalReminders,
      deep_focus_mode: prefs.deepFocusMode,
      reflection_hour: prefs.reflectionHour,
      reflection_minute: prefs.reflectionMinute,
      check_in_frequency: prefs.checkInFrequency,
    }),
  ]);

  if (appErr) throw appErr;
  if (notifErr) throw notifErr;
}

