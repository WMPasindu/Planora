import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  Keyframe,
  ReduceMotion,
} from 'react-native-reanimated';

import { theme, cardShadow } from '@/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/** Smooth deceleration — close to iOS sheet / alert timing */
const ENTER_CURVE = Easing.bezier(0.16, 1, 0.3, 1);
const EXIT_CURVE = Easing.bezier(0.4, 0, 1, 1);

/**
 * Subtle lift + fade — avoids default ZoomIn (0→1) which reads as bouncy / “game UI”.
 */
const cardEntering = new Keyframe({
  0: {
    opacity: 0,
    transform: [{ scale: 0.94 }, { translateY: 18 }],
  },
  100: {
    opacity: 1,
    transform: [{ scale: 1 }, { translateY: 0 }],
    easing: ENTER_CURVE,
  },
})
  .duration(360)
  .delay(42)
  .reduceMotion(ReduceMotion.System);

const cardExiting = new Keyframe({
  0: {
    opacity: 1,
    transform: [{ scale: 1 }, { translateY: 0 }],
  },
  100: {
    opacity: 0,
    transform: [{ scale: 0.97 }, { translateY: 10 }],
    easing: EXIT_CURVE,
  },
})
  .duration(240)
  .reduceMotion(ReduceMotion.System);

const backdropEntering = FadeIn.duration(280)
  .easing(Easing.out(Easing.quad))
  .reduceMotion(ReduceMotion.System);

const backdropExiting = FadeOut.duration(200)
  .easing(Easing.in(Easing.quad))
  .reduceMotion(ReduceMotion.System);

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Use ScrollView when content can exceed ~70% of screen height */
  scrollable?: boolean;
};

/**
 * Full-screen dimmed overlay with a centered white card — same pattern as system-style
 * permission / confirmation popups (not a separate navigation screen or bottom sheet).
 */
export function CenteredModal({ visible, onClose, children, scrollable = true }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <View style={styles.root}>
        <Animated.View entering={backdropEntering} exiting={backdropExiting} style={styles.backdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Dismiss" />
        </Animated.View>

        <Animated.View
          entering={cardEntering}
          exiting={cardExiting}
          style={styles.cardWrap}
          pointerEvents="box-none"
        >
          <View style={[styles.card, cardShadow('medium')]}>
            {scrollable ? (
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                bounces={false}
              >
                {children}
              </ScrollView>
            ) : (
              children
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
  cardWrap: {
    width: '100%',
    maxWidth: Math.min(400, SCREEN_W - theme.spacing.xl * 2),
    maxHeight: SCREEN_H * 0.82,
  },
  card: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
});
