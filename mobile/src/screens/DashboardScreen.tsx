import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AnimatedScreen,
  PlanoraScreenHeader,
  CheckInModal,
  GoalPlanSections,
  MissedTimeCard,
  RecentChecks,
  Text,
  TimeframeTabs,
  type TimeframeKey,
  UtilizationDonut,
  UtilizationLegend,
} from '@/components';
import { useAppNavigation } from '@/navigation';
import { useActivityStore } from '@/stores/activityStore';
import { useAppStore } from '@/stores/appStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { theme } from '@/theme';
import { getDashboardUtilization } from '@/utils/dashboardUtilization';
import { checkInsToRecentItems } from '@/utils/recentChecks';

export function DashboardScreen() {
  const { openProfile, openNotifications, openCreateGoal, openPlan } = useAppNavigation();
  const user = useAppStore((s) => s.user);
  const goals = useGoalsStore((s) => s.goals);
  const toggleTimer = useGoalsStore((s) => s.toggleTimer);
  const checkIns = useActivityStore((s) => s.checkIns);
  const addCheckIn = useActivityStore((s) => s.addCheckIn);
  const [timeframe, setTimeframe] = useState<TimeframeKey>('Day');
  const [checkInVisible, setCheckInVisible] = useState(false);

  const util = useMemo(() => getDashboardUtilization(timeframe), [timeframe]);
  const recentItems = useMemo(
    () => checkInsToRecentItems(checkIns, timeframe),
    [checkIns, timeframe]
  );

  const loggedPortion = util.loggedH / util.dayCapacityH;
  const plannedPortion = util.plannedH / util.dayCapacityH;
  const utilizationPct = (util.loggedH + util.plannedH) / util.dayCapacityH;

  return (
    <AnimatedScreen tabBarPadding>
      <>
      <View style={styles.shell}>
        <PlanoraScreenHeader
          leading="avatar"
          onLeadingPress={openProfile}
          avatarName={user?.displayName ?? undefined}
          avatarEmail={user?.email ?? undefined}
          onBellPress={openNotifications}
        />

        <UtilizationDonut
          loggedPortion={loggedPortion}
          plannedPortion={plannedPortion}
          utilizationPct={utilizationPct}
        />
        <UtilizationLegend loggedLabel={util.loggedLabel} plannedLabel={util.plannedLabel} />

        <View style={styles.sectionGap}>
          <TimeframeTabs value={timeframe} onChange={setTimeframe} />
        </View>

        <View style={styles.sectionHeader}>
          <Text variant="title">Goals & schedule</Text>
          {util.showLiveBadge ? (
            <Text variant="caption" color="primary" style={styles.live}>
              LIVE NOW
            </Text>
          ) : (
            <Text variant="caption" color="onSurfaceVariant" style={styles.rangeHint}>
              {timeframe}
            </Text>
          )}
        </View>

        <Pressable
          style={styles.planLink}
          onPress={openPlan}
          accessibilityRole="button"
          accessibilityLabel="Open full weekly and monthly plan"
        >
          <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
          <Text variant="footnote" color="primary" style={styles.planLinkText}>
            View full plan
          </Text>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
        </Pressable>

        <GoalPlanSections
          goals={goals}
          onToggleTimer={toggleTimer}
          variant="dashboard"
        />

        <Text variant="caption" color="onSurfaceVariant" style={styles.checksHeading}>
          RECENT CHECKS
        </Text>
        <RecentChecks items={recentItems} />

        <View style={styles.missedTimeWrap}>
          <MissedTimeCard title={util.missedTitle} body={util.missedBody} />
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.secondaryBtn} onPress={() => setCheckInVisible(true)}>
            <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.primary} />
            <Text variant="headline" color="primary">
              Check-in
            </Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={openCreateGoal}>
            <Ionicons name="add" size={22} color={theme.colors.onPrimary} />
            <Text variant="headline" color="onPrimary">
              New Goal
            </Text>
          </Pressable>
        </View>
      </View>

      <CheckInModal
        visible={checkInVisible}
        onClose={() => setCheckInVisible(false)}
        onSubmit={(note) => {
          addCheckIn(note.length > 0 ? note : 'Check-in');
        }}
      />
      </>
    </AnimatedScreen>
  );
}

const styles = StyleSheet.create({
  shell: {
    gap: 0,
  },
  sectionGap: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  live: {
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  rangeHint: {
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  planLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
    paddingVertical: 8,
  },
  planLinkText: {
    flex: 1,
    fontWeight: '600',
  },
  checksHeading: {
    letterSpacing: 1,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  missedTimeWrap: {
    marginTop: theme.spacing.xxl,
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceLowest,
    borderWidth: 1.5,
    borderColor: `${theme.colors.primary}35`,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.primary,
  },
});
