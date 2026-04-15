import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { theme } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function GradientPrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  style,
}: Props) {
  const busy = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [
        styles.wrap,
        pressed && !busy && styles.pressed,
        busy && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={['#007AFF', '#5AC8FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.label}>{title}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    minHeight: 50,
  },
  gradient: {
    minHeight: 50,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.41,
    color: theme.colors.onPrimary,
  },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.35 },
});
