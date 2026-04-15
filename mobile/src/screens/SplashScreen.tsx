import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DecorativeBackdrop, GradientPrimaryButton, LogoMark, Text } from '@/components';
import { useAppNavigation } from '@/navigation';
import { screenLayout, theme } from '@/theme';

export function SplashScreen() {
  const { replaceToOnboarding } = useAppNavigation();

  useEffect(() => {
    const t = setTimeout(() => replaceToOnboarding(), 2200);
    return () => clearTimeout(t);
  }, [replaceToOnboarding]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <DecorativeBackdrop />
      <View style={styles.content}>
        <Animated.View entering={FadeIn.duration(800).delay(100)}>
          <LogoMark size="lg" />
        </Animated.View>
        <Animated.View entering={FadeInUp.duration(600).delay(400).springify().damping(18)}>
          <Text variant="body" color="onSurfaceVariant" style={styles.tag}>
            Time accountability, simplified.
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.duration(500).delay(800).springify().damping(16)}>
          <GradientPrimaryButton
            title="Get Started"
            onPress={replaceToOnboarding}
            style={styles.cta}
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surfaceLowest },
  content: {
    flex: 1,
    paddingHorizontal: screenLayout.horizontal,
    paddingTop: screenLayout.top,
    paddingBottom: screenLayout.bottom,
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  tag: { lineHeight: 26, maxWidth: 300 },
  cta: { marginTop: theme.spacing.xxl, alignSelf: 'stretch' },
});
