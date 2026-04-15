import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from './Text';

type Props = {
  size?: 'md' | 'lg';
};

export function LogoMark({ size = 'md' }: Props) {
  const isLg = size === 'lg';
  return (
    <View style={[styles.row, isLg && styles.rowLg]} accessibilityLabel="Planora">
      <LinearGradient
        colors={['#007AFF', '#5AC8FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.badge, isLg && styles.badgeLg]}
      >
        <Text variant="title" color="onPrimary" style={styles.monogram}>
          PL
        </Text>
      </LinearGradient>
      <View>
        <Text variant={isLg ? 'display' : 'title'} style={styles.wordmark}>
          Planora
        </Text>
        <Text variant="footnote" color="onSurfaceVariant">
          Time accountability
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  rowLg: { marginBottom: theme.spacing.sm },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeLg: { width: 52, height: 52, borderRadius: 16 },
  monogram: { fontWeight: '700', fontSize: 16 },
  wordmark: { color: theme.colors.onSurface },
});
