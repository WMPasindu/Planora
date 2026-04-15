import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { theme } from '@/theme';

import { Text } from '../ui/Text';

type Props = {
  /** 0–1 portions of the ring: logged, planned, remainder (gray) */
  loggedPortion: number;
  plannedPortion: number;
  /** 0–1 — shown as % in the center */
  utilizationPct: number;
};

const SIZE = 200;
const VB = 100;
const CX = 50;
const CY = 50;
const R = 36;
const STROKE = 10;
const C = 2 * Math.PI * R;

export function UtilizationDonut({
  loggedPortion,
  plannedPortion,
  utilizationPct,
}: Props) {
  const gLen = loggedPortion * C;
  const bLen = plannedPortion * C;
  const pct = Math.min(100, Math.max(0, Math.round(utilizationPct * 100)));

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${VB} ${VB}`}>
        <G transform={`rotate(-90 ${CX} ${CY})`}>
          <Circle
            cx={CX}
            cy={CY}
            r={R}
            stroke={theme.colors.surfaceContainerHigh}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={CX}
            cy={CY}
            r={R}
            stroke={theme.colors.success}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${gLen} ${C}`}
            strokeLinecap="round"
          />
          <Circle
            cx={CX}
            cy={CY}
            r={R}
            stroke={theme.colors.primary}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${bLen} ${C}`}
            strokeDashoffset={-gLen}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text variant="title" style={styles.pct}>
          {pct}%
        </Text>
        <Text variant="caption" color="onSurfaceVariant" style={styles.utilLabel}>
          UTILIZATION
        </Text>
      </View>
    </View>
  );
}

export function UtilizationLegend({
  loggedLabel,
  plannedLabel,
}: {
  loggedLabel: string;
  plannedLabel: string;
}) {
  return (
    <View style={styles.legend}>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
        <View>
          <Text variant="caption" color="onSurfaceVariant" style={styles.legendCap}>
            LOGGED
          </Text>
          <Text variant="headline">{loggedLabel}</Text>
        </View>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        <View>
          <Text variant="caption" color="onSurfaceVariant" style={styles.legendCap}>
            PLANNED
          </Text>
          <Text variant="headline">{plannedLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    width: SIZE,
    height: SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 4,
  },
  pct: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  utilLabel: {
    letterSpacing: 1.2,
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.xxl,
    marginTop: theme.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  legendCap: {
    letterSpacing: 0.6,
    marginBottom: 2,
  },
});
