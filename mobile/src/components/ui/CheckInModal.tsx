import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { CenteredModal } from './CenteredModal';
import { Text } from './Text';
import { TextField } from './TextField';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
};

export function CheckInModal({ visible, onClose, onSubmit }: Props) {
  const [note, setNote] = useState('');

  const handleSubmit = useCallback(() => {
    onSubmit(note.trim());
    setNote('');
    onClose();
  }, [note, onClose, onSubmit]);

  const handleClose = useCallback(() => {
    setNote('');
    onClose();
  }, [onClose]);

  return (
    <CenteredModal visible={visible} onClose={handleClose} scrollable>
      <View style={styles.iconCircle}>
        <Ionicons name="chatbubble-ellipses-outline" size={26} color={theme.colors.primary} />
      </View>

      <Text variant="title" style={styles.title}>Quick Check-in</Text>
      <Text variant="bodySmall" color="onSurfaceVariant" style={styles.body}>
        {"What did you accomplish today? Your partners will see this."}
      </Text>

      <TextField
        label="Today's note"
        placeholder="e.g. Finished design review, 2h deep work"
        value={note}
        onChangeText={setNote}
        multiline
        style={styles.input}
        autoFocus
      />

      <Pressable onPress={handleSubmit} style={styles.ctaButton}>
        <Text variant="headline" color="onPrimary">Submit</Text>
      </Pressable>

      <Pressable onPress={handleClose} style={styles.secondary} accessibilityRole="button">
        <Text variant="bodySmall" color="primary">Not now</Text>
      </Pressable>
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
  title: { textAlign: 'center', marginBottom: theme.spacing.sm },
  body: { textAlign: 'center', lineHeight: 22, marginBottom: theme.spacing.lg },
  input: { minHeight: 110, textAlignVertical: 'top' },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.md,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  secondary: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
});
