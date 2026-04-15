import { useEffect, useState } from 'react';

import { useActivityStore } from '@/stores/activityStore';
import { useAppStore } from '@/stores/appStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

const HYDRATION_FALLBACK_MS = 2500;

function allHydrated(): boolean {
  return (
    useAppStore.persist.hasHydrated() &&
    useGoalsStore.persist.hasHydrated() &&
    useActivityStore.persist.hasHydrated() &&
    usePreferencesStore.persist.hasHydrated()
  );
}

/**
 * Waits until persisted zustand state has rehydrated from AsyncStorage
 * so redirects don’t flash the wrong screen.
 * Includes a timeout fallback so a stuck rehydrate never blocks the app (e.g. emulator quirks).
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (allHydrated()) {
      setHydrated(true);
      return;
    }
    const trySet = () => {
      if (allHydrated()) setHydrated(true);
    };
    const unsub1 = useAppStore.persist.onFinishHydration(trySet);
    const unsub2 = useGoalsStore.persist.onFinishHydration(trySet);
    const unsub3 = useActivityStore.persist.onFinishHydration(trySet);
    const unsub4 = usePreferencesStore.persist.onFinishHydration(trySet);
    const t = setTimeout(() => setHydrated(true), HYDRATION_FALLBACK_MS);
    return () => {
      unsub1?.();
      unsub2?.();
      unsub3?.();
      unsub4?.();
      clearTimeout(t);
    };
  }, []);

  return hydrated;
}
