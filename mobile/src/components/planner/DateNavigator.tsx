import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';
import { isToday } from '@/utils/plannerHelpers';

import { Text } from '../ui/Text';

type Props = {
  date: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

function formatNavDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function DateNavigator({ date, onPrev, onNext, onToday }: Props) {
  const today = isToday(date);

  return (
    <View style={styles.row}>
      <Pressable onPress={onPrev} hitSlop={12} style={styles.arrow}>
        <Ionicons name="chevron-back" size={22} color={theme.colors.primary} />
      </Pressable>

      <Pressable onPress={onToday} style={styles.dateWrap}>
        <Text variant="headline" style={[styles.dateText, today && styles.todayText]}>
          {today ? 'Today' : formatNavDate(date)}
        </Text>
        {today && (
          <Text variant="footnote" color="onSurfaceVariant" style={styles.dateSub}>
            {formatNavDate(date)}
          </Text>
        )}
      </Pressable>

      <Pressable onPress={onNext} hitSlop={12} style={styles.arrow}>
        <Ionicons name="chevron-forward" size={22} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  arrow: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateWrap: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  todayText: {
    color: theme.colors.primary,
  },
  dateSub: {
    marginTop: 2,
    fontSize: 12,
  },
});
