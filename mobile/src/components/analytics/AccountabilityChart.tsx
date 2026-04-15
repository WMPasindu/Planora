import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from '../ui/Text';

const SLOTS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'] as const;

/** Utilized + missed portions per slot (sum ≤ 1; remainder is “empty” air) */
const DEFAULT_STACKS: { u: number; m: number }[] = [
  { u: 0.42, m: 0.12 },
  { u: 0.55, m: 0.18 },
  { u: 0.62, m: 0.08 },
  { u: 0.5, m: 0.22 },
  { u: 0.38, m: 0.15 },
  { u: 0.28, m: 0.1 },
];

const BAR_MAX = 132;

type Props = {
  stacks?: { u: number; m: number }[];
};

export function AccountabilityChart({ stacks = DEFAULT_STACKS }: Props) {
  return (
    <View style={styles.chart}>
      <View style={styles.grid}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.gridLine, { top: (i + 1) * (BAR_MAX / 5) }]} />
        ))}
      </View>
      <View style={styles.bars}>
        {stacks.map((d, i) => {
          const empty = Math.max(0, 1 - d.u - d.m);
          return (
            <View key={SLOTS[i]} style={styles.col}>
              <View style={[styles.barTrack, { height: BAR_MAX }]}>
                <View style={{ flex: empty }} />
                <View style={[styles.segment, { flex: d.m, backgroundColor: '#F87171' }]} />
                <View
                  style={[
                    styles.segment,
                    {
                      flex: d.u,
                      backgroundColor: theme.colors.success,
                      borderBottomLeftRadius: 6,
                      borderBottomRightRadius: 6,
                    },
                  ]}
                />
              </View>
              <Text variant="caption" color="onSurfaceVariant" style={styles.axis}>
                {SLOTS[i]}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chart: {
    marginTop: theme.spacing.md,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    top: 0,
    height: BAR_MAX,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.separator,
    opacity: 0.5,
  },
  bars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 6,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    maxWidth: 36,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: `${theme.colors.surfaceContainerHigh}99`,
  },
  segment: {
    width: '100%',
    minHeight: 2,
  },
  axis: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '500',
  },
});
