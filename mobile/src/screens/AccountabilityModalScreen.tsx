import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, GradientPrimaryButton, Text, TextField } from '@/components';
import { useAppNavigation } from '@/navigation';
import { screenLayout, theme } from '@/theme';

export function AccountabilityModalScreen() {
  const { goBack } = useAppNavigation();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom', 'left', 'right']}>
      <Animated.View
        entering={SlideInDown.duration(400).springify().damping(20)}
        style={styles.sheet}
      >
        <Animated.View entering={FadeIn.delay(150).duration(250)} style={styles.handleWrap}>
          <View style={styles.handle} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100).duration(350)}>
          <Text variant="title" style={styles.title}>Quick Check-in</Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(200).duration(350)}>
          <Text variant="bodySmall" color="onSurfaceVariant" style={styles.body}>
            {"What did you accomplish? Keep it honest — your partners will see this."}
          </Text>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(300).duration(350)}>
          <TextField
            label={"Today's note"}
            placeholder="e.g. Finished design review, 2h deep work"
            multiline
            style={styles.input}
          />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(400).duration(350)}>
          <GradientPrimaryButton title="Submit" onPress={goBack} />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(450).duration(250)}>
          <Button title="Cancel" variant="ghost" onPress={goBack} />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.surfaceLowest },
  sheet: {
    flex: 1,
    paddingHorizontal: screenLayout.horizontal,
    paddingTop: screenLayout.top,
    paddingBottom: screenLayout.bottom,
    gap: theme.spacing.lg,
  },
  handleWrap: { alignItems: 'center' },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.outlineVariant,
  },
  title: { textAlign: 'center' },
  body: { textAlign: 'center', lineHeight: 22 },
  input: { minHeight: 120, textAlignVertical: 'top' },
});
