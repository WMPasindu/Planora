import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  AnimatedScreen,
  AppDialog,
  Button,
  CheckInModal,
  PlanoraScreenHeader,
  GoalPlanSections,
  Text,
} from '@/components';
import { useAppNavigation } from '@/navigation';
import { useActivityStore } from '@/stores/activityStore';
import { useAppStore } from '@/stores/appStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { colors, theme } from '@/theme';
import {
  computeHubScore,
  computeStreak,
  countCheckInsThisWeek,
  getWeekDots,
} from '@/utils/checkInStats';

function MetricTile({
  icon,
  value,
  shortLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  shortLabel: string;
}) {
  return (
    <View
      style={styles.metricTile}
      accessibilityLabel={`${shortLabel}: ${value}`}
    >
      <View style={styles.metricIconWrap}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text variant="caption" color="onSurfaceVariant" numberOfLines={1} style={styles.metricShortLabel}>
        {shortLabel}
      </Text>
    </View>
  );
}

function AnimatedDayDot({ done, index }: { done: boolean; index: number }) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: withDelay(300 + index * 60, withSpring(1, { damping: 12, stiffness: 200 })) },
    ],
    opacity: withDelay(300 + index * 60, withTiming(1, { duration: 300 })),
  }));

  return (
    <Animated.View
      style={[
        styles.dayDot,
        done && styles.dayDotDone,
        { transform: [{ scale: 0 }], opacity: 0 },
        style,
      ]}
    >
      {done ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
    </Animated.View>
  );
}

export function AccountabilityHubScreen() {
  const { openProfile, openNotifications, openCreateGoal, openPlan } = useAppNavigation();
  const user = useAppStore((s) => s.user);
  const goals = useGoalsStore((s) => s.goals);
  const toggleTimer = useGoalsStore((s) => s.toggleTimer);
  const checkIns = useActivityStore((s) => s.checkIns);
  const addCheckIn = useActivityStore((s) => s.addCheckIn);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message?: string } | null>(null);

  const streak = useMemo(() => computeStreak(checkIns), [checkIns]);
  const weekCheckIns = useMemo(() => countCheckInsThisWeek(checkIns), [checkIns]);
  const weekDots = useMemo(() => getWeekDots(checkIns), [checkIns]);
  const hubScore = useMemo(
    () => computeHubScore(goals, streak, checkIns.length),
    [goals, streak, checkIns.length]
  );
  const insightBody = useMemo(() => {
    const need = Math.max(0, 5 - weekCheckIns);
    return `You've logged ${weekCheckIns} check-in${weekCheckIns === 1 ? '' : 's'} this week (${streak}-day streak).${
      need > 0
        ? ` ${need} more unlock your weekly target.`
        : ' Weekly target met—great consistency.'
    }`;
  }, [weekCheckIns, streak]);

  return (
    <AnimatedScreen tabBarPadding>
      <PlanoraScreenHeader
        leading="avatar"
        onLeadingPress={openProfile}
        avatarName={user?.displayName ?? undefined}
        avatarEmail={user?.email ?? undefined}
        onBellPress={openNotifications}
      />

      <View style={styles.topPanel}>
        <View style={styles.metricsRow}>
          <MetricTile icon="flag-outline" value={String(goals.length)} shortLabel="Goals" />
          <View style={styles.metricDivider} />
          <MetricTile icon="stats-chart-outline" value={String(Math.round(hubScore))} shortLabel="Score" />
          <View style={styles.metricDivider} />
          <MetricTile icon="flame-outline" value={String(streak)} shortLabel="Streak" />
        </View>

        <Pressable
          style={styles.addGoalCta}
          onPress={openCreateGoal}
          accessibilityRole="button"
          accessibilityLabel="Add a new goal"
        >
          <View style={styles.addGoalIconCircle}>
            <Ionicons name="add" size={26} color={colors.onPrimary} />
          </View>
          <Text style={styles.addGoalCtaText}>Add goal</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.onPrimary} />
        </Pressable>
      </View>

      <View style={styles.goalsBlockSpacer} />

      <Pressable
        style={styles.planLink}
        onPress={openPlan}
        accessibilityRole="button"
        accessibilityLabel="Open full plan"
      >
        <Ionicons name="calendar-outline" size={18} color={colors.primary} />
        <Text variant="footnote" color="primary" style={styles.planLinkText}>
          Full plan — weekly & monthly
        </Text>
        <Ionicons name="chevron-forward" size={16} color={colors.primary} />
      </Pressable>

      <GoalPlanSections
        goals={goals}
        onToggleTimer={toggleTimer}
        variant="dashboard"
      />

      <View style={styles.weekSection}>
        <View style={styles.weekHeader}>
          <Text variant="title" style={styles.weekTitle}>
            This week
          </Text>
          <Pressable onPress={() => setCheckInVisible(true)} style={styles.checkInBtn}>
            <Ionicons name="add-circle" size={18} color={colors.primary} />
            <Text variant="bodySmall" color="primary" style={styles.checkInLabel}>
              Check in
            </Text>
          </Pressable>
        </View>
        <View style={styles.weekRow}>
          {weekDots.map((d, i) => (
            <View key={d.id} style={styles.dayCol}>
              <AnimatedDayDot done={d.done} index={i} />
              <Text variant="caption" color="onSurfaceVariant" style={styles.dayLabel}>
                {d.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <View style={styles.insightIconWrap}>
            <Ionicons name="trending-up" size={18} color={colors.primary} />
          </View>
          <Text variant="headline" style={styles.insightTitle}>
            Trending up
          </Text>
        </View>
        <Text variant="bodySmall" color="onSurfaceVariant" style={styles.insightBody}>
          {insightBody}
        </Text>
      </View>

      <Button
        title={"Log today's check-in"}
        variant="secondary"
        leftIcon="checkmark-circle-outline"
        onPress={() => setCheckInVisible(true)}
        style={styles.logBtn}
      />

      <Pressable
        style={styles.partnersCard}
        accessibilityRole="button"
        onPress={() =>
          setDialog({
            title: 'Accountability partners',
            message:
              'Invites are coming soon. For now, share your weekly digest from Analytics.',
          })
        }
      >
        <View style={styles.partnersIcon}>
          <Ionicons name="people-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.partnersCopy}>
          <Text variant="headline" style={styles.partnersTitle}>
            Accountability partners
          </Text>
          <Text variant="footnote" color="onSurfaceVariant">
            Invite someone to receive your weekly progress digest.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.outline} />
      </Pressable>

      <CheckInModal
        visible={checkInVisible}
        onClose={() => setCheckInVisible(false)}
        onSubmit={(note) => {
          addCheckIn(note.length > 0 ? note : 'Check-in');
        }}
      />
      <AppDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        onClose={() => setDialog(null)}
      />
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  topPanel: {
    backgroundColor: colors.secondaryGroupedBackground,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  metricTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    minWidth: 0,
  },
  metricIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceLowest,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.onSurface,
    letterSpacing: -0.4,
  },
  metricShortLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginVertical: theme.spacing.sm,
  },
  addGoalCta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.lg,
    backgroundColor: colors.primary,
    gap: 12,
  },
  addGoalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.onPrimary}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGoalCtaText: {
    flex: 1,
    color: colors.onPrimary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  goalsBlockSpacer: {
    height: theme.spacing.sm,
  },
  planLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
    paddingVertical: 6,
  },
  planLinkText: {
    flex: 1,
    fontWeight: '600',
  },
  weekSection: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  weekTitle: {
    fontWeight: '700',
  },
  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkInLabel: {
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCol: { alignItems: 'center', gap: 8 },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDotDone: {
    backgroundColor: colors.primary,
  },
  dayLabel: { fontWeight: '500' },
  insightCard: {
    backgroundColor: colors.primaryContainer,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${colors.primary}22`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTitle: {
    fontWeight: '700',
    color: colors.onSurface,
  },
  insightBody: { lineHeight: 22 },
  logBtn: {
    marginBottom: theme.spacing.xl,
    alignSelf: 'stretch',
  },
  partnersCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  partnersIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: `${colors.primary}14`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnersCopy: { flex: 1, gap: 4 },
  partnersTitle: {
    fontWeight: '700',
    fontSize: 16,
  },
});
