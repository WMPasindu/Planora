import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiBaseUrl } from '@/config/api';

const ACCESS_TOKEN_KEY = 'planora-access-token';
const REFRESH_TOKEN_KEY = 'planora-refresh-token';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
};

async function readTokens() {
  const [accessToken, refreshToken] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  ]);
  return { accessToken, refreshToken };
}

export async function setAuthTokens(tokens: {
  accessToken: string;
  refreshToken: string;
}): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken),
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

export async function clearAuthTokens(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
  ]);
}

async function refreshAccessTokenOrThrow(): Promise<void> {
  const { refreshToken } = await readTokens();
  if (!refreshToken) throw new Error('No refresh token');
  const res = await fetch(`${apiBaseUrl}/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    await clearAuthTokens();
    throw new Error('Session expired');
  }
  const payload = (await res.json()) as { accessToken: string; refreshToken: string };
  await setAuthTokens(payload);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const auth = options.auth ?? true;

  const makeHeaders = async () => {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (auth) {
      const { accessToken } = await readTokens();
      if (accessToken) headers.authorization = `Bearer ${accessToken}`;
    }
    return headers;
  };

  const send = async () =>
    fetch(`${apiBaseUrl}${path}`, {
      method,
      headers: await makeHeaders(),
      body: method === 'GET' ? undefined : JSON.stringify(options.body ?? {}),
    });

  let response = await send();
  if (response.status === 401 && auth) {
    await refreshAccessTokenOrThrow();
    response = await send();
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  if (response.status === 204) return null as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export async function hasStoredSession(): Promise<boolean> {
  const { accessToken, refreshToken } = await readTokens();
  return Boolean(accessToken && refreshToken);
}

