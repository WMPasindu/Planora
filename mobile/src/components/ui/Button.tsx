import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type StyleProp,
  View,
  type ViewStyle,
} from 'react-native';

import { theme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'tinted';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  leftIcon,
  compact = false,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const palette = variantStyles[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        palette.container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator color={palette.indicator} />
        ) : (
          <>
            {leftIcon ? (
              <Ionicons name={leftIcon} size={18} color={palette.text} />
            ) : null}
            <Text style={[styles.label, compact && styles.labelCompact, { color: palette.text }]} numberOfLines={1}>
              {title}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radii.md,
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  compact: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.sm,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
  },
  labelCompact: {
    fontSize: 15,
  },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.35 },
});

const variantStyles = {
  primary: {
    container: { backgroundColor: theme.colors.primary },
    text: theme.colors.onPrimary,
    indicator: theme.colors.onPrimary,
  },
  secondary: {
    container: { backgroundColor: theme.colors.surfaceContainerHigh },
    text: theme.colors.primary,
    indicator: theme.colors.primary,
  },
  tinted: {
    container: { backgroundColor: `${theme.colors.primary}18` },
    text: theme.colors.primary,
    indicator: theme.colors.primary,
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: theme.colors.primary,
    indicator: theme.colors.primary,
  },
} as const;
