import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from '../ui/Text';

export function ProductivityBanner() {
  return (
    <LinearGradient
      colors={['#0A6E7C', '#1E3A5F', '#0D1B2A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.banner}
    >
      <View style={styles.orbs}>
        <View style={[styles.orb, styles.orb1]} />
        <View style={[styles.orb, styles.orb2]} />
        <View style={[styles.orb, styles.orb3]} />
      </View>
      <Text variant="caption" color="onPrimary" style={styles.stay}>
        Stay focused
      </Text>
      <Text variant="title" color="onPrimary" style={styles.wordmark}>
        Productivity
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    minHeight: 120,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
  },
  orbs: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  orb1: { width: 80, height: 80, top: -10, right: 20 },
  orb2: { width: 48, height: 48, top: 40, right: 80 },
  orb3: { width: 64, height: 64, bottom: -20, left: 40 },
  stay: {
    opacity: 0.85,
    marginBottom: 4,
  },
  wordmark: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
