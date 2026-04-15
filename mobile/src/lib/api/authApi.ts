import { supabase } from '@/lib/supabase/client';

export async function signInWithEmailPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
}

export async function signUpWithEmailPassword(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<void> {
  const { error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: {
        display_name: input.displayName ?? null,
      },
    },
  });
  if (error) throw error;
}

export async function signOutRemote(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

