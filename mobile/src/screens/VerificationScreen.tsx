import { Redirect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

import {
  AuthScreenShell,
  Button,
  GradientPrimaryButton,
  LogoMark,
  AppDialog,
  Text,
  TextField,
} from '@/components';
import { verifyEmailToken } from '@/lib/api/authApi';
import { routes, useAppNavigation } from '@/navigation';
import { useAppStore } from '@/stores/appStore';
import { theme } from '@/theme';
import { minLength } from '@/utils/validation';

export function VerificationScreen() {
  const { replaceToDashboard } = useAppNavigation();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const alreadyVerified = useAppStore((s) => s.emailVerified);
  const markEmailVerified = useAppStore((s) => s.markEmailVerified);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [dialogVisible, setDialogVisible] = useState(false);

  const goMain = useCallback(() => {
    markEmailVerified();
    replaceToDashboard();
  }, [markEmailVerified, replaceToDashboard]);

  const onVerify = useCallback(async () => {
    if (!minLength(code, 4)) {
      setError('Enter the code from your email.');
      return;
    }
    setError(undefined);
    const verified = await verifyEmailToken(code)
      .then(() => true)
      .catch(() => false);
    if (!verified) {
      setDialogVisible(true);
      return;
    }
    goMain();
  }, [code, goMain]);

  if (!isAuthenticated) return <Redirect href={routes.auth.login} />;
  if (alreadyVerified) return <Redirect href={routes.main.dashboard} />;

  return (
    <AuthScreenShell>
      <Animated.View entering={FadeIn.duration(400).delay(100)} style={styles.hero}>
        <LogoMark />
        <Text variant="largeTitle" style={styles.title}>Verify Email</Text>
        <Text variant="bodySmall" color="onSurfaceVariant">
          Enter the code we sent you to complete setup.
        </Text>
      </Animated.View>
      <Animated.View entering={FadeInUp.duration(400).delay(200).springify().damping(18)} style={styles.form}>
        <TextField
          label="Verification code"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          error={error}
        />
        <GradientPrimaryButton
          title="Verify"
          onPress={() => {
            void onVerify();
          }}
        />
        <View style={styles.alt}>
          <Button title="Skip for now" variant="ghost" onPress={goMain} />
        </View>
      </Animated.View>
      <AppDialog
        visible={dialogVisible}
        title="Email not verified yet"
        message="Confirm your email from the link we sent, then try again."
        onClose={() => setDialogVisible(false)}
        actions={[{ label: 'OK', variant: 'primary' }]}
      />
    </AuthScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: theme.spacing.xxl, gap: theme.spacing.sm },
  title: { marginTop: theme.spacing.md },
  form: {
    backgroundColor: theme.colors.surfaceLowest,
    borderRadius: theme.radii.xl,
    padding: theme.spacing.xl,
  },
  alt: { marginTop: theme.spacing.md },
});
