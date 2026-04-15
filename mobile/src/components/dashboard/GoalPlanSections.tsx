import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { TrackedGoal } from '@/types';
import { theme } from '@/theme';
import {
  deriveLifecycle,
  formatGoalRange,
  formatScheduleBlock,
  hasUpcomingWindow,
  partitionByLifecycle,
} from '@/utils/goalLifecycle';

import { Text } from '../ui/Text';
import { ActiveGoalCard } from './ActiveGoalCard';

type Props = {
  goals: TrackedGoal[];
  onToggleTimer: (id: string) => void;
  /** Full plan only: mark an active goal complete */
  onMarkComplete?: (id: string) => void;
  /** Upcoming (planned) goals only — edit / remove */
  plannedActions?: {
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
  };
  variant: 'dashboard' | 'full';
};

function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="caption" color="onSurfaceVariant" style={styles.sectionKicker}>
      {children}
    </Text>
  );
}

export function GoalPlanSections({
  goals,
  onToggleTimer,
  onMarkComplete,
  plannedActions,
  variant,
}: Props) {
  const { planned, active, completed } = useMemo(() => partitionByLifecycle(goals), [goals]);

  const plannedShow = variant === 'dashboard' ? planned.slice(0, 2) : planned;
  const completedShow = variant === 'dashboard' ? completed.slice(0, 2) : completed;

  const renderCard = (g: TrackedGoal, allowComplete: boolean) => {
    const lifecycle = deriveLifecycle(g);
    const showPlannedActions =
      variant === 'full' && hasUpcomingWindow(g) && plannedActions != null;

    return (
      <View key={g.id} style={styles.cardWrap}>
        <ActiveGoalCard
          title={g.title}
          logged={g.logged}
          target={g.target}
          progress={g.progress}
          active={g.timerActive}
          lifecycle={lifecycle}
          meta={formatGoalRange(g)}
          scheduleBlock={formatScheduleBlock(g)}
          onToggleTimer={() => onToggleTimer(g.id)}
          onEditPlanned={showPlannedActions ? () => plannedActions.onEdit(g.id) : undefined}
          onDeletePlanned={showPlannedActions ? () => plannedActions.onDelete(g.id) : undefined}
        />
        {allowComplete && lifecycle === 'active' && onMarkComplete ? (
          <Pressable
            onPress={() => onMarkComplete(g.id)}
            style={styles.markDone}
            accessibilityRole="button"
            accessibilityLabel="Mark goal as done"
          >
            <Text variant="footnote" color="primary" style={styles.markDoneText}>
              Mark as done
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const empty = goals.length === 0;

  if (empty) {
    return (
      <View style={styles.empty}>
        <Text variant="bodySmall" color="onSurfaceVariant" style={styles.emptyBody}>
          No goals yet. Create one to plan your week or month and track time here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {active.length > 0 ? (
        <View style={styles.block}>
          <SectionTitle>ACTIVE NOW</SectionTitle>
          {active.map((g) => renderCard(g, variant === 'full'))}
        </View>
      ) : null}

      {plannedShow.length > 0 ? (
        <View style={styles.block}>
          <SectionTitle>STARTING SOON</SectionTitle>
          {plannedShow.map((g) => renderCard(g, false))}
          {variant === 'dashboard' && planned.length > plannedShow.length ? (
            <Text variant="footnote" color="onSurfaceVariant" style={styles.moreHint}>
              +{planned.length - plannedShow.length} more in your plan
            </Text>
          ) : null}
        </View>
      ) : null}

      {completedShow.length > 0 ? (
        <View style={styles.block}>
          <SectionTitle>{variant === 'dashboard' ? 'RECENTLY DONE' : 'COMPLETED'}</SectionTitle>
          {completedShow.map((g) => renderCard(g, false))}
          {variant === 'dashboard' && completed.length > completedShow.length ? (
            <Text variant="footnote" color="onSurfaceVariant" style={styles.moreHint}>
              +{completed.length - completedShow.length} more in full plan
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 0 },
  block: {
    marginBottom: theme.spacing.lg,
  },
  sectionKicker: {
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    fontWeight: '700',
  },
  cardWrap: {
    marginBottom: theme.spacing.xs,
  },
  markDone: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: theme.spacing.sm,
    marginTop: -4,
  },
  markDoneText: {
    fontWeight: '600',
  },
  moreHint: {
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },
  empty: {
    paddingVertical: theme.spacing.md,
  },
  emptyBody: {
    lineHeight: 22,
  },
});