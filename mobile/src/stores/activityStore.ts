import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { createCheckInRemote, fetchCheckIns } from '@/lib/api/checkInsApi';

export type CheckIn = {
  id: string;
  /** User note (may be empty). */
  note: string;
  createdAt: string;
};

function nextId() {
  return `ci-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function seedCheckIns(): CheckIn[] {
  const now = Date.now();
  const h = 60 * 60 * 1000;
  return [
    {
      id: 'seed-1',
      note: 'Meditation Session',
      createdAt: new Date(now - 1.5 * h).toISOString(),
    },
    {
      id: 'seed-2',
      note: 'Deep Work Block',
      createdAt: new Date(now - 2.25 * h).toISOString(),
    },
    {
      id: 'seed-3',
      note: 'Learning Python',
      createdAt: new Date(now - 3.75 * h).toISOString(),
    },
  ];
}

type ActivityState = {
  checkIns: CheckIn[];
  syncFromRemote: () => Promise<void>;
  addCheckIn: (note: string) => void;
  resetToDemo: () => void;
};

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      checkIns: seedCheckIns(),
      syncFromRemote: async () => {
        try {
          let remote = await fetchCheckIns();
          const local = get().checkIns;
          const hasOnlySeedRows = local.length > 0 && local.every((item) => item.id.startsWith('seed-'));

          if (remote.length === 0 && local.length > 0 && !hasOnlySeedRows) {
            await Promise.all(local.map((item) => createCheckInRemote(item)));
            remote = await fetchCheckIns();
          }

          set({ checkIns: remote });
        } catch {
          // keep local values for demo/offline flows
        }
      },
      addCheckIn: (note) =>
        set((s) => {
          const item = { id: nextId(), note: note.trim(), createdAt: new Date().toISOString() };
          void createCheckInRemote(item).catch(() => {});
          return { checkIns: [item, ...s.checkIns] };
        }),
      resetToDemo: () => set({ checkIns: seedCheckIns() }),
    }),
    {
      name: 'planora-activity',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ checkIns: state.checkIns }),
    }
  )
);
