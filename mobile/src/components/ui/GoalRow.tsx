import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from './Text';

type Props = {
  title: string;
  subtitle?: string;
  progress: number;
  emoji?: string;
  onPress?: () => void;
};

export function GoalRow({ title, subtitle, progress, emoji, onPress }: Props) {
  const pct = Math.round(100 * progress);
  const progressColor = progress >= 0.7
    ? theme.colors.success
    : progress >= 0.4
    ? theme.colors.tertiary
    : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${progressColor}15` }]}>
        {emoji ? (
          <Text variant="title">{emoji}</Text>
        ) : (
          <Ionicons name="flag-outline" size={18} color={progressColor} />
        )}
      </View>
      <View style={styles.copy}>
        <Text variant="headline" style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="footnote" color="onSurfaceVariant">
            {subtitle}
          </Text>
        ) : null}
        <View style={styles.trackOuter}>
          <View style={[styles.trackFill, { flex: progress, backgroundColor: progressColor }]} />
          <View style={{ flex: Math.max(0, 1 - progress) }} />
        </View>
      </View>
      <Text variant="headline" style={[styles.pct, { color: progressColor }]}>
        {pct}%
      </Text>
      <Ionicons name="chevron-forward" size={16} color={theme.colors.outline} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  pressed: { opacity: 0.7 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copy: { flex: 1, minWidth: 0 },
  title: { marginBottom: 2 },
  trackOuter: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.surfaceContainerHigh,
    overflow: 'hidden',
    flexDirection: 'row',
    marginTop: 8,
  },
  trackFill: {
    height: 4,
    borderRadius: 2,
  },
  pct: { minWidth: 40, textAlign: 'right' },
});
