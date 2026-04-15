import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { TrackedGoal } from '@/types';
import { theme } from '@/theme';
import { formatClockFromMinutes } from '@/utils/goalLifecycle';
import { formatYmd } from '@/utils/goalLifecycle';
import {
  blockColorForGoal,
  getGoalsForDate,
  getWeekDates,
  isSameDay,
  isToday,
  shortDayName,
} from '@/utils/plannerHelpers';

import { Text } from '../ui/Text';

type Props = {
  anchor: Date;
  goals: TrackedGoal[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onBlockPress?: (goal: TrackedGoal) => void;
};

export function WeekView({ anchor, goals, selectedDate, onSelectDate, onBlockPress }: Props) {
  const days = getWeekDates(anchor);
  const selected = days.find((d) => isSameDay(d, selectedDate)) ?? days[0];
  const dayGoals = getGoalsForDate(goals, formatYmd(selected));

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        {days.map((d) => {
          const sel = isSameDay(d, selectedDate);
          const td = isToday(d);
          const hasBlocks = getGoalsForDate(goals, formatYmd(d)).length > 0;
          return (
            <Pressable
              key={d.toISOString()}
              style={[styles.dayCol, sel && styles.dayColSelected]}
              onPress={() => onSelectDate(d)}
            >
              <Text
                style={[styles.dayName, sel && styles.dayNameSel, td && !sel && styles.dayNameToday]}
              >
                {shortDayName(d)}
              </Text>
              <View style={[styles.dayCircle, sel && styles.dayCircleSel, td && !sel && styles.dayCircleToday]}>
                <Text style={[styles.dayNum, sel && styles.dayNumSel, td && !sel && styles.dayNumToday]}>
                  {d.getDate()}
                </Text>
              </View>
              {hasBlocks && !sel && <View style={styles.dot} />}
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.blockList} showsVerticalScrollIndicator={false}>
        {dayGoals.length === 0 ? (
          <Text variant="bodySmall" color="onSurfaceVariant" style={styles.emptyText}>
            No blocks on {shortDayName(selected)}. Tap + to add one.
          </Text>
        ) : (
          dayGoals.map((g) => {
            const color = blockColorForGoal(g, goals);
            const startM = g.scheduleStartMinutes ?? 0;
            const endM = g.scheduleEndMinutes ?? startM + (g.scheduleDurationMinutes ?? 60);
            return (
              <Pressable
                key={g.id}
                style={[styles.blockCard, { borderLeftColor: color }]}
                onPress={() => onBlockPress?.(g)}
              >
                <View style={styles.blockRow}>
                  <View style={[styles.blockDot, { backgroundColor: color }]} />
                  <Text style={styles.blockTitle} numberOfLines={1}>
                    {g.title}
                  </Text>
                </View>
                <Text variant="footnote" color="onSurfaceVariant" style={styles.blockTime}>
                  {formatClockFromMinutes(startM)} – {formatClockFromMinutes(endM)}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 4,
  },
  dayCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: theme.radii.md,
  },
  dayColSelected: {
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  dayNameSel: { color: theme.colors.primary },
  dayNameToday: { color: theme.colors.primary },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleSel: {
    backgroundColor: theme.colors.primary,
  },
  dayCircleToday: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  dayNum: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  dayNumSel: { color: '#fff' },
  dayNumToday: { color: theme.colors.primary },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 4,
  },
  blockList: { flex: 1, paddingTop: 8 },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 32,
    lineHeight: 20,
  },
  blockCard: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    ...StyleSheet.flatten([
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
      },
    ]),
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  blockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  blockTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  blockTime: {
    marginLeft: 16,
  },
});
