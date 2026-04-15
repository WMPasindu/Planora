import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppDialog, AppHeader, AuthScreenShell, SolidPrimaryButton, Text, TextField } from '@/components';
import { requestPasswordReset } from '@/lib/api/profileApi';
import { useAppNavigation } from '@/navigation';
import { authIndigo } from '@/theme';
import { theme } from '@/theme';
import { isValidEmail } from '@/utils/validation';

const LABEL = {
  letterSpacing: 0.55,
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  fontSize: 11,
};

export function ForgotPasswordScreen() {
  const { goBack, openLogin } = useAppNavigation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message: string; goBack?: boolean } | null>(null);

  const onSubmit = useCallback(async () => {
    if (!isValidEmail(email)) {
      setError('Enter a valid email.');
      return;
    }
    setError(undefined);
    try {
      setSubmitting(true);
      await requestPasswordReset(email);
      setDialog({
        title: 'Check your inbox',
        message: 'If an account exists, recovery instructions were sent.',
        goBack: true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to request reset right now.';
      setDialog({ title: 'Reset request failed', message });
    } finally {
      setSubmitting(false);
    }
  }, [email, goBack]);

  return (
    <AuthScreenShell contentContainerStyle={styles.scrollCenter}>
      <AppHeader onBack={goBack} />
      <View style={styles.card}>
        <View style={styles.iconBox}>
          <View style={styles.iconInner}>
            <Ionicons name="refresh-outline" size={16} color={authIndigo} style={styles.cornerRefresh} />
            <Ionicons name="lock-closed-outline" size={28} color={authIndigo} />
          </View>
        </View>

        <Text variant="largeTitle" style={styles.title}>
          Reset Password.
        </Text>
        <Text variant="bodySmall" color="onSurfaceVariant" style={styles.instructions}>
          Enter the email address associated with your Planora account to receive recovery
          instructions.
        </Text>

        <TextField
          label="YOUR EMAIL"
          labelStyle={LABEL}
          placeholder="name@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          error={error}
        />

        <SolidPrimaryButton
          title={submitting ? 'Sending...' : 'Send Reset Link \u2192'}
          onPress={() => {
            void onSubmit();
          }}
          style={styles.cta}
        />

        <Pressable onPress={openLogin} accessibilityRole="link" style={styles.backWrap}>
          <Text style={styles.backLink}>{'< Back to Login'}</Text>
        </Pressable>
      </View>
      <AppDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        onClose={() => {
          const shouldGoBack = dialog?.goBack;
          setDialog(null);
          if (shouldGoBack) goBack();
        }}
        actions={[{ label: 'OK', variant: 'primary' }]}
      />
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  scrollCenter: {
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  card: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    borderWidth: 4,
    borderColor: authIndigo,
    padding: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  iconBox: {
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceContainerHigh,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerRefresh: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    letterSpacing: -0.3,
  },
  instructions: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  cta: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  backWrap: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  backLink: {
    color: authIndigo,
    fontWeight: '600',
    fontSize: 15,
    textDecorationLine: 'underline',
  },
});
