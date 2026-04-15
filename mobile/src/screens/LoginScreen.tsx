import { Ionicons } from '@expo/vector-icons';
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
import { DEMO_USER } from '@/data/demoData';
import { signInWithEmailPassword } from '@/lib/api/authApi';
import { fetchProfile } from '@/lib/api/profileApi';
import { useAppNavigation } from '@/navigation';
import { useAppStore } from '@/stores/appStore';
import { useActivityStore } from '@/stores/activityStore';
import { useGoalsStore } from '@/stores/goalsStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { authCoral, authIndigo } from '@/theme';
import { theme } from '@/theme';
import { isValidEmail, minLength } from '@/utils/validation';

const LABEL = {
  letterSpacing: 0.55,
  fontWeight: '600' as const,
  textTransform: 'uppercase' as const,
  fontSize: 11,
};

function RememberRow({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.rememberRow} accessibilityRole="checkbox">
      <View style={[styles.cb, value && styles.cbOn]}>
        {value ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
      </View>
      <Text variant="bodySmall" color="onSurfaceVariant">
        Remember for 30 days
      </Text>
    </Pressable>
  );
}

export function LoginScreen() {
  const { replaceToDashboard, openForgotPassword, openRegister } = useAppNavigation();
  const signIn = useAppStore((s) => s.signIn);
  const setUser = useAppStore((s) => s.setUser);
  const resetGoalsToDemo = useGoalsStore((s) => s.resetToDemo);
  const resetActivityToDemo = useActivityStore((s) => s.resetToDemo);
  const syncGoals = useGoalsStore((s) => s.syncFromRemote);
  const syncActivity = useActivityStore((s) => s.syncFromRemote);
  const syncPrefs = usePreferencesStore((s) => s.syncFromRemote);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const onSubmit = useCallback(async () => {
    const next: typeof errors = {};
    if (!isValidEmail(email)) next.email = 'Enter a valid email.';
    if (!minLength(password, 8)) next.password = 'At least 8 characters.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      setSubmitting(true);
      await signInWithEmailPassword(email, password);
      const profile = await fetchProfile();
      if (!profile) {
        setDialog({ title: 'Sign-in failed', message: 'We could not load your profile.' });
        return;
      }
      signIn(profile, { verified: true });
      setUser(profile);
      await Promise.all([syncGoals(), syncActivity(), syncPrefs()]);
      replaceToDashboard();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Please check your credentials.';
      setDialog({ title: 'Sign-in failed', message });
    } finally {
      setSubmitting(false);
    }
  }, [email, password, replaceToDashboard, setUser, signIn, syncActivity, syncGoals, syncPrefs]);

  const onTryDemo = useCallback(() => {
    resetGoalsToDemo();
    resetActivityToDemo();
    signIn(DEMO_USER);
    replaceToDashboard();
  }, [replaceToDashboard, resetActivityToDemo, resetGoalsToDemo, signIn]);

  return (
    <AuthScreenShell>
      <AppHeader />

      <Text variant="largeTitle" style={styles.welcome}>
        Welcome back
      </Text>
      <Text variant="bodySmall" color="onSurfaceVariant" style={styles.sub}>
        Continue your high-performance journey.
      </Text>

      <View style={styles.form}>
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

        <View style={styles.pwdLabelRow}>
          <Text variant="caption" color="onSurfaceVariant" style={LABEL}>
            PASSWORD
          </Text>
          <Pressable onPress={openForgotPassword} accessibilityRole="link" hitSlop={8}>
            <Text variant="bodySmall" style={styles.forgot}>
              Forgot Password?
            </Text>
          </Pressable>
        </View>
        <PasswordField
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
        />

        <RememberRow value={remember} onToggle={() => setRemember((v) => !v)} />

        <SolidPrimaryButton
          title={submitting ? 'Signing in...' : 'Log In'}
          onPress={() => {
            void onSubmit();
          }}
          style={styles.cta}
        />

        <Pressable
          onPress={onTryDemo}
          accessibilityRole="button"
          accessibilityLabel="Explore the app with sample data"
          style={({ pressed }) => [styles.demoBtn, pressed && styles.demoBtnPressed]}
        >
          <Text variant="bodySmall" style={styles.demoBtnText}>
            Try demo — sample goals & profile
          </Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Text variant="bodySmall" color="onSurfaceVariant">
            {"Don't have an account? "}
          </Text>
          <Pressable onPress={openRegister} accessibilityRole="link">
            <Text variant="bodySmall" style={styles.requestAccess}>
              Request Access
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
  welcome: {
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
  pwdLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginLeft: 4,
  },
  forgot: {
    color: authCoral,
    fontWeight: '600',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: theme.spacing.xl,
    marginTop: -4,
  },
  cb: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.outline,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceLowest,
  },
  cbOn: {
    backgroundColor: authIndigo,
    borderColor: authIndigo,
  },
  cta: {
    alignSelf: 'stretch',
    marginBottom: theme.spacing.md,
  },
  demoBtn: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
    backgroundColor: theme.colors.surface,
  },
  demoBtnPressed: {
    opacity: 0.88,
  },
  demoBtnText: {
    fontWeight: '600',
    color: authIndigo,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  requestAccess: {
    fontWeight: '800',
    color: authIndigo,
  },
});
