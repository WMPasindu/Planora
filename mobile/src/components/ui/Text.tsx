import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';

import { theme } from '@/theme';

type Variant = keyof typeof theme.typography;

export type ThemedTextProps = RNTextProps & {
  variant?: Variant;
  color?: keyof typeof theme.colors;
};

export function Text({ variant = 'body', color = 'onSurface', style, ...rest }: ThemedTextProps) {
  const base = theme.typography[variant];
  return (
    <RNText
      style={[base, { color: theme.colors[color] }, style]}
      {...rest}
    />
  );
}

export const textStyles = StyleSheet.create({
  center: { textAlign: 'center' },
});
