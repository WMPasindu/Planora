import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AnimatedScreen, AppDialog, Avatar, PlanoraScreenHeader, Text } from '@/components';
import { useAppNavigation } from '@/navigation';
import { useAppStore } from '@/stores/appStore';
import { theme } from '@/theme';

export function ProfileScreen() {
  const { goBack, openNotifications } = useAppNavigation();
  const user = useAppStore((s) => s.user);
  const [dialog, setDialog] = useState<{ title: string; message?: string } | null>(null);

  const name = user?.displayName ?? 'Planora member';
  const email = user?.email ?? 'Not signed in with email';

  return (
    <AnimatedScreen tabBarPadding={false} scroll safeAreaEdges={['top', 'left', 'right', 'bottom']}>
      <View>
        <PlanoraScreenHeader
          leading="back"
          onLeadingPress={goBack}
          onBellPress={openNotifications}
        />
        <Text variant="largeTitle" style={styles.pageTitle}>
          Profile
        </Text>

        <View style={styles.hero}>
          <Avatar name={user?.displayName} email={user?.email} size={96} />
          <Text variant="title" style={styles.name}>
            {name}
          </Text>
          <Text variant="bodySmall" color="onSurfaceVariant" style={styles.email}>
            {email}
          </Text>
          <View style={styles.proBadge}>
            <Text variant="caption" style={styles.proText}>
              PRO MEMBER
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <ProfileRow
            icon="person-outline"
            label="Personal information"
            onPress={() =>
              setDialog({
                title: 'Personal information',
                message:
                  'Name and email editing is available after full account sync. Use Settings for notification preferences.',
              })
            }
          />
          <ProfileRow
            icon="notifications-outline"
            label="Notifications"
            onPress={openNotifications}
          />
          <ProfileRow
            icon="shield-checkmark-outline"
            label="Privacy & security"
            showDivider={false}
            onPress={() =>
              setDialog({
                title: 'Privacy & security',
                message: 'Your activity stays on this device until cloud backup is enabled.',
              })
            }
          />
        </View>

        <Text variant="footnote" color="onSurfaceVariant" style={styles.hint}>
          Manage your account details and preferences. Deeper settings live in the Settings tab.
        </Text>
      </View>
      <AppDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        onClose={() => setDialog(null)}
      />
    </AnimatedScreen>
  );
}

function ProfileRow({
  icon,
  label,
  showDivider = true,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  showDivider?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={[styles.row, showDivider && styles.rowDivider]}
      accessibilityRole="button"
      onPress={onPress ?? (() => {})}
    >
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <Text variant="body" style={styles.rowLabel}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={theme.colors.outline} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    marginBottom: theme.spacing.lg,
    letterSpacing: -0.4,
  },
  hero: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  name: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  email: {
    textAlign: 'center',
  },
  proBadge: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radii.full,
    backgroundColor: '#E8F5E9',
  },
  proText: {
    color: '#1B5E20',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    marginBottom: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.separator,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${theme.colors.primary}12`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: { flex: 1 },
  hint: {
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },
});
