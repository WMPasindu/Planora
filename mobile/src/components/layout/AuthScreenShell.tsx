import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DecorativeBackdrop } from '../ui/DecorativeBackdrop';
import { screenLayout, theme } from '@/theme';

type Props = {
  children: ReactNode;
  /** Merged with default scroll content styles (e.g. vertical centering). */
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function AuthScreenShell({ children, contentContainerStyle }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <DecorativeBackdrop />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.fill}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surface },
  fill: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: screenLayout.horizontal,
    paddingBottom: screenLayout.bottom,
    paddingTop: screenLayout.top,
  },
});
