import { Stack } from 'expo-router';

import { theme } from '@/theme';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'ios_from_right',
        animationDuration: 350,
        contentStyle: { backgroundColor: theme.colors.surface },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    />
  );
}
