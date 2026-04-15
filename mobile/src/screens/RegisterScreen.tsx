import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AppHeader,
  AppDialog,
  AuthDividerWithLabel,
  AuthScreenShell,
  AuthSocialButtons,
  PasswordField,
  SolidPrimaryButton,
  Text,
  TextField,
} from '@/components';
import { signUpWithEmailPassword } from '@/lib/api/authApi';
import { fetchProfile } from '@/lib/api/profileApi';
import { useAppNavigation } from '@/navigation';
import { useAppStore } from '@/stores/appStore';
import { authIndigo } from '@/theme';
import { theme } from '@/theme';
import { isValidEmail, minLength } from '@/utils/validation';

const LABEL = {
  letterSpacing: 0.55,
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  fontSize: 11,
};

export function RegisterScreen() {
  const { replaceToVerification, openLogin, goBack } = useAppNavigation();
  const signIn = useAppStore((s) => s.signIn);
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = useCallback(async () => {
    const next: Record<string, string> = {};
    if (!minLength(name, 2)) next.name = 'Enter your name.';
    if (!isValidEmail(email)) next.email = 'Enter a valid email.';
    if (!minLength(password, 8)) next.password = 'At least 8 characters.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setSubmitting(true);
      await signUpWithEmailPassword({
        email,
        password,
        displayName: name.trim(),
      });
      const profile = await fetchProfile().catch(() => null);
      signIn(
        profile ?? { id: 'pending-user', email: email.trim().toLowerCase(), displayName: name.trim() },
        { verified: false }
      );
      replaceToVerification();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create your account.';
      setDialog({ title: 'Sign-up failed', message });
    } finally {
      setSubmitting(false);
    }
  }, [email, name, password, replaceToVerification, signIn]);

  return (
    <AuthScreenShell>
      <AppHeader onBack={goBack} />

      <Text variant="largeTitle" style={styles.title}>
        Create your account
      </Text>
      <Text variant="bodySmall" color="onSurfaceVariant" style={styles.sub}>
        Join Planora — continue your high-performance journey.
      </Text>

      <View style={styles.form}>
        <TextField
          label="FULL NAME"
          labelStyle={LABEL}
          placeholder="Alex Thompson"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoCapitalize="words"
        />
        <TextField
          label="EMAIL ADDRESS"
          labelStyle={LABEL}
          placeholder="name@company.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
        />
        <Text variant="caption" color="onSurfaceVariant" style={[styles.pwdLabel, LABEL]}>
          PASSWORD
        </Text>
        <PasswordField
          placeholder="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        <SolidPrimaryButton
          title={submitting ? 'Creating account...' : 'Continue'}
          onPress={() => {
            void onSubmit();
          }}
          style={styles.cta}
        />

        <View style={styles.footerRow}>
          <Text variant="bodySmall" color="onSurfaceVariant">
            Already have an account?{' '}
          </Text>
          <Pressable onPress={openLogin} accessibilityRole="link">
            <Text variant="bodySmall" style={styles.signIn}>
              Sign In
            </Text>
          </Pressable>
        </View>

        <AuthDividerWithLabel />
        <AuthSocialButtons />
      </View>
      <AppDialog
        visible={dialog !== null}
        title={dialog?.title ?? ''}
        message={dialog?.message}
        onClose={() => setDialog(null)}
        actions={[{ label: 'OK', variant: 'primary' }]}
      />
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  sub: {
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  form: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  pwdLabel: {
    marginBottom: 6,
    marginLeft: 4,
  },
  cta: {
    alignSelf: 'stretch',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  signIn: {
    fontWeight: '800',
    color: authIndigo,
  },
});
