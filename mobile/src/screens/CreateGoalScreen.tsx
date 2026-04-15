import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AnimatedScreen, AppDialog, type AppDialogAction, PlanoraScreenHeader, Text } from '@/components';
import { useAppNavigation } from '@/navigation';
import { useAppStore } from '@/stores/appStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { colors, theme } from '@/theme';
import {
  deriveLifecycle,
  formatClockFromMinutes,
  formatYmd,
  hasUpcomingWindow,
  parseYmdLocal,
  parseTargetToHM,
} from '@/utils/goalLifecycle';
import { computeScheduleEndMinutes, findScheduleConflicts } from '@/utils/scheduleConflict';

function formatTargetHours(hours: number, minutes: number): string {
  if (hours === 0 && minutes === 0) return '0h';
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function StepBlock({
  index,
  label,
  children,
}: {
  index: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.stepBlock}>
      <View style={styles.stepLabelRow}>
        <View style={styles.stepIndex}>
          <Text style={styles.stepIndexText}>{index}</Text>
        </View>
        <Text variant="caption" color="onSurfaceVariant" style={styles.stepCaption}>
          {label}
        </Text>
      </View>
      {children}
    </View>
  );
}

export function CreateGoalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ editId?: string | string[] }>();
  const editId = typeof params.editId === 'string' ? params.editId : params.editId?.[0];

  const { openProfile } = useAppNavigation();
  const user = useAppStore((s) => s.user);
  const goals = useGoalsStore((s) => s.goals);
  const addGoal = useGoalsStore((s) => s.addGoal);
  const updateGoal = useGoalsStore((s) => s.updateGoal);
  const existing = editId ? goals.find((g) => g.id === editId) : undefined;
  const hydratedRef = useRef<string | null>(null);
  const invalidEditAlertRef = useRef(false);

  const [goalName, setGoalName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const defaultRange = (cad: 'daily' | 'weekly' | 'monthly') => {
    const s = new Date();
    s.setHours(0, 0, 0, 0);
    const e = new Date(s);
    if (cad === 'daily') e.setDate(e.getDate() + 1);
    else if (cad === 'weekly') e.setDate(e.getDate() + 7);
    else e.setMonth(e.getMonth() + 1);
    return { start: s, end: e };
  };

  const [ongoing, setOngoing] = useState(false);
  const [startDate, setStartDate] = useState(() => defaultRange('weekly').start);
  const [endDate, setEndDate] = useState(() => defaultRange('weekly').end);

  const defaultBlockStart = () => {
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    return d;
  };
  const [blockStartTime, setBlockStartTime] = useState(() => defaultBlockStart());
  const [sessionH, setSessionH] = useState(1);
  const [sessionM, setSessionM] = useState(0);

  const [picker, setPicker] = useState<'start' | 'end' | 'blockTime' | null>(null);
  const [dialog, setDialog] = useState<{
    title: string;
    message?: string;
    actions?: AppDialogAction[];
  } | null>(null);

  useEffect(() => {
    if (!editId) {
      hydratedRef.current = null;
      invalidEditAlertRef.current = false;
      return;
    }
    if (!existing) return;
    if (!hasUpcomingWindow(existing)) {
      if (!invalidEditAlertRef.current) {
        invalidEditAlertRef.current = true;
        setDialog({
          title: 'Goal editing locked',
          message: 'Only upcoming occurrences can be edited.',
          actions: [{ label: 'OK', variant: 'primary', onPress: () => router.back() }],
        });
      }
      return;
    }
    invalidEditAlertRef.current = false;
    if (hydratedRef.current === editId) return;
    hydratedRef.current = editId;
    setGoalName(existing.title);
    setFrequency(existing.cadence);
    setOngoing(existing.ongoing);
    setStartDate(new Date(parseYmdLocal(existing.startDate)));
    if (existing.endDate) {
      setEndDate(new Date(parseYmdLocal(existing.endDate)));
    } else {
      setEndDate(defaultRange(existing.cadence).end);
    }
    const block = new Date();
    block.setHours(0, 0, 0, 0);
    if (existing.scheduleStartMinutes != null) {
      block.setHours(
        Math.floor(existing.scheduleStartMinutes / 60),
        existing.scheduleStartMinutes % 60,
        0,
        0
      );
    } else {
      block.setHours(9, 0, 0, 0);
    }
    setBlockStartTime(block);
    const durMin =
      existing.scheduleDurationMinutes ??
      (() => {
        const hm = parseTargetToHM(existing.target);
        return hm.hours * 60 + hm.minutes;
      })();
    const dur = durMin > 0 ? durMin : 60;
    setSessionH(Math.floor(dur / 60));
    setSessionM(dur % 60);
  }, [editId, existing, router]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/dashboard');
  }, [router]);

  const bumpSessionHours = (delta: number) => {
    setSessionH((h) => Math.min(12, Math.max(0, h + delta)));
  };

  const adjustSessionMinutes = (delta: number) => {
    setSessionM((m) => {
      let next = m + delta;
      if (next >= 60) {
        setSessionH((h) => Math.min(12, h + 1));
        return next - 60;
      }
      if (next < 0) {
        setSessionH((h) => Math.max(0, h - 1));
        return 60 + next;
      }
      return next;
    });
  };

  const blockEndPreview = useMemo(() => {
    const startM = blockStartTime.getHours() * 60 + blockStartTime.getMinutes();
    const durM = sessionH * 60 + sessionM;
    return computeScheduleEndMinutes(startM, durM);
  }, [blockStartTime, sessionH, sessionM]);

  const onPickerChange = (_: unknown, date?: Date) => {
    if (Platform.OS === 'android') setPicker(null);
    if (!date || !picker) return;
    if (picker === 'start') setStartDate(date);
    else if (picker === 'end') setEndDate(date);
    else setBlockStartTime(date);
  };

  const onSubmit = () => {
    if (goalName.trim().length < 2) {
      setDialog({ title: 'Goal name required', message: 'Enter a short goal name to continue.' });
      return;
    }
    if (!ongoing && endDate.getTime() < startDate.getTime()) {
      setDialog({ title: 'Invalid date range', message: 'End date must be on or after start date.' });
      return;
    }

    const startM = blockStartTime.getHours() * 60 + blockStartTime.getMinutes();
    const durM = sessionH * 60 + sessionM;
    if (durM < 15) {
      setDialog({ title: 'Block too short', message: 'Session blocks must be at least 15 minutes.' });
      return;
    }
    if (durM > 12 * 60) {
      setDialog({ title: 'Block too long', message: 'Session blocks can be at most 12 hours.' });
      return;
    }
    const { endMinutes, ok: blockOk } = computeScheduleEndMinutes(startM, durM);
    if (!blockOk) {
      setDialog({
        title: 'Invalid block time',
        message: 'This block ends after midnight. Start earlier or shorten the session.',
      });
      return;
    }

    const conflicts = findScheduleConflicts(
      {
        id: '__candidate__',
        startDate: formatYmd(startDate),
        endDate: ongoing ? null : formatYmd(endDate),
        cadence: frequency,
        scheduleStartMinutes: startM,
        scheduleDurationMinutes: durM,
        scheduleEndMinutes: endMinutes,
      },
      goals,
      editId
    );
    if (conflicts.length > 0) {
      setDialog({
        title: 'Schedule conflict',
        message: `“${conflicts[0].title}” already uses this time on a shared day. Adjust the start time or session length.`,
      });
      return;
    }

    if (editId && existing) {
      if (!hasUpcomingWindow(existing)) {
        setDialog({ title: 'No upcoming occurrences', message: 'There are no future occurrences to update.' });
        return;
      }
      updateGoal(editId, {
        title: goalName.trim(),
        target: formatTargetHours(sessionH, sessionM),
        cadence: frequency,
        startDate: formatYmd(startDate),
        endDate: ongoing ? null : formatYmd(endDate),
        ongoing,
        scheduleStartMinutes: startM,
        scheduleDurationMinutes: durM,
        scheduleEndMinutes: endMinutes,
      });
      setDialog({
        title: 'Goal updated',
        message: 'Your changes are saved.',
        actions: [{ label: 'OK', variant: 'primary', onPress: () => router.back() }],
      });
      return;
    }
    addGoal({
      title: goalName.trim(),
      logged: '0h 0m',
      target: formatTargetHours(sessionH, sessionM),
      progress: 0,
      timerActive: false,
      cadence: frequency,
      startDate: formatYmd(startDate),
      endDate: ongoing ? null : formatYmd(endDate),
      ongoing,
      completedAt: null,
      createdAt: new Date().toISOString(),
      scheduleStartMinutes: startM,
      scheduleDurationMinutes: durM,
      scheduleEndMinutes: endMinutes,
    });
    setDialog({
      title: 'Goal created',
      message: 'Your new goal is ready to track.',
      actions: [{ label: 'OK', variant: 'primary', onPress: () => router.back() }],
    });
  };

  const setCadence = (cad: 'daily' | 'weekly' | 'monthly') => {
    setFrequency(cad);
    if (!editId) {
      const { start, end } = defaultRange(cad);
      setStartDate(start);
      setEndDate(end);
    }
  };

  return (
    <AnimatedScreen
      scroll
      safeAreaEdges={['top', 'left', 'right', 'bottom']}
      tabBarPadding={false}
    >
      <PlanoraScreenHeader
        leading="back"
        onLeadingPress={goBack}
        trailing="avatar"
        onTrailingPress={openProfile}
        trailingAvatarName={user?.displayName ?? undefined}
        trailingAvatarEmail={user?.email ?? undefined}
      />

      <Text variant="caption" color="onSurfaceVariant" style={styles.kicker}>
        {editId ? 'EDIT INITIATIVE' : 'NEW INITIATIVE'}
      </Text>
      <View style={styles.heroTitleRow}>
        <Text variant="largeTitle" style={styles.heroDark}>
          {editId ? 'Adjust your ' : 'Define your '}
        </Text>
        <Text variant="largeTitle" style={styles.heroAccent}>
          {editId ? 'plan.' : 'trajectory.'}
        </Text>
      </View>

      <StepBlock index="01" label="WHAT IS YOUR GOAL?">
        <TextInput
          value={goalName}
          onChangeText={setGoalName}
          placeholder="Name your goal"
          placeholderTextColor={colors.outline}
          style={styles.goalInput}
        />
      </StepBlock>

      <StepBlock index="02" label="FREQUENCY">
        <View style={styles.segment}>
          <Pressable
            onPress={() => setCadence('daily')}
            style={[styles.segmentBtn, frequency === 'daily' && styles.segmentBtnOn]}
          >
            <Text
              variant="headline"
              style={frequency === 'daily' ? styles.segmentLabelOn : styles.segmentLabelOff}
            >
              Daily
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCadence('weekly')}
            style={[styles.segmentBtn, frequency === 'weekly' && styles.segmentBtnOn]}
          >
            <Text
              variant="headline"
              style={frequency === 'weekly' ? styles.segmentLabelOn : styles.segmentLabelOff}
            >
              Weekly
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setCadence('monthly')}
            style={[styles.segmentBtn, frequency === 'monthly' && styles.segmentBtnOn]}
          >
            <Text
              variant="headline"
              style={frequency === 'monthly' ? styles.segmentLabelOn : styles.segmentLabelOff}
            >
              Monthly
            </Text>
          </Pressable>
        </View>
      </StepBlock>

      <StepBlock index="03" label="BLOCK TIME">
        <Text variant="bodySmall" color="onSurfaceVariant" style={styles.blockHint}>
          Session length is your time target for progress (same value on your cards). Set when the
          block starts; end time follows from the length. Other goals cannot overlap this window on
          the same day.
        </Text>
        <Pressable style={styles.blockStartCard} onPress={() => setPicker('blockTime')}>
          <Text variant="caption" color="onSurfaceVariant" style={styles.dateCap}>
            BLOCK STARTS
          </Text>
          <View style={styles.dateInner}>
            <Text variant="headline" style={styles.dateText}>
              {formatClockFromMinutes(
                blockStartTime.getHours() * 60 + blockStartTime.getMinutes()
              )}
            </Text>
            <Ionicons name="time-outline" size={22} color={colors.primary} />
          </View>
        </Pressable>
        <View style={[styles.timeRow, styles.sessionRow]}>
          <View style={styles.timeCard}>
            <Text variant="caption" color="onSurfaceVariant" style={styles.timeCap}>
              SESSION H
            </Text>
            <View style={styles.timeAdjustRow}>
              <Pressable onPress={() => bumpSessionHours(-1)} hitSlop={8}>
                <Ionicons name="remove-circle-outline" size={22} color={colors.primary} />
              </Pressable>
              <Text style={styles.timeValue}>{String(sessionH).padStart(2, '0')}</Text>
              <Pressable onPress={() => bumpSessionHours(1)} hitSlop={8}>
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              </Pressable>
            </View>
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.timeCard}>
            <Text variant="caption" color="onSurfaceVariant" style={styles.timeCap}>
              SESSION M
            </Text>
            <View style={styles.timeAdjustRow}>
              <Pressable onPress={() => adjustSessionMinutes(-15)} hitSlop={8}>
                <Ionicons name="remove-circle-outline" size={22} color={colors.onSurface} />
              </Pressable>
              <Text style={[styles.timeValue, styles.timeValueMuted]}>
                {String(sessionM).padStart(2, '0')}
              </Text>
              <Pressable onPress={() => adjustSessionMinutes(15)} hitSlop={8}>
                <Ionicons name="add-circle-outline" size={22} color={colors.onSurface} />
              </Pressable>
            </View>
          </View>
        </View>
        <View style={styles.endsAtRow}>
          <Text variant="caption" color="onSurfaceVariant" style={styles.endsAtCap}>
            ENDS AT (AUTO)
          </Text>
          <Text variant="headline" style={styles.endsAtValue}>
            {blockEndPreview.ok
              ? formatClockFromMinutes(blockEndPreview.endMinutes)
              : 'After midnight'}
          </Text>
        </View>
      </StepBlock>

      <StepBlock index="04" label="DATE RANGE">
        <View style={styles.durationHead}>
          <View style={{ flex: 1 }} />
          <Text variant="bodySmall" color="onSurfaceVariant" style={styles.ongoingLabel}>
            Ongoing
          </Text>
          <Switch
            value={ongoing}
            onValueChange={setOngoing}
            trackColor={{ false: colors.outlineVariant, true: `${colors.primary}88` }}
            thumbColor="#fff"
            ios_backgroundColor={colors.outlineVariant}
          />
        </View>
        {!ongoing ? (
          <View style={styles.dateRow}>
            <Pressable style={styles.dateCard} onPress={() => setPicker('start')}>
              <Text variant="caption" color="onSurfaceVariant" style={styles.dateCap}>
                START DATE
              </Text>
              <View style={styles.dateInner}>
                <Text variant="headline" style={styles.dateText}>
                  {formatShortDate(startDate)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              </View>
            </Pressable>
            <Pressable style={styles.dateCard} onPress={() => setPicker('end')}>
              <Text variant="caption" color="onSurfaceVariant" style={styles.dateCap}>
                TARGET DEADLINE
              </Text>
              <View style={styles.dateInner}>
                <Text variant="headline" style={styles.dateText}>
                  {formatShortDate(endDate)}
                </Text>
                <Ionicons name="calendar-outline" size={20} color={colors.onSurfaceVariant} />
              </View>
            </Pressable>
          </View>
        ) : null}
      </StepBlock>

      <LinearGradient
        colors={['#1a237e', '#283593', '#3949ab']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.quoteCard}
      >
        <Text style={styles.quoteText}>
          Designers who set clear targets are 40% more likely to ship.
        </Text>
      </LinearGradient>

      <Pressable
        style={styles.cta}
        onPress={onSubmit}
        accessibilityRole="button"
        accessibilityLabel="Start tracking"
      >
        <Text style={styles.ctaText}>{editId ? 'Save changes' : 'Start Tracking'}</Text>
        <Ionicons name="play" size={18} color={colors.onPrimary} style={styles.ctaIcon} />
      </Pressable>

      {Platform.OS === 'ios' && picker ? (
        <Modal transparent animationType="slide" visible>
          <Pressable style={styles.modalBackdrop} onPress={() => setPicker(null)}>
            <View />
          </Pressable>
          <View style={styles.modalSheet}>
            <DateTimePicker
              value={
                picker === 'blockTime'
                  ? blockStartTime
                  : picker === 'start'
                    ? startDate
                    : endDate
              }
              mode={picker === 'blockTime' ? 'time' : 'date'}
              display="spinner"
              onChange={onPickerChange}
            />
            <Pressable style={styles.doneBtn} onPress={() => setPicker(null)}>
              <Text variant="headline" color="primary">
                Done
              </Text>
            </Pressable>
          </View>
        </Modal>
      ) : null}
      {Platform.OS === 'android' && picker ? (
        <DateTimePicker
          value={
            picker === 'blockTime'
              ? blockStartTime
              : picker === 'start'
                ? startDate
                : endDate
          }
          mode={picker === 'blockTime' ? 'time' : 'date'}
          display="default"
          onChange={onPickerChange}
        />
      ) : null}
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
  kicker: {
    letterSpacing: 1.2,
    fontWeight: '700',
    marginBottom: 6,
  },
  heroTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.xl,
  },
  heroDark: {
    color: colors.onSurface,
    letterSpacing: -0.5,
    fontWeight: '700',
  },
  heroAccent: {
    color: colors.primary,
    letterSpacing: -0.5,
    fontWeight: '700',
  },
  stepBlock: {
    marginBottom: theme.spacing.xl,
  },
  stepLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  stepIndex: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndexText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  stepCaption: {
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  goalInput: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 16,
    fontSize: 17,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: theme.radii.lg,
    padding: 4,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  segmentBtnOn: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  segmentLabelOn: {
    color: colors.primary,
    fontWeight: '700',
  },
  segmentLabelOff: {
    color: colors.onSurfaceVariant,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeCard: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  timeCap: {
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.6,
  },
  timeAdjustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  timeValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    minWidth: 36,
    textAlign: 'center',
  },
  timeValueMuted: {
    color: colors.onSurface,
  },
  colon: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  blockHint: {
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  blockStartCard: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: theme.spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  sessionRow: {
    marginBottom: theme.spacing.sm,
  },
  endsAtRow: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  endsAtCap: {
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  endsAtValue: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: '800',
  },
  durationHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  ongoingLabel: {
    marginRight: 4,
  },
  dateRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  dateCard: {
    flex: 1,
    backgroundColor: colors.surfaceLowest,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  dateCap: {
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  dateInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  dateText: {
    flex: 1,
    fontSize: 15,
  },
  quoteCard: {
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
  },
  quoteText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    borderRadius: theme.radii.xl,
    paddingVertical: 16,
    marginBottom: theme.spacing.xxl,
  },
  ctaText: {
    color: colors.onPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  ctaIcon: {
    marginLeft: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: colors.surfaceLowest,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingBottom: theme.spacing.xxl,
  },
  doneBtn: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
});
