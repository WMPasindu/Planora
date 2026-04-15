import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import type { GoalLifecycle } from '@/types';
import { theme } from '@/theme';

import { Text } from '../ui/Text';

type Props = {
  title: string;
  /** e.g. "2h 15m" */
  logged: string;
  /** e.g. "5h" */
  target: string;
  progress: number;
  /** Timer running — accent control; otherwise play */
  active?: boolean;
  /** Defaults to `theme.colors.primary` */
  accentColor?: string;
  /** Schedule / cadence line */
  meta?: string;
  /** Fixed daily block, e.g. "9:00 AM–10:00 AM" — shown with a start/play icon */
  scheduleBlock?: string | null;
  /** Controls chip + timer vs static icon */
  lifecycle?: GoalLifecycle;
  onPress?: () => void;
  onToggleTimer?: () => void;
  /** Shown only when `lifecycle` is planned — icon buttons in the card header */
  onEditPlanned?: () => void;
  onDeletePlanned?: () => void;
};

function tagForLifecycle(l: GoalLifecycle | undefined): string {
  if (l === 'planned') return 'PLANNED';
  if (l === 'completed') return 'DONE';
  return 'GOAL';
}

export function ActiveGoalCard({
  title,
  logged,
  target,
  progress,
  active = false,
  accentColor,
  meta,
  scheduleBlock,
  lifecycle = 'active',
  onPress,
  onToggleTimer,
  onEditPlanned,
  onDeletePlanned,
}: Props) {
  const pct = Math.round(progress * 100);
  const accent = accentColor ?? theme.colors.primary;
  const isCompleted = lifecycle === 'completed';
  const isPlanned = lifecycle === 'planned';
  const showTimer = lifecycle === 'active';
  const plannedInlineActions = onEditPlanned != null || onDeletePlanned != null;
  const fillColor = active ? accent : theme.colors.surfaceContainerHigh;
  const mutedBar = isCompleted || isPlanned;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, isCompleted && styles.cardDone]}
    >
      <View style={styles.top}>
        <View style={styles.copy}>
          <Text variant="caption" color="onSurfaceVariant" style={styles.goalTag}>
            {tagForLifecycle(lifecycle)}
          </Text>
          <Text variant="headline" style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {scheduleBlock ? (
            <View style={styles.scheduleRow}>
              <Ionicons name="play-circle" size={15} color={accent} style={styles.scheduleIcon} />
              <Text variant="footnote" color="onSurfaceVariant" style={styles.scheduleText}>
                {scheduleBlock}
              </Text>
            </View>
          ) : null}
          {meta ? (
            <Text variant="footnote" color="onSurfaceVariant" style={styles.meta} numberOfLines={2}>
              {meta}
            </Text>
          ) : null}
        </View>
        {showTimer ? (
          <Pressable
            onPress={() => onToggleTimer?.()}
            style={[styles.ctrl, { backgroundColor: active ? accent : theme.colors.surfaceContainerHigh }]}
            accessibilityLabel={active ? 'Pause timer' : 'Start timer'}
          >
            <Ionicons
              name={active ? 'timer-outline' : 'play'}
              size={20}
              color={active ? '#fff' : theme.colors.onSurfaceVariant}
            />
          </Pressable>
        ) : plannedInlineActions ? (
          <View style={styles.plannedActionsWrap} accessibilityLabel="Goal actions">
            {onEditPlanned ? (
              <Pressable
                onPress={onEditPlanned}
                style={styles.iconBtn}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Edit upcoming goal"
              >
                <Ionicons name="pencil" size={20} color={accent} />
              </Pressable>
            ) : null}
            {onDeletePlanned ? (
              <Pressable
                onPress={onDeletePlanned}
                style={styles.iconBtn}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Remove upcoming goal"
              >
                <Ionicons name="trash-outline" size={22} color={theme.colors.error} />
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View
            style={[
              styles.ctrl,
              styles.ctrlStatic,
              { backgroundColor: isPlanned ? `${accent}18` : theme.colors.surfaceContainerHigh },
            ]}
            accessibilityLabel={isPlanned ? 'Starts in the future' : 'Completed'}
          >
            <Ionicons
              name={isPlanned ? 'calendar-outline' : 'checkmark-circle'}
              size={22}
              color={isPlanned ? accent : theme.colors.success}
            />
          </View>
        )}
      </View>
      <View style={styles.barRow}>
        <Text variant="footnote" color="onSurfaceVariant">
          {`${logged} | ${target}`}
        </Text>
        <Text variant="footnote" style={{ color: accent }}>
          {pct}%
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              flex: progress,
              backgroundColor: mutedBar ? theme.colors.outlineVariant : fillColor,
            },
          ]}
        />
        <View style={{ flex: Math.max(0.02, 1 - progress) }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...StyleSheet.flatten([
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      },
    ]),
  },
  cardDone: {
    opacity: 0.92,
  },
  pressed: { opacity: 0.92 },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  scheduleIcon: {
    marginTop: 1,
  },
  scheduleText: {
    flex: 1,
    lineHeight: 18,
    fontWeight: '600',
  },
  meta: {
    marginTop: 6,
    lineHeight: 18,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  copy: { flex: 1, paddingRight: theme.spacing.md },
  goalTag: {
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: { fontSize: 17 },
  ctrl: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctrlStatic: {
    opacity: 1,
  },
  plannedActionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  barRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceContainerHigh,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
});
