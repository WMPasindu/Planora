import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { theme } from '@/theme';

import { AppDialog } from '../ui/AppDialog';
import { Text } from '../ui/Text';

export function AuthDividerWithLabel() {
  return (
    <View style={styles.divWrap}>
      <View style={styles.line} />
      <Text variant="caption" color="onSurfaceVariant" style={styles.divText}>
        OR AUTHENTICATE WITH
      </Text>
      <View style={styles.line} />
    </View>
  );
}

export function AuthSocialButtons() {
  const [dialogVisible, setDialogVisible] = useState(false);
  const soon = () => setDialogVisible(true);

  return (
    <>
      <View style={styles.row}>
        <Pressable onPress={soon} style={({ pressed }) => [styles.social, pressed && styles.socialPressed]}>
          <Ionicons name="logo-google" size={22} color="#4285F4" />
          <Text variant="bodySmall" style={styles.socialLabel}>
            Google
          </Text>
        </Pressable>
        <Pressable onPress={soon} style={({ pressed }) => [styles.social, pressed && styles.socialPressed]}>
          <Ionicons name="logo-github" size={22} color="#24292F" />
          <Text variant="bodySmall" style={styles.socialLabel}>
            GitHub
          </Text>
        </Pressable>
      </View>
      <AppDialog
        visible={dialogVisible}
        title="Coming soon"
        message="Social sign-in is coming in a future update."
        onClose={() => setDialogVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  divWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginVertical: theme.spacing.xl,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.separator,
  },
  divText: {
    letterSpacing: 0.6,
    fontWeight: '600',
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  social: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  socialPressed: { opacity: 0.88 },
  socialLabel: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
});
