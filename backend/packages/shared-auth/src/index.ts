import jwt from 'jsonwebtoken';

import { requireEnv } from '@planora/shared-utils';

export type AuthTokenPayload = {
  sub: string;
  email: string;
};

const accessSecret = () => requireEnv('JWT_ACCESS_SECRET');
const refreshSecret = () => requireEnv('JWT_REFRESH_SECRET');

export function signAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, accessSecret(), { expiresIn: '15m' });
}

export function signRefreshToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, refreshSecret(), { expiresIn: '30d' });
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, accessSecret()) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  return jwt.verify(token, refreshSecret()) as AuthTokenPayload;
}

