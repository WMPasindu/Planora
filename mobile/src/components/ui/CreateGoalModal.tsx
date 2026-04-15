import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInRight,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { theme } from '@/theme';
import type { GoalTimeframe } from '@/types';

import { CenteredModal } from './CenteredModal';
import { Text } from './Text';
import { TextField } from './TextField';

const TIMEFRAMES: { key: GoalTimeframe; label: string; icon: keyof typeof Ionicons.glyphMap; desc: string }[] = [
  { key: 'daily', label: 'Daily', icon: 'today-outline', desc: 'Reset every day' },
  { key: 'weekly', label: 'Weekly', icon: 'calendar-outline', desc: 'Cycles each week' },
  { key: 'monthly', label: 'Monthly', icon: 'albums-outline', desc: 'Monthly target' },
  { key: 'custom', label: 'Custom', icon: 'flag-outline', desc: 'Pick a date' },
];

const STEPS = ['Goal', 'Schedule', 'Confirm'] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave?: (goal: { title: string; notes: string; timeframe: GoalTimeframe; targetDate: string }) => void;
};

function StepDot({ active, completed }: { active: boolean; completed: boolean }) {
  const style = useAnimatedStyle(() => ({
    width: withTiming(active ? 22 : 7, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    }),
    backgroundColor: withTiming(
      completed ? theme.colors.success : active ? theme.colors.primary : theme.colors.outlineVariant,
      { duration: 200, easing: Easing.out(Easing.quad) },
    ),
  }));

  return <Animated.View style={[styles.stepDot, style]} />;
}

function TimeframeOption({
  item,
  selected,
  onPress,
  index,
}: {
  item: (typeof TIMEFRAMES)[number];
  selected: boolean;
  onPress: () => void;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInRight.delay(index * 32)
        .duration(220)
        .easing(Easing.out(Easing.quad))}
    >
      <Pressable
        onPress={onPress}
        style={[styles.timeframeRow, selected && styles.timeframeSelected]}
      >
        <View style={[styles.timeframeIcon, selected && styles.timeframeIconSelected]}>
          <Ionicons
            name={item.icon}
            size={18}
            color={selected ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        </View>
        <View style={styles.timeframeCopy}>
          <Text variant="headline">{item.label}</Text>
          <Text variant="footnote" color="onSurfaceVariant">{item.desc}</Text>
        </View>
        {selected ? (
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
        ) : (
          <View style={styles.radioOuter} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export function CreateGoalModal({ visible, onClose, onSave }: Props) {
  const stepEntering = useMemo(
    () => FadeIn.duration(260).easing(Easing.out(Easing.cubic)),
    [],
  );

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [timeframe, setTimeframe] = useState<GoalTimeframe>('weekly');
  const [targetDate, setTargetDate] = useState('');
  const [error, setError] = useState<string | undefined>();

  const reset = useCallback(() => {
    setStep(0);
    setTitle('');
    setNotes('');
    setTimeframe('weekly');
    setTargetDate('');
    setError(undefined);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(reset, 280);
  }, [onClose, reset]);

  const next = useCallback(() => {
    if (step === 0) {
      if (title.trim().length < 2) {
        setError('Give your goal a short name');
        return;
      }
      setError(undefined);
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      onSave?.({ title: title.trim(), notes: notes.trim(), timeframe, targetDate });
      handleClose();
    }
  }, [step, title, notes, timeframe, targetDate, onSave, handleClose]);

  const back = useCallback(() => {
    if (step === 0) handleClose();
    else setStep((s) => s - 1);
  }, [step, handleClose]);

  return (
    <CenteredModal visible={visible} onClose={handleClose} scrollable>
      <View style={styles.iconCircle}>
        <Ionicons name="flag-outline" size={28} color={theme.colors.primary} />
      </View>

      <View style={styles.headerRow}>
        <Pressable onPress={back} hitSlop={12} accessibilityLabel={step === 0 ? 'Close' : 'Back'}>
          <Ionicons
            name={step === 0 ? 'close' : 'chevron-back'}
            size={24}
            color={theme.colors.onSurface}
          />
        </Pressable>
        <View style={styles.stepper}>
          {STEPS.map((_, i) => (
            <StepDot key={i} active={i === step} completed={i < step} />
          ))}
        </View>
        <View style={{ width: 24 }} />
      </View>

      <Text variant="caption" color="onSurfaceVariant" style={styles.stepLabel}>
        {`Step ${step + 1} of ${STEPS.length}`}
      </Text>

      {step === 0 ? (
        <Animated.View entering={stepEntering}>
          <Text variant="title" style={styles.headline}>
            {"What's your goal?"}
          </Text>
          <Text variant="bodySmall" color="onSurfaceVariant" style={styles.subtitle}>
            Keep it simple and actionable. You can add more goals anytime.
          </Text>
          <TextField
            label="Goal title"
            placeholder="e.g. 4 deep work sessions"
            value={title}
            onChangeText={setTitle}
            error={error}
          />
          <TextField
            label="Notes (optional)"
            placeholder="Any context..."
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.notesInput}
          />
        </Animated.View>
      ) : null}

      {step === 1 ? (
        <Animated.View entering={stepEntering}>
          <Text variant="title" style={styles.headline}>
            Set a schedule
          </Text>
          <Text variant="bodySmall" color="onSurfaceVariant" style={styles.subtitle}>
            How often should we track this goal?
          </Text>
          <View style={styles.timeframeList}>
            {TIMEFRAMES.map((tf, i) => (
              <TimeframeOption
                key={tf.key}
                item={tf}
                selected={timeframe === tf.key}
                onPress={() => setTimeframe(tf.key)}
                index={i}
              />
            ))}
          </View>
          {timeframe === 'custom' ? (
            <TextField
              label="Target date"
              placeholder="YYYY-MM-DD"
              value={targetDate}
              onChangeText={setTargetDate}
            />
          ) : null}
        </Animated.View>
      ) : null}

      {step === 2 ? (
        <Animated.View entering={stepEntering}>
          <Text variant="title" style={styles.headline}>
            Review
          </Text>
          <View style={styles.reviewCard}>
            <View style={styles.reviewRow}>
              <Text variant="footnote" color="onSurfaceVariant">Goal</Text>
              <Text variant="headline">{title}</Text>
            </View>
            <View style={styles.reviewDivider} />
            <View style={styles.reviewRow}>
              <Text variant="footnote" color="onSurfaceVariant">Schedule</Text>
              <Text variant="headline">
                {TIMEFRAMES.find((t) => t.key === timeframe)?.label}
              </Text>
            </View>
            {targetDate ? (
              <>
                <View style={styles.reviewDivider} />
                <View style={styles.reviewRow}>
                  <Text variant="footnote" color="onSurfaceVariant">Target</Text>
                  <Text variant="headline">{targetDate}</Text>
                </View>
              </>
            ) : null}
            {notes ? (
              <>
                <View style={styles.reviewDivider} />
                <View style={styles.reviewRow}>
                  <Text variant="footnote" color="onSurfaceVariant">Notes</Text>
                  <Text variant="bodySmall">{notes}</Text>
                </View>
              </>
            ) : null}
          </View>
        </Animated.View>
      ) : null}

      <Pressable onPress={next} style={styles.ctaButton}>
        <Text variant="headline" color="onPrimary">
          {step < STEPS.length - 1 ? 'Continue' : 'Create Goal'}
        </Text>
      </Pressable>

      {step === 2 ? (
        <Pressable
          onPress={() => {
            onSave?.({ title: title.trim(), notes: notes.trim(), timeframe, targetDate });
            reset();
            setStep(0);
          }}
          style={styles.addAnother}
        >
          <Ionicons name="add-circle-outline" size={18} color={theme.colors.primary} />
          <Text variant="bodySmall" color="primary">Save & add another</Text>
        </Pressable>
      ) : null}
    </CenteredModal>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${theme.colors.primary}14`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  stepper: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
  },
  stepLabel: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    textTransform: 'none',
  },
  headline: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  notesInput: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  timeframeList: {
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  timeframeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: 12,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  timeframeSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}08`,
  },
  timeframeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeframeIconSelected: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  timeframeCopy: { flex: 1 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: theme.colors.outlineVariant,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  reviewRow: {
    gap: 4,
    paddingVertical: 6,
  },
  reviewDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.separator,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  addAnother: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: theme.spacing.md,
  },
});
