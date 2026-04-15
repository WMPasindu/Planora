import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { TrackedGoal } from '@/types';
import { theme } from '@/theme';
import { formatClockFromMinutes } from '@/utils/goalLifecycle';
import { formatYmd } from '@/utils/goalLifecycle';
import {
  blockColorForGoal,
  getGoalsForDate,
  getMonthCalendarGrid,
  isSameDay,
  isToday,
} from '@/utils/plannerHelpers';

import { Text } from '../ui/Text';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

type Props = {
  year: number;
  month: number;
  goals: TrackedGoal[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onBlockPress?: (goal: TrackedGoal) => void;
};

export function MonthView({ year, month, goals, selectedDate, onSelectDate, onBlockPress }: Props) {
  const grid = getMonthCalendarGrid(year, month);
  const dayGoals = getGoalsForDate(goals, formatYmd(selectedDate));

  return (
    <View style={styles.wrap}>
      <View style={styles.dayHeaders}>
        {DAY_LABELS.map((l) => (
          <Text key={l} style={styles.dayHeader}>
            {l}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((d, i) => {
          const inMonth = d.getMonth() === month;
          const sel = isSameDay(d, selectedDate);
          const td = isToday(d);
          const hasBlocks = getGoalsForDate(goals, formatYmd(d)).length > 0;

          return (
            <Pressable
              key={i}
              style={styles.cell}
              onPress={() => onSelectDate(d)}
            >
              <View
                style={[
                  styles.cellInner,
                  sel && styles.cellSel,
                  td && !sel && styles.cellToday,
                ]}
              >
                <Text
                  style={[
                    styles.cellNum,
                    !inMonth && styles.cellNumMuted,
                    sel && styles.cellNumSel,
                    td && !sel && styles.cellNumToday,
                  ]}
                >
                  {d.getDate()}
                </Text>
              </View>
              {hasBlocks && (
                <View style={styles.dotRow}>
                  <View style={[styles.dot, sel && styles.dotSel]} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={styles.blockList} showsVerticalScrollIndicator={false}>
        {dayGoals.length > 0 ? (
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
                <Text style={styles.blockTitle} numberOfLines={1}>
                  {g.title}
                </Text>
                <Text variant="footnote" color="onSurfaceVariant">
                  {formatClockFromMinutes(startM)} – {formatClockFromMinutes(endM)}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <Text variant="bodySmall" color="onSurfaceVariant" style={styles.emptyText}>
            No blocks on this day.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.onSurfaceVariant,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 2,
  },
  cellInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellSel: {
    backgroundColor: theme.colors.primary,
  },
  cellToday: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  cellNum: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  cellNumMuted: {
    color: theme.colors.outlineVariant,
  },
  cellNumSel: {
    color: '#fff',
    fontWeight: '800',
  },
  cellNumToday: {
    color: theme.colors.primary,
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  dotSel: {
    backgroundColor: '#fff',
  },
  blockList: {
    flex: 1,
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.outlineVariant,
  },
  blockCard: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
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
  blockTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.onSurface,
    marginBottom: 2,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    lineHeight: 20,
  },
});
