import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

import { theme } from '@/theme';

import { Text } from './Text';

export type PasswordFieldProps = TextInputProps & {
  label?: string;
  error?: string;
};

export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(
  ({ label, error, style, onFocus, onBlur, secureTextEntry: _ignored, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const [visible, setVisible] = useState(false);

    return (
      <View style={styles.wrap}>
        {label ? (
          <Text variant="caption" color="onSurfaceVariant" style={styles.label}>
            {label}
          </Text>
        ) : null}
        <View
          style={[
            styles.inputRow,
            focused && styles.inputRowFocused,
            error && styles.inputRowError,
          ]}
        >
          <TextInput
            ref={ref}
            placeholderTextColor={theme.colors.outline}
            style={[styles.input, style]}
            secureTextEntry={!visible}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...rest}
          />
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={12}
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            style={styles.eye}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={theme.colors.onSurfaceVariant}
            />
          </Pressable>
        </View>
        {error ? (
          <Text variant="caption" color="error" style={styles.error}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  }
);

PasswordField.displayName = 'PasswordField';

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.lg },
  label: {
    marginBottom: 6,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    paddingRight: 8,
    minHeight: 50,
  },
  inputRowFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceLowest,
  },
  inputRowError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    fontSize: 17,
    letterSpacing: -0.41,
    color: theme.colors.onSurface,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    minHeight: 50,
  },
  eye: {
    padding: 8,
  },
  error: { marginTop: 4, marginLeft: 4 },
});
