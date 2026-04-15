import { getPool } from '@planora/shared-db';
import { subscribeEvents } from '@planora/shared-events';
import { createServiceApp, servicePort } from '@planora/shared-utils';

const app = createServiceApp('analytics-service');

function requireUserId(req: { headers: Record<string, unknown> }): string {
  const userId = req.headers['x-user-id'];
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Unauthorized');
  }
  return userId;
}

app.get('/analytics/summary', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const [goals, checkIns] = await Promise.all([
      getPool().query(`select count(*)::int as count from goals where user_id = $1`, [userId]),
      getPool().query(`select count(*)::int as count from check_ins where user_id = $1`, [userId]),
    ]);
    return res.json({
      goals: goals.rows[0]?.count ?? 0,
      checkIns: checkIns.rows[0]?.count ?? 0,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

void subscribeEvents(async (event) => {
  const payload = event.payload as { userId?: string };
  if (!payload.userId) return;
  await getPool().query(
    `insert into analytics_snapshots (user_id, payload) values ($1, $2::jsonb)`,
    [payload.userId, JSON.stringify({ eventType: event.type, payload: event.payload })]
  );
});

const port = servicePort('ANALYTICS_SERVICE_PORT', 4108);
app.listen(port, () => {
  console.log(`analytics-service listening on ${port}`);
});

