import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { HeaderBellButton } from '../navigation/HeaderBellButton';
import { Avatar } from '../ui/Avatar';
import { Text } from '../ui/Text';

const SIDE = 44;

export type PlanoraScreenHeaderProps = {
  /** Main tabs: avatar opens profile. Stack / auth with back: chevron. */
  leading?: 'avatar' | 'back' | 'none';
  onLeadingPress?: () => void;
  /** Display name or email for left avatar initials */
  avatarName?: string;
  /** Helps build two-letter initials when the name is one character */
  avatarEmail?: string;
  /**
   * Notification bell; shown when `onBellPress` is set and this is not `false`.
   * Defaults to showing the bell whenever `onBellPress` is provided.
   */
  showBell?: boolean;
  onBellPress?: () => void;
  /**
   * Right side: default shows bell when `onBellPress` is set. Use `avatar` for profile (e.g. create goal).
   */
  trailing?: 'auto' | 'bell' | 'avatar' | 'none';
  onTrailingPress?: () => void;
  trailingAvatarName?: string;
  trailingAvatarEmail?: string;
};

export function PlanoraScreenHeader({
  leading = 'none',
  onLeadingPress,
  avatarName,
  avatarEmail,
  showBell,
  onBellPress,
  trailing = 'auto',
  onTrailingPress,
  trailingAvatarName,
  trailingAvatarEmail,
}: PlanoraScreenHeaderProps) {
  const displayBell =
    (trailing === 'auto' || trailing === 'bell') && onBellPress != null && showBell !== false;
  const displayTrailingAvatar = trailing === 'avatar' && onTrailingPress != null;

  return (
    <View style={styles.row}>
      <View style={[styles.side, styles.sideLeft]}>
        {leading === 'avatar' && onLeadingPress ? (
          <Avatar
            name={avatarName}
            email={avatarEmail}
            size={SIDE}
            onPress={onLeadingPress}
          />
        ) : leading === 'back' && onLeadingPress ? (
          <Pressable
            onPress={onLeadingPress}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={28} color={theme.colors.onSurface} />
          </Pressable>
        ) : (
          <View style={styles.spacer} />
        )}
      </View>

      <Text variant="title" style={styles.brand} numberOfLines={1}>
        Planora
      </Text>

      <View style={[styles.side, styles.sideRight]}>
        {displayBell && onBellPress ? (
          <HeaderBellButton onPress={onBellPress} />
        ) : displayTrailingAvatar ? (
          <Avatar
            name={trailingAvatarName}
            email={trailingAvatarEmail}
            size={SIDE}
            onPress={onTrailingPress}
          />
        ) : (
          <View style={styles.spacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  side: {
    width: SIDE,
    minWidth: SIDE,
    minHeight: SIDE,
    justifyContent: 'center',
  },
  sideLeft: {
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  spacer: {
    width: 28,
    height: 28,
  },
  brand: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.3,
    color: theme.colors.primary,
  },
});

