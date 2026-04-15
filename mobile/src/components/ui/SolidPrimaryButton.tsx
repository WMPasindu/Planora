import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';

import { authIndigo } from '@/theme/auth';
import { theme } from '@/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function SolidPrimaryButton({ title, onPress, disabled, loading, style }: Props) {
  const busy = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={busy}
      style={({ pressed }) => [
        styles.btn,
        pressed && !busy && styles.pressed,
        busy && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.onPrimary} />
      ) : (
        <Text style={styles.label}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: authIndigo,
    borderRadius: theme.radii.md,
    minHeight: 52,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...StyleSheet.flatten([
      {
        shadowColor: authIndigo,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.28,
        shadowRadius: 12,
        elevation: 6,
      },
    ]),
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: '#FFFFFF',
  },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.4 },
});
