import { getPool } from '@planora/shared-db';
import { createServiceApp, servicePort } from '@planora/shared-utils';

const app = createServiceApp('profile-service');

function requireUserId(req: { headers: Record<string, unknown> }): string {
  const userId = req.headers['x-user-id'];
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Unauthorized');
  }
  return userId;
}

app.get('/profile', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const result = await getPool().query(
      `select p.id, p.email, p.display_name, u.email_verified
       from profiles p
       join users u on u.id = p.id
       where p.id = $1`,
      [userId]
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Profile not found' });
    const row = result.rows[0];
    return res.json({
      id: row.id,
      email: row.email,
      displayName: row.display_name ?? undefined,
      emailVerified: Boolean(row.email_verified),
    });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

app.patch('/profile', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const { displayName, email } = req.body as { displayName?: string; email?: string };
    if (email) {
      await getPool().query(`update users set email = $2, updated_at = now() where id = $1`, [userId, email]);
      await getPool().query(`update profiles set email = $2, updated_at = now() where id = $1`, [userId, email]);
    }
    if (displayName !== undefined) {
      await getPool().query(
        `update users set display_name = $2, updated_at = now() where id = $1`,
        [userId, displayName]
      );
      await getPool().query(
        `update profiles set display_name = $2, updated_at = now() where id = $1`,
        [userId, displayName]
      );
    }
    return res.json({ ok: true });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

const port = servicePort('PROFILE_SERVICE_PORT', 4102);
app.listen(port, () => {
  console.log(`profile-service listening on ${port}`);
});

