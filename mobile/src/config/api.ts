import Constants from 'expo-constants';

function getExtra(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  return extra?.[key] ?? process.env[`EXPO_PUBLIC_${key}`];
}

export const apiBaseUrl = getExtra('API_BASE_URL') ?? 'http://localhost:4000';

