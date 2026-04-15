import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppStore } from '@/stores/appStore';
import { theme } from '@/theme';

import { Text } from '../ui/Text';

type Props = {
  onPress: () => void;
  accessibilityLabel?: string;
};

export function HeaderBellButton({
  onPress,
  accessibilityLabel = 'Notifications',
}: Props) {
  const count = useAppStore((s) => s.notificationBadgeCount);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityLabel={accessibilityLabel}
      style={styles.wrap}
    >
      <Ionicons name="notifications-outline" size={24} color={theme.colors.onSurface} />
      {count > 0 ? (
        <View style={styles.badge} accessibilityElementsHidden>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : String(count)}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
