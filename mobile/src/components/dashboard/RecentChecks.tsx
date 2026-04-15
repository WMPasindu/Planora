import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from '../ui/Text';

export type CheckItem = { id: string; title: string; time: string };

type Props = { items: CheckItem[] };

export function RecentChecks({ items }: Props) {
  if (items.length === 0) {
    return (
      <Text variant="footnote" color="onSurfaceVariant" style={styles.empty}>
        No check-ins in this period. Tap Check-in to log one.
      </Text>
    );
  }
  return (
    <View style={styles.wrap}>
      {items.map((item, index) => (
        <View key={item.id}>
          <View style={styles.row}>
            <View style={styles.icon}>
              <Ionicons name="checkmark" size={16} color={theme.colors.onPrimary} />
            </View>
            <View style={styles.copy}>
              <Text variant="headline">{item.title}</Text>
              <Text variant="footnote" color="onSurfaceVariant">
                {`Completed at ${item.time}`}
              </Text>
            </View>
          </View>
          {index < items.length - 1 ? <View style={styles.separator} /> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    paddingVertical: theme.spacing.sm,
    lineHeight: 20,
  },
  wrap: {},
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.separator,
    marginLeft: 28 + theme.spacing.md,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  copy: { flex: 1 },
});
