import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { fetchProfile } from '@/lib/api/profileApi';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@/types';

type AppState = {
  hasCompletedOnboarding: boolean;
  authBootstrapped: boolean;
  isAuthenticated: boolean;
  /** False after register until verification screen completes. */
  emailVerified: boolean;
  user: User | null;
  /** Shown on notification tab + header bells; cleared when user opens Notifications. */
  notificationBadgeCount: number;
  completeOnboarding: () => void;
  bootstrapAuthSession: () => Promise<void>;
  signIn: (user: User, options?: { verified?: boolean }) => void;
  setUser: (user: User) => void;
  markEmailVerified: () => void;
  signOut: () => void;
  setNotificationBadgeCount: (n: number) => void;
  clearNotificationBadge: () => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      authBootstrapped: false,
      isAuthenticated: false,
      emailVerified: true,
      user: null,
      notificationBadgeCount: 3,
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      bootstrapAuthSession: async () => {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          if (!session?.user) {
            set({
              authBootstrapped: true,
              isAuthenticated: false,
              emailVerified: true,
              user: null,
            });
            return;
          }

          const profile = await fetchProfile().catch(() => null);
          const user: User = profile ?? {
            id: session.user.id,
            email: session.user.email ?? '',
            displayName:
              (session.user.user_metadata?.display_name as string | undefined) ?? undefined,
          };

          set({
            authBootstrapped: true,
            isAuthenticated: true,
            user,
            emailVerified: Boolean(session.user.email_confirmed_at),
          });
        } catch {
          set({ authBootstrapped: true });
        }
      },
      signIn: (user, options) =>
        set({
          isAuthenticated: true,
          user,
          emailVerified: options?.verified ?? true,
        }),
      setUser: (user) => set({ user }),
      markEmailVerified: () => set({ emailVerified: true }),
      signOut: () =>
        set({
          authBootstrapped: true,
          isAuthenticated: false,
          user: null,
          emailVerified: true,
          notificationBadgeCount: 0,
        }),
      setNotificationBadgeCount: (n) =>
        set({ notificationBadgeCount: Math.max(0, Math.floor(n)) }),
      clearNotificationBadge: () => set({ notificationBadgeCount: 0 }),
    }),
    {
      name: 'planora-app',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        authBootstrapped: state.authBootstrapped,
        isAuthenticated: state.isAuthenticated,
        emailVerified: state.emailVerified,
        user: state.user,
        notificationBadgeCount: state.notificationBadgeCount,
      }),
    }
  )
);
