import type { User } from '@/types';

import { apiRequest } from './client';

export async function fetchProfile(): Promise<User | null> {
  const row = await apiRequest<{
    id: string;
    email: string;
    displayName?: string;
    emailVerified?: boolean;
  } | null>('/v1/profile');
  if (!row) return null;
  return {
    id: row.id,
    email: row.email ?? '',
    displayName: row.displayName ?? undefined,
  };
}

export async function updateProfile(input: { displayName?: string; email?: string }): Promise<void> {
  await apiRequest('/v1/profile', { method: 'PATCH', body: input });
}

export async function changePassword(newPassword: string): Promise<void> {
  throw new Error(`Direct password change is not supported. Use reset flow.`);
}

export async function requestPasswordReset(email: string): Promise<void> {
  await apiRequest('/v1/auth/request-password-reset', {
    method: 'POST',
    auth: false,
    body: { email: email.trim().toLowerCase() },
  });
}

