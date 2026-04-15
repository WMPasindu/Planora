import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { Text } from './Text';

type Props = {
  name?: string | null;
  /** Used when `name` is missing or too short for two letters (e.g. single-letter names). */
  email?: string | null;
  size?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
};

function initialsFromEmailLocal(email: string): string {
  const local = email.split('@')[0]?.replace(/[^a-zA-Z0-9]/g, '') ?? '';
  if (local.length >= 2) return local.slice(0, 2).toUpperCase();
  if (local.length === 1) return `${local[0]}${local[0]}`.toUpperCase();
  return 'CG';
}

/** Two-letter initials: avoids a single “X” that can read like a close control. */
export function getAvatarInitials(name?: string | null, email?: string | null): string {
  const n = name?.trim();
  const e = email?.trim();

  if (n?.includes('@')) {
    return initialsFromEmailLocal(n);
  }

  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`;
      return a.toUpperCase().slice(0, 2);
    }

    const word = parts[0] ?? '';
    if (word.length >= 2) {
      return word.slice(0, 2).toUpperCase();
    }

    if (word.length === 1) {
      if (e) return initialsFromEmailLocal(e);
      return 'CG';
    }
  }

  if (e) return initialsFromEmailLocal(e);
  return 'CG';
}

export function Avatar({
  name,
  email,
  size = 44,
  onPress,
  accessibilityLabel,
}: Props) {
  const initials = getAvatarInitials(name, email);

  const label = accessibilityLabel ?? (onPress ? 'Open profile' : undefined);

  const inner = (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.primary,
        },
      ]}
    >
      <Text variant="label" color="onPrimary" style={[styles.label, { fontSize: size * 0.34 }]}>
        {initials}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        hitSlop={8}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {inner}
      </Pressable>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: { opacity: 0.85 },
  label: { letterSpacing: 0.5, textTransform: 'none' },
});
