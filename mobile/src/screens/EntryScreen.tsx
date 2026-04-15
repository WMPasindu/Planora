import { Redirect } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useHydration } from '@/hooks';
import { routes } from '@/navigation';
import { useActivityStore } from '@/stores/activityStore';
import { useAppStore } from '@/stores/appStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { theme } from '@/theme';

/**
 * App entry: persisted store hydration, then route to onboarding / auth / main.
 */
export function EntryScreen() {
  const hydrated = useHydration();
  const authBootstrapped = useAppStore((s) => s.authBootstrapped);
  const bootstrapAuthSession = useAppStore((s) => s.bootstrapAuthSession);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const emailVerified = useAppStore((s) => s.emailVerified);
  const syncGoals = useGoalsStore((s) => s.syncFromRemote);
  const syncCheckIns = useActivityStore((s) => s.syncFromRemote);
  const syncPreferences = usePreferencesStore((s) => s.syncFromRemote);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!hydrated || authBootstrapped) return;
    void bootstrapAuthSession();
  }, [authBootstrapped, bootstrapAuthSession, hydrated]);

  useEffect(() => {
    if (!hydrated || !authBootstrapped || !isAuthenticated || hasSyncedRef.current) return;
    hasSyncedRef.current = true;
    void Promise.all([syncGoals(), syncCheckIns(), syncPreferences()]);
  }, [authBootstrapped, hydrated, isAuthenticated, syncCheckIns, syncGoals, syncPreferences]);

  if (!hydrated || !authBootstrapped) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href={routes.onboarding} />;
  }
  if (!isAuthenticated) {
    return <Redirect href={routes.auth.login} />;
  }
  if (!emailVerified) {
    return <Redirect href={routes.auth.verification} />;
  }
  return <Redirect href={routes.main.dashboard} />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
});
