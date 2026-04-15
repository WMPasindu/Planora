import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AnimatedScreen,
  AppDialog,
  type AppDialogAction,
  PlanoraScreenHeader,
  DateNavigator,
  DayTimeline,
  GoalPlanSections,
  MonthView,
  QuickAddSheet,
  SegmentedPills,
  Text,
  WeekView,
} from '@/components';
import { useAppNavigation } from '@/navigation';
import { useGoalsStore } from '@/stores/goalsStore';
import { theme } from '@/theme';
import type { TrackedGoal } from '@/types';
import { formatYmd, hasUpcomingWindow, parseYmdLocal } from '@/utils/goalLifecycle';
import { getGoalsForDate, goalOccursOnDate } from '@/utils/plannerHelpers';

const VIEW_OPTIONS = ['Day', 'Week', 'Month', 'All Goals'] as const;
type ViewKey = (typeof VIEW_OPTIONS)[number];

export function PlanScreen() {
  const router = useRouter();
  const { openNotifications, openCreateGoal, openEditGoal } = useAppNavigation();
  const goals = useGoalsStore((s) => s.goals);
  const addGoal = useGoalsStore((s) => s.addGoal);
  const toggleTimer = useGoalsStore((s) => s.toggleTimer);
  const completeGoal = useGoalsStore((s) => s.completeGoal);
  const updateGoal = useGoalsStore((s) => s.updateGoal);
  const removeGoal = useGoalsStore((s) => s.removeGoal);

  const [view, setView] = useState<ViewKey>('Day');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [prefillStart, setPrefillStart] = useState<number | undefined>(undefined);
  const [dialog, setDialog] = useState<{
    title: string;
    message?: string;
    actions?: AppDialogAction[];
  } | null>(null);

  const startOfToday = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t.getTime();
  }, []);

  const dayGoals = useMemo(
    () => getGoalsForDate(goals, formatYmd(selectedDate)),
    [goals, selectedDate]
  );

  const shiftDate = useCallback(
    (delta: number) => {
      setSelectedDate((d) => {
        const next = new Date(d);
        if (view === 'Month') {
          next.setMonth(next.getMonth() + delta);
        } else if (view === 'Week') {
          next.setDate(next.getDate() + 7 * delta);
        } else {
          next.setDate(next.getDate() + delta);
        }
        return next;
      });
    },
    [view]
  );

  const goToday = useCallback(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setSelectedDate(d);
  }, []);

  const confirmDelete = useCallback(
    (id: string, fromYmd?: string) => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return;
      setDialog({
        title: fromYmd ? 'Delete all upcoming?' : 'Delete goal?',
        message: fromYmd
          ? 'This removes future occurrences from the selected date onward and keeps past history.'
          : 'This action cannot be undone.',
        actions: [
          { label: 'Cancel' },
          {
            label: 'Delete',
            variant: 'destructive',
            onPress: () => {
              if (!fromYmd) {
                removeGoal(id);
                return;
              }
              const selectedMs = parseYmdLocal(fromYmd);
              const startMs = parseYmdLocal(goal.startDate);
              if (selectedMs <= startMs) {
                removeGoal(id);
                return;
              }
              const prev = new Date(selectedMs);
              prev.setDate(prev.getDate() - 1);
              updateGoal(id, { endDate: formatYmd(prev), ongoing: false });
            },
          },
        ],
      });
    },
    [goals, removeGoal, updateGoal]
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/dashboard');
  }, [router]);

  const openQuickAdd = useCallback(
    (startMinutes?: number) => {
      if (selectedDate.getTime() < startOfToday) {
        setDialog({
          title: 'Past date locked',
          message: 'You can only add goals to today or future dates.',
          actions: [{ label: 'OK', variant: 'primary' }],
        });
        return;
      }
      setPrefillStart(startMinutes);
      setQuickAddVisible(true);
    },
    [selectedDate, startOfToday]
  );

  const handleBlockPress = useCallback(
    (goal: TrackedGoal) => {
      const selectedYmd = formatYmd(selectedDate);
      if (selectedDate.getTime() < startOfToday) {
        setDialog({
          title: 'Past event locked',
          message: 'Past occurrences cannot be edited or deleted.',
          actions: [{ label: 'OK', variant: 'primary' }],
        });
        return;
      }
      if (!goalOccursOnDate(goal, selectedYmd)) {
        return;
      }
      if (!hasUpcomingWindow(goal, selectedDate)) {
        setDialog({
          title: 'Goal editing locked',
          message: 'This goal has no upcoming occurrences to edit.',
          actions: [{ label: 'OK', variant: 'primary' }],
        });
        return;
      }

      const editSingleOccurrence = () => {
        const baseDur = goal.scheduleDurationMinutes ?? 60;
        const startM = goal.scheduleStartMinutes ?? 9 * 60;
        const endM = goal.scheduleEndMinutes ?? startM + baseDur;
        const newId = addGoal({
          title: goal.title,
          logged: '0h 0m',
          target: goal.target,
          progress: goal.progress,
          timerActive: false,
          cadence: 'daily',
          startDate: selectedYmd,
          endDate: selectedYmd,
          ongoing: false,
          completedAt: null,
          createdAt: new Date().toISOString(),
          scheduleStartMinutes: startM,
          scheduleDurationMinutes: baseDur,
          scheduleEndMinutes: endM,
          excludedDates: [],
        });
        updateGoal(goal.id, {
          excludedDates: Array.from(new Set([...(goal.excludedDates ?? []), selectedYmd])),
        });
        openEditGoal(newId);
      };

      const deleteSingleOccurrence = () => {
        updateGoal(goal.id, {
          excludedDates: Array.from(new Set([...(goal.excludedDates ?? []), selectedYmd])),
        });
      };

      setDialog({
        title: goal.title,
        message: `Choose how to update ${selectedYmd}.`,
        actions: [
          { label: 'Cancel' },
          { label: 'Delete this date', variant: 'destructive', onPress: deleteSingleOccurrence },
          {
            label: 'Delete all upcoming',
            variant: 'destructive',
            onPress: () => confirmDelete(goal.id, selectedYmd),
          },
          { label: 'Edit this date', onPress: editSingleOccurrence },
          { label: 'Edit all upcoming', variant: 'primary', onPress: () => openEditGoal(goal.id) },
        ],
      });
    },
    [addGoal, confirmDelete, openEditGoal, selectedDate, startOfToday, updateGoal]
  );

  const isCalendarView = view !== 'All Goals';

  return (
    <AnimatedScreen
      tabBarPadding={view === 'All Goals'}
      scroll={view === 'All Goals'}
      safeAreaEdges={['top', 'left', 'right', 'bottom']}
    >
      <PlanoraScreenHeader
        leading="back"
        onLeadingPress={goBack}
        onBellPress={openNotifications}
      />

      <Text variant="caption" color="onSurfaceVariant" style={styles.kicker}>
        PLANNER
      </Text>
      <Text variant="largeTitle" style={styles.title}>
        Your schedule
      </Text>

      <SegmentedPills options={VIEW_OPTIONS} value={view} onChange={setView} />

      {isCalendarView && (
        <View style={styles.navWrap}>
          <DateNavigator
            date={selectedDate}
            onPrev={() => shiftDate(-1)}
            onNext={() => shiftDate(1)}
            onToday={goToday}
          />
        </View>
      )}

      {view === 'Day' && (
        <DayTimeline
          goals={dayGoals}
          allGoals={goals}
          date={selectedDate}
          onBlockPress={handleBlockPress}
          onEmptyPress={(m) => openQuickAdd(m)}
        />
      )}

      {view === 'Week' && (
        <WeekView
          anchor={selectedDate}
          goals={goals}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onBlockPress={handleBlockPress}
        />
      )}

      {view === 'Month' && (
        <MonthView
          year={selectedDate.getFullYear()}
          month={selectedDate.getMonth()}
          goals={goals}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onBlockPress={handleBlockPress}
        />
      )}

      {view === 'All Goals' && (
        <>
          <View style={styles.allGoalsGap} />
          <GoalPlanSections
            goals={goals}
            onToggleTimer={toggleTimer}
            onMarkComplete={completeGoal}
            plannedActions={{ onEdit: openEditGoal, onDelete: confirmDelete }}
            variant="full"
          />
        </>
      )}

      {/* FAB */}
      <Pressable
        style={[styles.fab, view === 'All Goals' ? styles.fabRaised : styles.fabBottom]}
        onPress={() => openQuickAdd()}
        accessibilityRole="button"
        accessibilityLabel="Add new block"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <QuickAddSheet
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        date={selectedDate}
        prefillStartMinutes={prefillStart}
      />

      <AppDialog
        visible={dialog != null}
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
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 4,
  },
  title: {
    marginBottom: theme.spacing.md,
    letterSpacing: -0.4,
  },
  navWrap: {
    marginTop: theme.spacing.lg,
  },
  allGoalsGap: {
    height: theme.spacing.xl,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleSheet.flatten([
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8,
      },
    ]),
  },
  fabBottom: {
    bottom: 24,
  },
  fabRaised: {
    bottom: 100,
  },
});
