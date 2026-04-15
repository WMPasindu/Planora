import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from './Text';

type Props = {
  label: string;
  value: string;
  hint?: string;
  accentColor?: string;
};

export function StatPill({ label, value, hint, accentColor = theme.colors.primary }: Props) {
  return (
    <View style={styles.pill}>
      <Text variant="caption" color="onSurfaceVariant" style={styles.label}>
        {label}
      </Text>
      <Text variant="display" style={[styles.value, { color: accentColor }]}>
        {value}
      </Text>
      {hint ? (
        <Text variant="footnote" color="onSurfaceVariant" numberOfLines={2}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.lg,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  label: { textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '500' },
  value: { marginVertical: 4 },
});
