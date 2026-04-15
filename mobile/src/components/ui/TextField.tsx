import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  type TextInputProps,
  type TextStyle,
  View,
  type StyleProp,
} from 'react-native';

import { theme } from '@/theme';

import { Text } from './Text';

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  labelStyle?: StyleProp<TextStyle>;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  ({ label, error, labelStyle, style, onFocus, onBlur, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <View style={styles.wrap}>
        {label ? (
          <Text variant="caption" color="onSurfaceVariant" style={[styles.label, labelStyle]}>
            {label}
          </Text>
        ) : null}
        <TextInput
          ref={ref}
          placeholderTextColor={theme.colors.outline}
          style={[
            styles.input,
            focused && styles.inputFocused,
            error && styles.inputError,
            style,
          ]}
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
        {error ? (
          <Text variant="caption" color="error" style={styles.error}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  }
);

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  wrap: { marginBottom: theme.spacing.lg },
  label: {
    marginBottom: 6,
    marginLeft: 4,
    textTransform: 'none',
  },
  input: {
    fontSize: 17,
    letterSpacing: -0.41,
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surfaceLowest,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  error: { marginTop: 4, marginLeft: 4 },
});
