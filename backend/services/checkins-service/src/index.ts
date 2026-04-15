import { randomUUID } from 'node:crypto';

import { getPool } from '@planora/shared-db';
import { publishEvent } from '@planora/shared-events';
import { createServiceApp, servicePort } from '@planora/shared-utils';

const app = createServiceApp('checkins-service');

function requireUserId(req: { headers: Record<string, unknown> }): string {
  const userId = req.headers['x-user-id'];
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Unauthorized');
  }
  return userId;
}

app.get('/check-ins', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const result = await getPool().query(
      `select id, user_id, note, created_at from check_ins where user_id = $1 order by created_at desc`,
      [userId]
    );
    return res.json(result.rows);
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

app.post('/check-ins', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const checkIn = req.body as { id?: string; note?: string; createdAt?: string };
    const id = checkIn.id ?? randomUUID();
    const result = await getPool().query(
      `insert into check_ins (id, user_id, note, created_at)
       values ($1, $2, $3, coalesce($4::timestamptz, now()))
       returning id, user_id, note, created_at`,
      [id, userId, checkIn.note ?? '', checkIn.createdAt ?? null]
    );
    await publishEvent({
      type: 'checkin.created',
      payload: { userId, checkInId: id },
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json(result.rows[0]);
  } catch {
    return res.status(400).json({ message: 'Unable to create check-in' });
  }
});

const port = servicePort('CHECKINS_SERVICE_PORT', 4104);
app.listen(port, () => {
  console.log(`checkins-service listening on ${port}`);
});

