import argon2 from 'argon2';
import { randomUUID } from 'node:crypto';

import { getPool } from '@planora/shared-db';
import { publishEvent } from '@planora/shared-events';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type AuthTokenPayload,
} from '@planora/shared-auth';
import { createServiceApp, servicePort } from '@planora/shared-utils';

const app = createServiceApp('auth-service');

function hashToken(token: string): Promise<string> {
  return argon2.hash(token);
}

app.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body as {
    email?: string;
    password?: string;
    displayName?: string;
  };
  if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
  const normalizedEmail = email.trim().toLowerCase();
  const userId = randomUUID();
  const verificationToken = randomUUID();
  const passwordHash = await argon2.hash(password);
  try {
    await getPool().query(
      `insert into users (id, email, password_hash, display_name, email_verified, verification_token)
       values ($1, $2, $3, $4, false, $5)`,
      [userId, normalizedEmail, passwordHash, displayName ?? null, verificationToken]
    );
    await getPool().query(
      `insert into profiles (id, email, display_name)
       values ($1, $2, $3)`,
      [userId, normalizedEmail, displayName ?? null]
    );
    await getPool().query(`insert into notification_preferences (user_id) values ($1)`, [userId]);
    await getPool().query(`insert into app_preferences (user_id) values ($1)`, [userId]);
    await publishEvent({
      type: 'user.registered',
      payload: { userId, email: normalizedEmail },
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json({ userId, email: normalizedEmail, verificationToken });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to register', error: `${error}` });
  }
});

app.post('/verify-email', async (req, res) => {
  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ message: 'token is required' });
  const result = await getPool().query(
    `update users set email_verified = true, verification_token = null, updated_at = now()
     where verification_token = $1
     returning id, email`,
    [token]
  );
  if (!result.rowCount) return res.status(404).json({ message: 'invalid token' });
  return res.json({ ok: true, user: result.rows[0] });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ message: 'email and password are required' });
  const result = await getPool().query(
    `select id, email, password_hash, email_verified from users where email = $1`,
    [email.trim().toLowerCase()]
  );
  if (!result.rowCount) return res.status(401).json({ message: 'Invalid credentials' });
  const user = result.rows[0] as {
    id: string;
    email: string;
    password_hash: string;
    email_verified: boolean;
  };
  const valid = await argon2.verify(user.password_hash, password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const payload: AuthTokenPayload = { sub: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  await getPool().query(
    `insert into refresh_tokens (user_id, token_hash, expires_at)
     values ($1, $2, now() + interval '30 days')`,
    [user.id, await hashToken(refreshToken)]
  );
  return res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, emailVerified: user.email_verified },
  });
});

app.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return res.status(400).json({ message: 'refreshToken is required' });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const rows = await getPool().query(
      `select id, token_hash, revoked_at, expires_at
       from refresh_tokens
       where user_id = $1
       order by created_at desc
       limit 20`,
      [payload.sub]
    );
    const matched = await Promise.all(
      rows.rows.map(async (row) => ({ row, valid: await argon2.verify(row.token_hash, refreshToken).catch(() => false) }))
    );
    const active = matched.find(
      (m) =>
        m.valid &&
        !m.row.revoked_at &&
        new Date(m.row.expires_at).getTime() > Date.now()
    );
    if (!active) return res.status(401).json({ message: 'Invalid refresh token' });
    const nextPayload: AuthTokenPayload = { sub: payload.sub, email: payload.email };
    const nextAccessToken = signAccessToken(nextPayload);
    const nextRefreshToken = signRefreshToken(nextPayload);
    await getPool().query(`update refresh_tokens set revoked_at = now() where id = $1`, [active.row.id]);
    await getPool().query(
      `insert into refresh_tokens (user_id, token_hash, expires_at)
       values ($1, $2, now() + interval '30 days')`,
      [payload.sub, await hashToken(nextRefreshToken)]
    );
    return res.json({ accessToken: nextAccessToken, refreshToken: nextRefreshToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

app.post('/logout', async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) return res.json({ ok: true });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const rows = await getPool().query(
      `select id, token_hash
       from refresh_tokens
       where user_id = $1 and revoked_at is null
       order by created_at desc
       limit 20`,
      [payload.sub]
    );
    for (const row of rows.rows) {
      const valid = await argon2.verify(row.token_hash, refreshToken).catch(() => false);
      if (valid) {
        await getPool().query(`update refresh_tokens set revoked_at = now() where id = $1`, [row.id]);
        break;
      }
    }
  } catch {
    // no-op
  }
  return res.json({ ok: true });
});

app.post('/request-password-reset', async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ message: 'email is required' });
  const token = randomUUID();
  await getPool().query(
    `update users
      set password_reset_token = $2, password_reset_expires_at = now() + interval '30 minutes'
      where email = $1`,
    [email.trim().toLowerCase(), token]
  );
  return res.json({ ok: true, resetToken: token });
});

app.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };
  if (!token || !newPassword) return res.status(400).json({ message: 'token and newPassword are required' });
  const passwordHash = await argon2.hash(newPassword);
  const result = await getPool().query(
    `update users
      set password_hash = $2, password_reset_token = null, password_reset_expires_at = null, updated_at = now()
      where password_reset_token = $1 and password_reset_expires_at > now()
      returning id`,
    [token, passwordHash]
  );
  if (!result.rowCount) return res.status(400).json({ message: 'invalid or expired token' });
  return res.json({ ok: true });
});

const port = servicePort('AUTH_SERVICE_PORT', 4101);
app.listen(port, () => {
  console.log(`auth-service listening on ${port}`);
});

