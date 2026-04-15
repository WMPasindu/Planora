import type { User } from '@/types';

import { getCurrentUserId, supabase } from '@/lib/supabase/client';

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
};

export async function fetchProfile(): Promise<User | null> {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,display_name')
    .eq('id', userId)
    .single();
  if (error) throw error;
  if (!data) return null;
  const row = data as ProfileRow;
  return {
    id: row.id,
    email: row.email ?? '',
    displayName: row.display_name ?? undefined,
  };
}

export async function updateProfile(input: { displayName?: string; email?: string }): Promise<void> {
  const userId = await getCurrentUserId();
  if (input.email) {
    const { error: authErr } = await supabase.auth.updateUser({ email: input.email });
    if (authErr) throw authErr;
  }
  if (input.displayName !== undefined) {
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ display_name: input.displayName })
      .eq('id', userId);
    if (profileErr) throw profileErr;
  }
}

export async function changePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
  if (error) throw error;
}

