import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from '../ui/Text';

export const ANALYTICS_TIMEFRAMES = ['DAY', 'WEEK', 'MONTH', '3 MONTH'] as const;
export type AnalyticsTimeframe = (typeof ANALYTICS_TIMEFRAMES)[number];

type Props = {
  value: AnalyticsTimeframe;
  onChange: (v: AnalyticsTimeframe) => void;
};

export function AnalyticsTimeframeBar({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {ANALYTICS_TIMEFRAMES.map((opt) => {
        const selected = value === opt;
        return (
          <Pressable key={opt} onPress={() => onChange(opt)} style={styles.tab}>
            <Text
              variant="footnote"
              style={[styles.label, selected && styles.labelActive]}
              numberOfLines={1}
            >
              {opt}
            </Text>
            {selected ? <View style={styles.underline} /> : <View style={styles.underlinePlaceholder} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    gap: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 8,
  },
  label: {
    color: theme.colors.onSurfaceVariant,
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: theme.colors.primary,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    right: 4,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  underlinePlaceholder: {
    height: 3,
    marginTop: 0,
  },
});
