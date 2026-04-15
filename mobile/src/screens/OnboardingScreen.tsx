import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, GradientPrimaryButton, LogoMark, Text } from '@/components';
import { useAppNavigation } from '@/navigation';
import { useAppStore } from '@/stores/appStore';
import { screenLayout, theme } from '@/theme';

const { width: SCREEN_W } = Dimensions.get('window');

const STEPS = [
  {
    emoji: '🎯',
    title: 'Own your time',
    body: 'Set goals with clarity and track momentum without the noise of a typical productivity app.',
  },
  {
    emoji: '🤝',
    title: 'Stay accountable',
    body: 'A premium hub for commitments, honest progress tracking, and partner check-ins.',
  },
  {
    emoji: '🔔',
    title: 'Smart reminders',
    body: 'Connect calendars and get gentle nudges — on your terms, after verification.',
  },
] as const;

function AnimatedDot({ active }: { active: boolean }) {
  const style = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8, { damping: 15, stiffness: 200 }),
    backgroundColor: withTiming(
      active ? theme.colors.primary : theme.colors.outlineVariant,
      { duration: 200 },
    ),
    opacity: withTiming(active ? 1 : 0.4, { duration: 200 }),
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function OnboardingScreen() {
  const { replaceToLogin } = useAppNavigation();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList<(typeof STEPS)[number]>>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / SCREEN_W);
    if (i !== page) setPage(i);
  };

  const goAuth = () => {
    completeOnboarding();
    replaceToLogin();
  };

  const renderItem: ListRenderItem<(typeof STEPS)[number]> = ({ item }) => (
    <View style={[styles.page, { width: SCREEN_W }]}>
      <Text style={styles.emoji}>{item.emoji}</Text>
      <Text variant="largeTitle" style={styles.headline}>
        {item.title}
      </Text>
      <Text variant="body" color="onSurfaceVariant" style={styles.body}>
        {item.body}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Animated.View entering={FadeIn.duration(500).delay(100)} style={styles.logoRow}>
        <LogoMark />
      </Animated.View>
      <View style={styles.listWrap}>
        <FlatList
          ref={listRef}
          data={[...STEPS]}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScroll}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderItem}
          getItemLayout={(_, index) => ({
            length: SCREEN_W,
            offset: SCREEN_W * index,
            index,
          })}
        />
      </View>
      <Animated.View
        entering={FadeInUp.duration(500).delay(200).springify().damping(16)}
        style={styles.footer}
      >
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <AnimatedDot key={i} active={i === page} />
          ))}
        </View>
        <GradientPrimaryButton
          title={page < STEPS.length - 1 ? 'Next' : 'Get Started'}
          onPress={() => {
            if (page < STEPS.length - 1) {
              listRef.current?.scrollToIndex({ index: page + 1, animated: true });
            } else {
              goAuth();
            }
          }}
        />
        <Button title="I already have an account" variant="ghost" onPress={goAuth} />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surfaceLowest },
  logoRow: {
    paddingTop: screenLayout.top + theme.spacing.sm,
    paddingHorizontal: screenLayout.horizontal,
    paddingBottom: theme.spacing.sm,
  },
  listWrap: { flex: 1 },
  footer: {
    paddingHorizontal: screenLayout.horizontal,
    paddingBottom: screenLayout.bottom,
    gap: theme.spacing.lg,
  },
  page: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xxl,
  },
  emoji: { fontSize: 48, marginBottom: theme.spacing.lg },
  headline: { marginBottom: theme.spacing.md },
  body: { lineHeight: 26 },
  dots: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  dot: { height: 6, borderRadius: 3 },
});
