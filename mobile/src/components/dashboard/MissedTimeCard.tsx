import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from '../ui/Text';

type Props = {
  title: string;
  body: string;
};

export function MissedTimeCard({ title, body }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.inner}>
        <View style={styles.head}>
          <Ionicons name="warning" size={18} color={theme.colors.error} />
          <Text variant="caption" style={styles.badge}>
            MISSED TIME
          </Text>
        </View>
        <Text variant="headline" style={styles.title}>
          {title}
        </Text>
        <Text variant="bodySmall" color="onSurfaceVariant" style={styles.body}>
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFEBE9',
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  accent: {
    width: 4,
    backgroundColor: '#C62828',
  },
  inner: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    color: '#C62828',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  title: {
    color: '#B71C1C',
  },
  body: {
    lineHeight: 20,
  },
});
