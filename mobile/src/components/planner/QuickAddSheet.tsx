import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { useGoalsStore } from '@/stores/goalsStore';
import { colors, theme } from '@/theme';
import type { GoalCadence, TrackedGoal } from '@/types';
import { formatClockFromMinutes, formatYmd } from '@/utils/goalLifecycle';
import { computeScheduleEndMinutes, findScheduleConflicts } from '@/utils/scheduleConflict';

import { AppDialog, type AppDialogAction } from '../ui/AppDialog';
import { Text } from '../ui/Text';
import { SegmentedPills } from '../dashboard/SegmentedPills';

const DURATION_OPTIONS = [
  { label: '30m', mins: 30 },
  { label: '1h', mins: 60 },
  { label: '1.5h', mins: 90 },
  { label: '2h', mins: 120 },
  { label: '3h', mins: 180 },
] as const;

const CADENCE_OPTIONS = ['Daily', 'Weekly', 'Monthly'] as const;
type CadenceTab = (typeof CADENCE_OPTIONS)[number];
const TAB_TO_CADENCE: Record<CadenceTab, GoalCadence> = {
  Daily: 'daily',
  Weekly: 'weekly',
  Monthly: 'monthly',
};

type Props = {
  visible: boolean;
  onClose: () => void;
  date: Date;
  prefillStartMinutes?: number;
};

function formatTargetHours(h: number, m: number): string {
  if (h === 0 && m === 0) return '0h';
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function QuickAddSheet({ visible, onClose, date, prefillStartMinutes }: Props) {
  const goals = useGoalsStore((s) => s.goals);
  const addGoal = useGoalsStore((s) => s.addGoal);

  const [name, setName] = useState('');
  const [startM, setStartM] = useState(prefillStartMinutes ?? 9 * 60);
  const [durMins, setDurMins] = useState(60);
  const [cadenceTab, setCadenceTab] = useState<CadenceTab>('Weekly');
  const [dialog, setDialog] = useState<{
    title: string;
    message?: string;
    actions?: AppDialogAction[];
  } | null>(null);

  const resetState = useCallback(() => {
    setName('');
    setStartM(prefillStartMinutes ?? 9 * 60);
    setDurMins(60);
    setCadenceTab('Weekly');
  }, [prefillStartMinutes]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const bumpStart = (delta: number) => {
    setStartM((s) => Math.max(0, Math.min(23 * 60 + 30, s + delta)));
  };

  const { endMinutes, ok: blockOk } = computeScheduleEndMinutes(startM, durMins);

  const handleSave = () => {
    if (name.trim().length < 2) {
      setDialog({
        title: 'Goal name required',
        message: 'Enter at least 2 characters.',
        actions: [{ label: 'OK', variant: 'primary' }],
      });
      return;
    }
    if (!blockOk) {
      setDialog({
        title: 'Invalid block time',
        message: 'This block ends after midnight. Start earlier or shorten it.',
        actions: [{ label: 'OK', variant: 'primary' }],
      });
      return;
    }

    const cadence = TAB_TO_CADENCE[cadenceTab];
    const candidate: Pick<
      TrackedGoal,
      'id' | 'startDate' | 'endDate' | 'cadence' | 'scheduleStartMinutes' | 'scheduleDurationMinutes' | 'scheduleEndMinutes'
    > = {
      id: '__qk__',
      startDate: formatYmd(date),
      endDate: null,
      cadence,
      scheduleStartMinutes: startM,
      scheduleDurationMinutes: durMins,
      scheduleEndMinutes: endMinutes,
    };

    const conflicts = findScheduleConflicts(candidate, goals);
    if (conflicts.length > 0) {
      setDialog({
        title: 'Schedule conflict',
        message: `"${conflicts[0].title}" already uses this time. Change start time or duration.`,
        actions: [{ label: 'OK', variant: 'primary' }],
      });
      return;
    }

    addGoal({
      title: name.trim(),
      logged: '0h 0m',
      target: formatTargetHours(Math.floor(durMins / 60), durMins % 60),
      progress: 0,
      timerActive: false,
      cadence,
      startDate: formatYmd(date),
      endDate: null,
      ongoing: true,
      completedAt: null,
      createdAt: new Date().toISOString(),
      scheduleStartMinutes: startM,
      scheduleDurationMinutes: durMins,
      scheduleEndMinutes: endMinutes,
    });

    handleClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <View />
      </Pressable>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrap}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <Text variant="headline" style={styles.sheetTitle}>
            Quick add block
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Goal name"
            placeholderTextColor={colors.outline}
            style={styles.nameInput}
            autoFocus
          />

          {/* Start time */}
          <Text variant="caption" color="onSurfaceVariant" style={styles.label}>
            START TIME
          </Text>
          <View style={styles.timeRow}>
            <Pressable onPress={() => bumpStart(-30)} hitSlop={8} style={styles.timeBtn}>
              <Ionicons name="remove-circle-outline" size={24} color={colors.primary} />
            </Pressable>
            <Text style={styles.timeBig}>{formatClockFromMinutes(startM)}</Text>
            <Pressable onPress={() => bumpStart(30)} hitSlop={8} style={styles.timeBtn}>
              <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            </Pressable>
          </View>

          {/* Duration chips */}
          <Text variant="caption" color="onSurfaceVariant" style={styles.label}>
            DURATION
          </Text>
          <View style={styles.durRow}>
            {DURATION_OPTIONS.map((opt) => {
              const sel = durMins === opt.mins;
              return (
                <Pressable
                  key={opt.label}
                  onPress={() => setDurMins(opt.mins)}
                  style={[styles.durChip, sel && styles.durChipSel]}
                >
                  <Text style={[styles.durLabel, sel && styles.durLabelSel]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Ends at */}
          <View style={styles.endsRow}>
            <Text variant="caption" color="onSurfaceVariant">
              ENDS AT
            </Text>
            <Text variant="headline" style={styles.endsValue}>
              {blockOk ? formatClockFromMinutes(endMinutes) : 'After midnight'}
            </Text>
          </View>

          {/* Cadence */}
          <Text variant="caption" color="onSurfaceVariant" style={styles.label}>
            REPEATS
          </Text>
          <SegmentedPills options={CADENCE_OPTIONS} value={cadenceTab} onChange={setCadenceTab} />

          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>Add block</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <AppDialog
        visible={dialog != null}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        actions={dialog?.actions}
        onClose={() => setDialog(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetWrap: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceLowest,
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl + 20,
    paddingTop: theme.spacing.md,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.outlineVariant,
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: theme.spacing.lg,
    color: colors.onSurface,
  },
  nameInput: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    marginBottom: theme.spacing.lg,
  },
  label: {
    letterSpacing: 0.8,
    fontWeight: '700',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: theme.spacing.lg,
  },
  timeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeBig: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    minWidth: 120,
    textAlign: 'center',
  },
  durRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  durChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  durChipSel: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  durLabelSel: {
    color: '#fff',
  },
  endsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: theme.radii.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    marginBottom: theme.spacing.lg,
  },
  endsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: theme.radii.xl,
    paddingVertical: 16,
    marginTop: theme.spacing.lg,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
