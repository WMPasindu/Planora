import { apiRequest, clearAuthTokens, setAuthTokens } from './client';

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ emailVerified: boolean }> {
  const response = await apiRequest<{
    accessToken: string;
    refreshToken: string;
    user?: { emailVerified?: boolean };
  }>(
    '/v1/auth/login',
    {
      method: 'POST',
      auth: false,
      body: {
        email: email.trim().toLowerCase(),
        password,
      },
    }
  );
  await setAuthTokens(response);
  return { emailVerified: Boolean(response.user?.emailVerified) };
}

export async function signUpWithEmailPassword(input: {
  email: string;
  password: string;
  displayName?: string;
}): Promise<void> {
  await apiRequest('/v1/auth/register', {
    method: 'POST',
    auth: false,
    body: {
      email: input.email.trim().toLowerCase(),
      password: input.password,
      displayName: input.displayName ?? null,
    },
  });

  // auto-login for smooth onboarding
  await signInWithEmailPassword(input.email, input.password);
}

export async function signOutRemote(): Promise<void> {
  try {
    await apiRequest('/v1/auth/logout', {
      method: 'POST',
      body: {},
    });
  } finally {
    await clearAuthTokens();
  }
}

export async function verifyEmailToken(token: string): Promise<void> {
  await apiRequest('/v1/auth/verify-email', {
    method: 'POST',
    auth: false,
    body: { token },
  });
}

