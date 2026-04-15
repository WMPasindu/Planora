import Constants from 'expo-constants';

function getExtra(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  return extra?.[key] ?? process.env[`EXPO_PUBLIC_${key}`];
}

export const supabaseUrl = getExtra('SUPABASE_URL') ?? '';
export const supabaseAnonKey = getExtra('SUPABASE_ANON_KEY') ?? '';

export function assertSupabaseConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase env missing. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
}

