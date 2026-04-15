import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { fetchPreferences, savePreferences } from '@/lib/api/preferencesApi';

export type CheckInFrequency = 'daily' | 'weekly' | 'weekdays';
export type ThemePreference = 'light' | 'dark' | 'system';

type PreferencesState = {
  achievementAlerts: boolean;
  missedGapAlerts: boolean;
  checkInFrequency: CheckInFrequency;
  dailyAccountability: boolean;
  weeklySummary: boolean;
  customGoalReminders: boolean;
  deepFocusMode: boolean;
  reflectionHour: number;
  reflectionMinute: number;
  lastSyncAt: number | null;
  themePreference: ThemePreference;
  syncFromRemote: () => Promise<void>;
  setAchievementAlerts: (v: boolean) => void;
  setMissedGapAlerts: (v: boolean) => void;
  setCheckInFrequency: (v: CheckInFrequency) => void;
  setDailyAccountability: (v: boolean) => void;
  setWeeklySummary: (v: boolean) => void;
  setCustomGoalReminders: (v: boolean) => void;
  setDeepFocusMode: (v: boolean) => void;
  setReflectionTime: (hour: number, minute: number) => void;
  touchSync: () => void;
  setThemePreference: (v: ThemePreference) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      achievementAlerts: true,
      missedGapAlerts: false,
      checkInFrequency: 'daily',
      dailyAccountability: true,
      weeklySummary: true,
      customGoalReminders: false,
      deepFocusMode: true,
      reflectionHour: 20,
      reflectionMinute: 0,
      lastSyncAt: null,
      themePreference: 'light',
      syncFromRemote: async () => {
        try {
          const prefs = await fetchPreferences();
          if (!prefs) return;
          set({
            achievementAlerts: prefs.achievementAlerts,
            missedGapAlerts: prefs.missedGapAlerts,
            checkInFrequency: prefs.checkInFrequency,
            dailyAccountability: prefs.dailyAccountability,
            weeklySummary: prefs.weeklySummary,
            customGoalReminders: prefs.customGoalReminders,
            deepFocusMode: prefs.deepFocusMode,
            reflectionHour: prefs.reflectionHour,
            reflectionMinute: prefs.reflectionMinute,
            themePreference: prefs.themePreference,
            lastSyncAt: prefs.lastSyncAt,
          });
        } catch {
          // keep local state in demo/offline mode
        }
      },
      setAchievementAlerts: (achievementAlerts) => {
        set({ achievementAlerts });
        void pushPreferences(get);
      },
      setMissedGapAlerts: (missedGapAlerts) => {
        set({ missedGapAlerts });
        void pushPreferences(get);
      },
      setCheckInFrequency: (checkInFrequency) => {
        set({ checkInFrequency });
        void pushPreferences(get);
      },
      setDailyAccountability: (dailyAccountability) => {
        set({ dailyAccountability });
        void pushPreferences(get);
      },
      setWeeklySummary: (weeklySummary) => {
        set({ weeklySummary });
        void pushPreferences(get);
      },
      setCustomGoalReminders: (customGoalReminders) => {
        set({ customGoalReminders });
        void pushPreferences(get);
      },
      setDeepFocusMode: (deepFocusMode) => {
        set({ deepFocusMode });
        void pushPreferences(get);
      },
      setReflectionTime: (reflectionHour, reflectionMinute) => {
        set({ reflectionHour, reflectionMinute });
        void pushPreferences(get);
      },
      touchSync: () => {
        set({ lastSyncAt: Date.now() });
        void pushPreferences(get);
      },
      setThemePreference: (themePreference) => {
        set({ themePreference });
        void pushPreferences(get);
      },
    }),
    {
      name: 'planora-prefs',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

async function pushPreferences(get: () => PreferencesState): Promise<void> {
  const state = get();
  try {
    await savePreferences({
      achievementAlerts: state.achievementAlerts,
      missedGapAlerts: state.missedGapAlerts,
      dailyAccountability: state.dailyAccountability,
      weeklySummary: state.weeklySummary,
      customGoalReminders: state.customGoalReminders,
      deepFocusMode: state.deepFocusMode,
      reflectionHour: state.reflectionHour,
      reflectionMinute: state.reflectionMinute,
      checkInFrequency: state.checkInFrequency,
      themePreference: state.themePreference,
      lastSyncAt: state.lastSyncAt,
    });
  } catch {
    // no-op
  }
}
