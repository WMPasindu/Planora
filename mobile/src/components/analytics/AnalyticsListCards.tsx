import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from '../ui/Text';

export type ArchivedItem = {
  id: string;
  title: string;
  meta: string;
  badge?: string;
  badgeTone?: 'success' | 'neutral';
  icon?: 'checkmark';
};

export type MissedItem = {
  id: string;
  title: string;
  meta: string;
  sub?: string;
  badge?: string;
  icon?: 'alert';
};

export function ArchivedCards({ items }: { items: ArchivedItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.id} style={[styles.card, styles.cardGreen]}>
          <View style={styles.cardInner}>
            <View style={styles.cardTop}>
              <Text variant="headline" style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.icon === 'checkmark' ? (
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
              ) : item.badge ? (
                <View
                  style={[
                    styles.badge,
                    item.badgeTone === 'success' && styles.badgeSuccess,
                    item.badgeTone === 'neutral' && styles.badgeNeutral,
                  ]}
                >
                  <Text
                    variant="caption"
                    style={[
                      styles.badgeText,
                      item.badgeTone === 'neutral' && styles.badgeTextNeutral,
                    ]}
                  >
                    {item.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text variant="footnote" color="onSurfaceVariant">
              {item.meta}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function MissedCards({ items }: { items: MissedItem[] }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <View key={item.id} style={[styles.card, styles.cardRed]}>
          <View style={styles.cardInner}>
            <View style={styles.missedTop}>
              <Text variant="headline" style={styles.cardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.icon === 'alert' ? (
                <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
              ) : item.badge ? (
                <View style={styles.badgeWarn}>
                  <Text variant="caption" style={styles.badgeTextDark}>
                    {item.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text variant="footnote" color="onSurfaceVariant">
              {item.meta}
            </Text>
            {item.sub ? (
              <Text variant="footnote" color="onSurfaceVariant" style={styles.sub}>
                {item.sub}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    flexDirection: 'row',
    ...StyleSheet.flatten([
      {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      },
    ]),
  },
  cardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  cardRed: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  cardInner: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: 6,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  missedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1 },
  sub: { marginTop: 2 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  badgeSuccess: {
    backgroundColor: `${theme.colors.success}18`,
  },
  badgeNeutral: {
    backgroundColor: theme.colors.surfaceContainerHigh,
  },
  badgeText: {
    color: theme.colors.success,
    fontWeight: '700',
    fontSize: 11,
  },
  badgeTextNeutral: {
    color: theme.colors.onSurfaceVariant,
  },
  badgeWarn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radii.sm,
    backgroundColor: '#FFEBE9',
  },
  badgeTextDark: {
    color: '#B71C1C',
    fontWeight: '700',
    fontSize: 11,
  },
});
