import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useAppStore } from '@/stores/appStore';

import { routes } from './routes';

export function useAppNavigation() {
  const router = useRouter();

  return useMemo(
    () => ({
      replaceToOnboarding: () => router.replace(routes.onboarding),
      replaceToLogin: () => router.replace(routes.auth.login),
      replaceToDashboard: () => router.replace(routes.main.dashboard),
      replaceToVerification: () => router.replace(routes.auth.verification),
      replaceToSplash: () => router.replace(routes.splash),

      openForgotPassword: () => router.push(routes.auth.forgotPassword),
      openRegister: () => router.push(routes.auth.register),
      openLogin: () => router.push(routes.auth.login),
      openProfile: () => router.push(routes.main.profile),
      openNotifications: () => router.push(routes.main.notifications),
      openCreateGoal: () => router.push(routes.main.createGoal),
      openEditGoal: (id: string) =>
        router.push({ pathname: routes.main.createGoal, params: { editId: id } }),
      openPlan: () => router.push(routes.main.plan),
      clearNotificationBadge: () => useAppStore.getState().clearNotificationBadge(),

      goBack: () => router.back(),
    }),
    [router]
  );
}
