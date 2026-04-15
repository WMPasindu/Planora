import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import {
  AnimatedScreen,
  AppDialog,
  type AppDialogAction,
  PlanoraScreenHeader,
  SolidPrimaryButton,
  Text,
} from '@/components';
import { useAppNavigation } from '@/navigation';
import type { CheckInFrequency } from '@/stores/preferencesStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { authIndigo } from '@/theme';
import { theme } from '@/theme';

const INDIGO = authIndigo;
const TOGGLE_ON = INDIGO;

function formatTime(d: Date) {
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

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

export function NotificationsPreferencesScreen() {
  const router = useRouter();
  const { clearNotificationBadge, openNotifications } = useAppNavigation();

  const dailyAccountability = usePreferencesStore((s) => s.dailyAccountability);
  const weeklySummary = usePreferencesStore((s) => s.weeklySummary);
  const customGoalReminders = usePreferencesStore((s) => s.customGoalReminders);
  const deepFocusMode = usePreferencesStore((s) => s.deepFocusMode);
  const reflectionHour = usePreferencesStore((s) => s.reflectionHour);
  const reflectionMinute = usePreferencesStore((s) => s.reflectionMinute);
  const checkInFrequency = usePreferencesStore((s) => s.checkInFrequency);

  const setDailyAccountability = usePreferencesStore((s) => s.setDailyAccountability);
  const setWeeklySummary = usePreferencesStore((s) => s.setWeeklySummary);
  const setCustomGoalReminders = usePreferencesStore((s) => s.setCustomGoalReminders);
  const setDeepFocusMode = usePreferencesStore((s) => s.setDeepFocusMode);
  const setReflectionTime = usePreferencesStore((s) => s.setReflectionTime);
  const setCheckInFrequency = usePreferencesStore((s) => s.setCheckInFrequency);

  const reflectionTime = useMemo(() => {
    const d = new Date();
    d.setHours(reflectionHour, reflectionMinute, 0, 0);
    return d;
  }, [reflectionHour, reflectionMinute]);

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dialog, setDialog] = useState<{
    title: string;
    message?: string;
    actions?: AppDialogAction[];
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      clearNotificationBadge();
    }, [clearNotificationBadge])
  );

  const onBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/dashboard');
  }, [router]);

  const save = () => {
    setDialog({
      title: 'Preferences saved',
      message: 'Your notification settings were updated.',
    });
  };

  const pickCadence = () => {
    setDialog({
      title: 'Choose reminder cadence',
      message: 'How often should Planora remind you to check in?',
      actions: [
        { label: 'Daily', onPress: () => setCheckInFrequency('daily') },
        { label: 'Weekly', onPress: () => setCheckInFrequency('weekly') },
        { label: 'Weekdays only', onPress: () => setCheckInFrequency('weekdays') },
        { label: 'Cancel' },
      ],
    });
  };

  const onTimeChange = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (date) setReflectionTime(date.getHours(), date.getMinutes());
  };

  return (
    <AnimatedScreen tabBarPadding scroll safeAreaEdges={['top', 'left', 'right']}>
      <PlanoraScreenHeader
        leading="back"
        onLeadingPress={onBack}
        onBellPress={openNotifications}
      />

      <Text variant="caption" style={styles.prefLabel}>
        PREFERENCES
      </Text>
      <Text variant="largeTitle" style={styles.pageTitle}>
        Notifications
      </Text>
      <Text variant="bodySmall" color="onSurfaceVariant" style={styles.intro}>
        Curate your focus. Manage how and when you receive updates to maintain peak performance
        without digital clutter.
      </Text>

      <Pressable style={styles.cadenceRow} onPress={pickCadence}>
        <Text variant="footnote" color="onSurfaceVariant">
          Reminder cadence
        </Text>
        <Text variant="headline" color="primary">
          {frequencyLabel(checkInFrequency)}
        </Text>
      </Pressable>

      <View style={styles.card}>
        <NotifRow
          icon="calendar-outline"
          iconBg="#5AC8FA"
          title="Daily accountability check-in"
          body="Consistency is the bridge between goals and accomplishment."
          value={dailyAccountability}
          onValueChange={setDailyAccountability}
        />
        {dailyAccountability ? (
          <View style={styles.timeBlock}>
            <Text variant="caption" color="onSurfaceVariant" style={styles.timeCap}>
              DAILY REFLECTION TIME
            </Text>
            <View style={styles.timeRow}>
              <Pressable onPress={() => setShowTimePicker(true)} style={styles.timePill}>
                <Text variant="headline">{formatTime(reflectionTime)}</Text>
                <Ionicons name="chevron-down" size={18} color={theme.colors.onSurfaceVariant} />
              </Pressable>
              <Text variant="footnote" color="onSurfaceVariant" style={styles.recommended}>
                Recommended 8:00 PM
              </Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.card}>
        <NotifRow
          icon="stats-chart-outline"
          iconBg="#5AC8FA"
          title="Weekly performance summary"
          body="Every Sunday at 9:00 AM. Deep dive into your efficiency metrics."
          value={weeklySummary}
          onValueChange={setWeeklySummary}
          hideBottomBorder
        />
      </View>

      <View style={styles.card}>
        <NotifRow
          icon="notifications-outline"
          iconBg="#5AC8FA"
          title="Custom goal-specific reminders"
          body="Alerts for specific project milestones and deadlines."
          value={customGoalReminders}
          onValueChange={setCustomGoalReminders}
          hideBottomBorder
        />
      </View>

      <View style={styles.deepCard}>
        <View style={styles.deepCopy}>
          <View style={styles.deepHead}>
            <Text variant="headline" style={styles.deepTitle}>
              Deep Focus Mode
            </Text>
            <Switch
              value={deepFocusMode}
              onValueChange={setDeepFocusMode}
              trackColor={{ false: theme.colors.outlineVariant, true: TOGGLE_ON }}
              thumbColor="#fff"
            />
          </View>
          <Text variant="bodySmall" color="onSurfaceVariant" style={styles.deepBody}>
            Planora automatically suppresses non-critical reminders during your scheduled deep
            work blocks to maximize flow state.
          </Text>
        </View>
        <View style={styles.deepIcon}>
          <Ionicons name="remove-outline" size={32} color="#fff" />
        </View>
      </View>

      <SolidPrimaryButton title="Save Preferences" onPress={save} style={styles.save} />

      {Platform.OS === 'android' && showTimePicker ? (
        <DateTimePicker
          value={reflectionTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      ) : null}

      <Modal visible={showTimePicker && Platform.OS === 'ios'} transparent animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setShowTimePicker(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <DateTimePicker
              value={reflectionTime}
              mode="time"
              display="spinner"
              onChange={onTimeChange}
            />
            <Pressable style={styles.doneBtn} onPress={() => setShowTimePicker(false)}>
              <Text variant="headline" color="primary">
                Done
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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

function NotifRow({
  icon,
  iconBg,
  title,
  body,
  value,
  onValueChange,
  hideBottomBorder,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  body: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  hideBottomBorder?: boolean;
}) {
  return (
    <View style={[styles.row, !hideBottomBorder && styles.rowBorder]}>
      <View style={[styles.rowIcon, { backgroundColor: `${iconBg}35` }]}>
        <Ionicons name={icon} size={22} color={iconBg} />
      </View>
      <View style={styles.rowCopy}>
        <Text variant="headline" style={styles.rowTitle}>
          {title}
        </Text>
        <Text variant="footnote" color="onSurfaceVariant" style={styles.rowBody}>
          {body}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.outlineVariant, true: TOGGLE_ON }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  prefLabel: {
    color: INDIGO,
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 4,
  },
  pageTitle: {
    marginBottom: theme.spacing.md,
    letterSpacing: -0.4,
  },
  intro: {
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  cadenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surfaceContainerHigh,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 12,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  card: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.separator,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { marginBottom: 4, fontSize: 16 },
  rowBody: { lineHeight: 20 },
  timeBlock: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: 0,
  },
  timeCap: {
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  timePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceContainerHigh,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
  },
  recommended: {
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'right',
    minWidth: 120,
  },
  deepCard: {
    flexDirection: 'row',
    backgroundColor: '#EDE7F6',
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  deepCopy: { flex: 1 },
  deepHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    marginBottom: 8,
  },
  deepTitle: { color: INDIGO, flex: 1 },
  deepBody: { lineHeight: 20 },
  deepIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: INDIGO,
    justifyContent: 'center',
    alignItems: 'center',
  },
  save: {
    alignSelf: 'stretch',
    marginBottom: theme.spacing.xxl,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.colors.surfaceLowest,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
  },
  doneBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
});
