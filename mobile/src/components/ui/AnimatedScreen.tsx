import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { screenLayout, theme } from '@/theme';

type AnimatedScreenProps = ViewProps & {
  children: ReactNode;
  scroll?: boolean;
  safeAreaEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  tabBarPadding?: boolean;
};

export function AnimatedScreen({
  children,
  scroll = true,
  safeAreaEdges = ['top', 'left', 'right'],
  tabBarPadding = false,
  style,
  ...rest
}: AnimatedScreenProps) {
  const content = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        styles.scrollContent,
        tabBarPadding && styles.tabBarPadding,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        styles.nonScrollContent,
        tabBarPadding && styles.tabBarPadding,
      ]}
    >
      {children}
    </View>
  );

  return (
    <View style={styles.fill}>
      <SafeAreaView style={[styles.safe, style]} edges={safeAreaEdges} {...rest}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.fill}
        >
          {content}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  fill: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: screenLayout.horizontal,
    paddingBottom: screenLayout.bottom,
    paddingTop: screenLayout.top,
  },
  nonScrollContent: {
    flex: 1,
    paddingHorizontal: screenLayout.horizontal,
    paddingBottom: screenLayout.bottom,
    paddingTop: screenLayout.top,
  },
  tabBarPadding: {
    paddingBottom: 100,
  },
});
