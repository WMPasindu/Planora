import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from '../ui/Text';

type Props<T extends string> = {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
};

/** Shared home-style segmented control (Day / Week / Month / …). */
export function SegmentedPills<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.pill, selected && styles.pillSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text
              variant="footnote"
              style={[styles.label, selected && styles.labelSelected]}
              numberOfLines={1}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: theme.radii.lg,
    padding: 4,
    gap: 4,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: theme.colors.surfaceLowest,
    ...StyleSheet.flatten([
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      },
    ]),
  },
  label: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
    fontSize: 12,
  },
  labelSelected: {
    color: theme.colors.onSurface,
  },
});
