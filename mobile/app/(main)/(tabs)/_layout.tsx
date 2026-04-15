import { Tabs } from 'expo-router';

import { AnimatedTabBar } from '@/components';
import { theme } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics' }}
      />
      <Tabs.Screen
        name="accountability"
        options={{ title: 'Goals' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings' }}
      />
    </Tabs>
  );
}
