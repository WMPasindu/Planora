import { getPool } from '@planora/shared-db';
import { subscribeEvents } from '@planora/shared-events';
import { createServiceApp, servicePort } from '@planora/shared-utils';

const app = createServiceApp('notifications-service');

function requireUserId(req: { headers: Record<string, unknown> }): string {
  const userId = req.headers['x-user-id'];
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Unauthorized');
  }
  return userId;
}

app.get('/notifications/events', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const result = await getPool().query(
      `select id, event_type, payload, created_at
       from notification_events
       where user_id = $1
       order by created_at desc
       limit 100`,
      [userId]
    );
    return res.json(result.rows);
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

void subscribeEvents(async (event) => {
  const payload = event.payload as { userId?: string };
  if (!payload.userId) return;
  await getPool().query(
    `insert into notification_events (user_id, event_type, payload)
     values ($1, $2, $3::jsonb)`,
    [payload.userId, event.type, JSON.stringify(event.payload)]
  );
});

const port = servicePort('NOTIFICATIONS_SERVICE_PORT', 4107);
app.listen(port, () => {
  console.log(`notifications-service listening on ${port}`);
});

