import Constants from 'expo-constants';

function getExtra(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  return extra?.[key] ?? process.env[`EXPO_PUBLIC_${key}`];
}

/** API base URL when you connect a backend. */
export const apiBaseUrl = getExtra('API_URL') ?? '';

export const appName = 'Planora';
