import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createDemoGoals } from '@/data/demoData';
import { createGoalRemote, fetchGoals, removeGoalRemote, updateGoalRemote } from '@/lib/api/goalsApi';
import type { TrackedGoal } from '@/types';
import { formatYmd, startOfTodayLocal } from '@/utils/goalLifecycle';

function nextId() {
  return `goal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Migrates persisted rows from older app versions. */
export function normalizeTrackedGoal(
  raw: Partial<TrackedGoal> & { id: string; title: string }
): TrackedGoal {
  const today = new Date(startOfTodayLocal());
  const defaultEnd = new Date(today);
  defaultEnd.setDate(defaultEnd.getDate() + 7);
  const ongoing = raw.ongoing ?? false;
  const endDate: string | null = ongoing
    ? raw.endDate ?? null
    : raw.endDate ?? formatYmd(defaultEnd);

  return {
    id: raw.id,
    title: raw.title,
    logged: raw.logged ?? '0h 0m',
    target: raw.target ?? '0h',
    progress: typeof raw.progress === 'number' ? raw.progress : 0,
    timerActive: raw.timerActive ?? false,
    cadence: raw.cadence ?? 'weekly',
    startDate: raw.startDate ?? formatYmd(today),
    endDate,
    ongoing,
    completedAt: raw.completedAt ?? null,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    scheduleStartMinutes:
      raw.scheduleStartMinutes !== undefined ? raw.scheduleStartMinutes : null,
    scheduleDurationMinutes:
      raw.scheduleDurationMinutes !== undefined ? raw.scheduleDurationMinutes : null,
    scheduleEndMinutes:
      raw.scheduleEndMinutes !== undefined ? raw.scheduleEndMinutes : null,
    excludedDates: Array.isArray(raw.excludedDates) ? raw.excludedDates : [],
  };
}

type GoalsState = {
  goals: TrackedGoal[];
  syncFromRemote: () => Promise<void>;
  toggleTimer: (id: string) => void;
  addGoal: (goal: Omit<TrackedGoal, 'id'> & { timerActive?: boolean }) => string;
  updateGoal: (id: string, patch: Partial<TrackedGoal>) => void;
  removeGoal: (id: string) => void;
  completeGoal: (id: string) => void;
  resetToDemo: () => void;
};

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: createDemoGoals(),
      syncFromRemote: async () => {
        try {
          let remoteGoals = await fetchGoals();
          const localGoals = get().goals;
          const hasOnlySeedGoals =
            localGoals.length > 0 && localGoals.every((goal) => goal.id.startsWith('demo-'));

          if (remoteGoals.length === 0 && localGoals.length > 0 && !hasOnlySeedGoals) {
            await Promise.all(localGoals.map((goal) => createGoalRemote(goal)));
            remoteGoals = await fetchGoals();
          }

          set({ goals: remoteGoals.map(normalizeTrackedGoal) });
        } catch {
          // no-op: keep local state if user is in demo mode/offline
        }
      },
      toggleTimer: (id) => {
        const goal = get().goals.find((g) => g.id === id);
        const nextTimerActive = goal ? !goal.timerActive : false;
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, timerActive: !g.timerActive } : g)),
        }));
        if (goal) {
          void updateGoalRemote(id, { timerActive: nextTimerActive }).catch(() => {
            void get().syncFromRemote();
          });
        }
      },
      addGoal: (goal) => {
        const id = nextId();
        const normalized = normalizeTrackedGoal({
          id,
          timerActive: goal.timerActive ?? false,
          title: goal.title,
          logged: goal.logged,
          target: goal.target,
          progress: goal.progress,
          cadence: goal.cadence,
          startDate: goal.startDate,
          endDate: goal.endDate,
          ongoing: goal.ongoing,
          completedAt: goal.completedAt ?? null,
          createdAt: goal.createdAt ?? new Date().toISOString(),
          scheduleStartMinutes: goal.scheduleStartMinutes,
          scheduleDurationMinutes: goal.scheduleDurationMinutes,
          scheduleEndMinutes: goal.scheduleEndMinutes,
          excludedDates: goal.excludedDates,
        });
        set((s) => ({
          goals: [...s.goals, normalized],
        }));
        void createGoalRemote(normalized).catch(() => {
          void get().syncFromRemote();
        });
        return id;
      },
      updateGoal: (id, patch) => {
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? ({ ...g, ...patch } as TrackedGoal) : g)),
        }));
        void updateGoalRemote(id, patch).catch(() => {
          void get().syncFromRemote();
        });
      },
      removeGoal: (id) => {
        set((s) => ({
          goals: s.goals.filter((g) => g.id !== id),
        }));
        void removeGoalRemote(id).catch(() => {
          void get().syncFromRemote();
        });
      },
      completeGoal: (id) => {
        const completedAt = new Date().toISOString();
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? { ...g, completedAt: new Date().toISOString(), timerActive: false }
              : g
          ),
        }));
        void updateGoalRemote(id, { completedAt, timerActive: false }).catch(() => {
          void get().syncFromRemote();
        });
      },
      resetToDemo: () => set({ goals: createDemoGoals() }),
    }),
    {
      name: 'planora-goals',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ goals: state.goals }),
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<GoalsState> | undefined;
        const rawGoals = p?.goals;
        const goals = Array.isArray(rawGoals)
          ? rawGoals.map((g) =>
              normalizeTrackedGoal(g as Partial<TrackedGoal> & { id: string; title: string })
            )
          : currentState.goals;
        return { ...currentState, goals };
      },
    }
  )
);
