import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AnimatedScreen,
  Avatar,
  PlanoraScreenHeader,
  SettingsBadgeRow,
  SettingsCard,
  type AppDialogAction,
  AppDialog,
  SettingsLinkRow,
  SettingsSectionLabel,
  SettingsSyncRow,
  SettingsToggleRow,
  SettingsValueRow,
  Text,
} from '@/components';
import { signOutRemote } from '@/lib/api/authApi';
import { requestPasswordReset } from '@/lib/api/profileApi';
import { fetchSubscription, type SubscriptionSnapshot } from '@/lib/api/subscriptionsApi';
import { useAppNavigation } from '@/navigation';
import { useAppStore } from '@/stores/appStore';
import type { CheckInFrequency, ThemePreference } from '@/stores/preferencesStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { theme } from '@/theme';
import { formatRelativeSync } from '@/utils/formatSync';

function frequencyLabel(f: CheckInFrequency): string {
  switch (f) {
    case 'daily':
      return 'Daily';
    case 'weekly':
      return 'Weekly';
    case 'weekdays':
      return 'Weekdays';
    default:
      return 'Daily';
  }
}

export function SettingsScreen() {
  const { replaceToLogin, openProfile, openNotifications } = useAppNavigation();
  const signOut = useAppStore((s) => s.signOut);
  const user = useAppStore((s) => s.user);

  const achievementAlerts = usePreferencesStore((s) => s.achievementAlerts);
  const missedGapAlerts = usePreferencesStore((s) => s.missedGapAlerts);
  const checkInFrequency = usePreferencesStore((s) => s.checkInFrequency);
  const lastSyncAt = usePreferencesStore((s) => s.lastSyncAt);
  const themePreference = usePreferencesStore((s) => s.themePreference);
  const setAchievementAlerts = usePreferencesStore((s) => s.setAchievementAlerts);
  const setMissedGapAlerts = usePreferencesStore((s) => s.setMissedGapAlerts);
  const touchSync = usePreferencesStore((s) => s.touchSync);
  const setThemePreference = usePreferencesStore((s) => s.setThemePreference);
  const [subscription, setSubscription] = useState<SubscriptionSnapshot | null>(null);
  const [dialog, setDialog] = useState<{
    title: string;
    message?: string;
    actions?: AppDialogAction[];
  } | null>(null);

  useEffect(() => {
    void fetchSubscription()
      .then(setSubscription)
      .catch(() => setSubscription(null));
  }, []);

  const confirmSignOut = () => {
    setDialog({
      title: 'Sign out?',
      message: 'You will need to sign in again to access your account.',
      actions: [
        { label: 'Cancel' },
        {
          label: 'Sign out',
          variant: 'destructive',
          onPress: async () => {
            await signOutRemote().catch(() => {});
            signOut();
            replaceToLogin();
          },
        },
      ],
    });
  };

  function pickTheme() {
    setDialog({
      title: 'Theme',
      message: 'Choose how Planora should look.',
      actions: [
        { label: 'Light', onPress: () => setThemePreference('light') },
        { label: 'Dark', onPress: () => setThemePreference('dark') },
        { label: 'Match system', onPress: () => setThemePreference('system') },
        { label: 'Cancel' },
      ],
    });
  }

  const themeLabel = (t: ThemePreference): string => {
    if (t === 'light') return 'Light';
    if (t === 'dark') return 'Dark';
    return 'System';
  };

  const displayName = user?.displayName ?? 'Alex Thompson';
  const email = user?.email ?? 'alex.t@planora.app';

  return (
    <AnimatedScreen tabBarPadding>
      <View>
        <PlanoraScreenHeader
          leading="avatar"
          onLeadingPress={openProfile}
          avatarName={user?.displayName ?? undefined}
          avatarEmail={user?.email ?? undefined}
          onBellPress={openNotifications}
        />

        <Text variant="largeTitle" style={styles.pageTitle}>
          Settings
        </Text>
        <Text variant="bodySmall" color="onSurfaceVariant" style={styles.subtitle}>
          Preferences and account
        </Text>

        <Pressable
          style={styles.profileCard}
          accessibilityRole="button"
          onPress={openProfile}
        >
          <Avatar name={user?.displayName} email={user?.email} size={56} />
          <View style={styles.profileCopy}>
            <Text variant="title" style={styles.profileName}>
              {displayName}
            </Text>
            <Text variant="footnote" color="onSurfaceVariant">
              {email}
            </Text>
          </View>
          <Text variant="caption" color="onSurfaceVariant" style={styles.proHint}>
            Pro
          </Text>
        </Pressable>

        <SettingsSectionLabel>Account</SettingsSectionLabel>
        <SettingsCard>
          <SettingsLinkRow icon="person-outline" title="Profile" onPress={openProfile} showDivider />
          <SettingsLinkRow
            icon="lock-closed-outline"
            title="Change Password"
            onPress={async () => {
              if (!user?.email) {
                setDialog({
                  title: 'Password reset unavailable',
                  message: 'Add an email to your profile first.',
                });
                return;
              }
              await requestPasswordReset(user.email)
                .then(() =>
                  setDialog({
                    title: 'Password reset sent',
                    message: 'Check your inbox and follow the reset link.',
                  })
                )
                .catch((error: unknown) => {
                  const message =
                    error instanceof Error ? error.message : 'Unable to send reset email right now.';
                  setDialog({ title: 'Password reset failed', message });
                });
            }}
            showDivider
          />
          <SettingsLinkRow
            icon="star-outline"
            title="Plan (Pro)"
            onPress={() => {
              const plan = subscription?.planCode?.toUpperCase() ?? 'PRO';
              const status = subscription?.status ?? 'active';
              setDialog({ title: 'Current plan', message: `${plan}\nStatus: ${status}` });
            }}
            showDivider={false}
          />
        </SettingsCard>

        <SettingsSectionLabel>Notifications</SettingsSectionLabel>
        <SettingsCard>
          <SettingsBadgeRow
            icon="time-outline"
            title="Check-in frequency"
            badge={frequencyLabel(checkInFrequency)}
            onPress={openNotifications}
            showDivider
          />
          <SettingsToggleRow
            icon="trophy-outline"
            title="Achievement alerts"
            value={achievementAlerts}
            onValueChange={setAchievementAlerts}
            showDivider
          />
          <SettingsToggleRow
            icon="warning-outline"
            title="Missed gap alerts"
            value={missedGapAlerts}
            onValueChange={setMissedGapAlerts}
            showDivider={false}
          />
        </SettingsCard>

        <SettingsSectionLabel>System</SettingsSectionLabel>
        <SettingsCard>
          <SettingsSyncRow
            icon="sync-outline"
            title="Data sync"
            subtitle={formatRelativeSync(lastSyncAt)}
            onPress={() => {
              touchSync();
            }}
            showDivider
          />
          <SettingsValueRow
            icon="color-palette-outline"
            title="Theme"
            value={themeLabel(themePreference)}
            showDivider
            onPress={pickTheme}
          />
          <SettingsBadgeRow
            icon="cloud-upload-outline"
            title="Export data"
            badge="Pro"
            showChevron={false}
            showDivider={false}
            onPress={() => {
              setDialog({
                title: 'Export data',
                message:
                  'Exports currently include local device data. Full cloud exports are coming soon.',
              });
            }}
          />
        </SettingsCard>

        <SettingsSectionLabel>Help</SettingsSectionLabel>
        <SettingsCard>
          <SettingsLinkRow
            icon="help-circle-outline"
            title="Contact support"
            onPress={() => setDialog({ title: 'Contact support', message: 'Email support@planora.app' })}
            showDivider
          />
          <SettingsLinkRow
            icon="shield-checkmark-outline"
            title="Privacy policy"
            onPress={() => {
              setDialog({
                title: 'Privacy',
                message:
                  'Preferences and activity stay local until your account syncs.',
              });
            }}
            showDivider={false}
          />
        </SettingsCard>

        <Pressable
          onPress={confirmSignOut}
          style={styles.signOut}
          accessibilityRole="button"
        >
          <Text variant="body" color="error" style={styles.signOutText}>
            Sign out
          </Text>
        </Pressable>

        <Text variant="footnote" color="onSurfaceVariant" style={styles.version}>
          Planora v1.0.0
        </Text>
      </View>
      <AppDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        actions={dialog?.actions}
        onClose={() => setDialog(null)}
      />
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondaryGroupedBackground,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.outlineVariant,
  },
  profileCopy: { flex: 1, gap: 4 },
  profileName: { fontWeight: '600' },
  proHint: {
    fontWeight: '600',
  },
  signOut: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.outlineVariant,
  },
  signOutText: {
    fontWeight: '600',
  },
  version: { textAlign: 'center', marginBottom: theme.spacing.sm },
});
