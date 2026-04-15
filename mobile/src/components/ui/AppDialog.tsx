import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { CenteredModal } from './CenteredModal';
import { Text } from './Text';

export type AppDialogAction = {
  label: string;
  variant?: 'default' | 'primary' | 'destructive';
  onPress?: () => void;
};

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  actions?: AppDialogAction[];
  onClose: () => void;
};

export function AppDialog({ visible, title, message, actions, onClose }: Props) {
  const actionList: AppDialogAction[] =
    actions && actions.length > 0 ? actions : [{ label: 'OK', variant: 'primary' }];

  const handleAction = (action: AppDialogAction) => {
    onClose();
    action.onPress?.();
  };

  return (
    <CenteredModal visible={visible} onClose={onClose} scrollable={false}>
      <View style={styles.wrap}>
        <Text variant="headline" style={styles.title}>
          {title}
        </Text>
        {message ? (
          <Text variant="bodySmall" color="onSurfaceVariant" style={styles.message}>
            {message}
          </Text>
        ) : null}

        <View style={styles.actions}>
          {actionList.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => handleAction(action)}
              style={({ pressed }) => [
                styles.actionBtn,
                action.variant === 'primary' && styles.primaryBtn,
                action.variant === 'destructive' && styles.destructiveBtn,
                pressed && styles.pressed,
              ]}
            >
              <Text
                variant="bodySmall"
                style={[
                  styles.actionText,
                  action.variant === 'primary' && styles.primaryText,
                  action.variant === 'destructive' && styles.destructiveText,
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </CenteredModal>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.sm,
  },
  message: {
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  actionBtn: {
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  primaryBtn: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  destructiveBtn: {
    borderColor: `${theme.colors.error}55`,
    backgroundColor: `${theme.colors.error}14`,
  },
  actionText: {
    fontWeight: '700',
    color: theme.colors.onSurface,
  },
  primaryText: {
    color: theme.colors.onPrimary,
  },
  destructiveText: {
    color: theme.colors.error,
  },
  pressed: {
    opacity: 0.86,
  },
});

