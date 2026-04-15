import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { theme, cardShadow } from '@/theme';

export type CardProps = ViewProps & {
  children: ReactNode;
  elevated?: boolean;
};

export function Card({ children, style, elevated = false, ...rest }: CardProps) {
  return (
    <View
      style={[styles.card, elevated && cardShadow('low'), style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
  },
});
