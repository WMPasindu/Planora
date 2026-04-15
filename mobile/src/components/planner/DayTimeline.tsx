import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import type { TrackedGoal } from '@/types';
import { theme } from '@/theme';
import { formatClockFromMinutes } from '@/utils/goalLifecycle';
import { blockBgForGoal, blockColorForGoal, isToday } from '@/utils/plannerHelpers';

import { Text } from '../ui/Text';

const HOUR_HEIGHT = 64;
const START_HOUR = 5;
const END_HOUR = 23;
const TOTAL_HOURS = END_HOUR - START_HOUR;
const LEFT_GUTTER = 52;

type Props = {
  goals: TrackedGoal[];
  allGoals: TrackedGoal[];
  date: Date;
  onBlockPress?: (goal: TrackedGoal) => void;
  onEmptyPress?: (minuteOfDay: number) => void;
};

function hourLabel(hour: number): string {
  if (hour === 0 || hour === 24) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function DayTimeline({ goals, allGoals, date, onBlockPress, onEmptyPress }: Props) {
  const showNow = isToday(date);
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowTop = ((nowMinutes / 60 - START_HOUR) / TOTAL_HOURS) * TOTAL_HOURS * HOUR_HEIGHT;

  const handleEmptyTap = (y: number) => {
    const minutes = Math.round(((y / (TOTAL_HOURS * HOUR_HEIGHT)) * TOTAL_HOURS + START_HOUR) * 60);
    const snapped = Math.round(minutes / 30) * 30;
    onEmptyPress?.(Math.max(0, Math.min(23 * 60 + 30, snapped)));
  };

  return (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.grid}>
        {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
          <View key={i} style={[styles.hourRow, { top: i * HOUR_HEIGHT }]}>
            <Text style={styles.hourText}>{hourLabel(START_HOUR + i)}</Text>
            <View style={styles.hourLine} />
          </View>
        ))}

        <Pressable
          style={[styles.tapZone, { height: TOTAL_HOURS * HOUR_HEIGHT }]}
          onPress={(e) => handleEmptyTap(e.nativeEvent.locationY)}
        />

        {goals.map((g) => {
          const startM = g.scheduleStartMinutes ?? 0;
          const durM = g.scheduleDurationMinutes ?? 60;
          const top = ((startM / 60 - START_HOUR) / TOTAL_HOURS) * TOTAL_HOURS * HOUR_HEIGHT;
          const height = Math.max(28, (durM / 60 / TOTAL_HOURS) * TOTAL_HOURS * HOUR_HEIGHT);
          const color = blockColorForGoal(g, allGoals);
          const endM = g.scheduleEndMinutes ?? startM + durM;

          return (
            <Pressable
              key={g.id}
              onPress={() => onBlockPress?.(g)}
              style={[
                styles.block,
                {
                  top,
                  height,
                  backgroundColor: blockBgForGoal(color),
                  borderLeftColor: color,
                  borderColor: `${color}44`,
                },
              ]}
            >
              <Text style={[styles.blockTitle, { color }]} numberOfLines={1}>
                {g.title}
              </Text>
              {height > 36 && (
                <Text style={[styles.blockTime, { color: `${color}99` }]}>
                  {formatClockFromMinutes(startM)} – {formatClockFromMinutes(endM)}
                </Text>
              )}
            </Pressable>
          );
        })}

        {showNow && nowTop > 0 && nowTop < TOTAL_HOURS * HOUR_HEIGHT && (
          <View style={[styles.nowLine, { top: nowTop }]} pointerEvents="none">
            <View style={styles.nowDot} />
            <View style={styles.nowBar} />
          </View>
        )}
      </View>

      {goals.length === 0 && (
        <View style={styles.emptyWrap}>
          <Ionicons name="calendar-outline" size={36} color={theme.colors.outlineVariant} />
          <Text variant="bodySmall" color="onSurfaceVariant" style={styles.emptyText}>
            No blocks scheduled. Tap the timeline or press + to add one.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  grid: {
    position: 'relative',
    minHeight: TOTAL_HOURS * HOUR_HEIGHT + 24,
    marginTop: 8,
  },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourText: {
    width: LEFT_GUTTER - 8,
    textAlign: 'right',
    fontSize: 11,
    color: theme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  hourLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.outlineVariant,
    marginLeft: 8,
  },
  tapZone: {
    position: 'absolute',
    left: LEFT_GUTTER,
    right: 0,
    top: 0,
  },
  block: {
    position: 'absolute',
    left: LEFT_GUTTER + 4,
    right: 8,
    borderRadius: theme.radii.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  blockTime: {
    fontSize: 11,
    marginTop: 2,
  },
  nowLine: {
    position: 'absolute',
    left: LEFT_GUTTER - 4,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
  },
  nowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.error,
  },
  nowBar: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.error,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 240,
  },
});
