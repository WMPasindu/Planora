export const routes = {
  root: '/',
  splash: '/splash',
  onboarding: '/onboarding',
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    verification: '/verification',
  },
  main: {
    dashboard: '/dashboard',
    analytics: '/analytics',
    notifications: '/notifications',
    settings: '/settings',
    accountability: '/accountability',
    profile: '/profile',
    createGoal: '/create-goal',
    plan: '/plan',
  },
} as const;
