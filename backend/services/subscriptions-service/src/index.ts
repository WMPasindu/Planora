import { getPool } from '@planora/shared-db';
import { publishEvent } from '@planora/shared-events';
import { createServiceApp, servicePort } from '@planora/shared-utils';

const app = createServiceApp('subscriptions-service');

function requireUserId(req: { headers: Record<string, unknown> }): string {
  const userId = req.headers['x-user-id'];
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Unauthorized');
  }
  return userId;
}

app.get('/subscriptions/current', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const result = await getPool().query(
      `select s.status, s.current_period_end, p.code as plan_code
       from subscriptions s
       left join plans p on p.id = s.plan_id
       where s.user_id = $1
       order by s.created_at desc
       limit 1`,
      [userId]
    );
    if (!result.rowCount) return res.json(null);
    const row = result.rows[0];
    return res.json({
      status: row.status,
      planCode: row.plan_code ?? null,
      currentPeriodEnd: row.current_period_end ?? null,
    });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

app.post('/subscriptions/webhook', async (req, res) => {
  const payload = req.body as {
    id?: string;
    type?: string;
    data?: { object?: Record<string, unknown> };
  };
  if (!payload?.id || !payload?.type) return res.status(400).json({ message: 'Invalid payload' });
  await getPool().query(
    `insert into subscription_events (provider, provider_event_id, event_type, payload, processed)
     values ('stripe', $1, $2, $3::jsonb, false)
     on conflict (provider, provider_event_id) do update set payload = excluded.payload`,
    [payload.id, payload.type, JSON.stringify(payload)]
  );

  const object = payload.data?.object ?? {};
  const userId = typeof object.metadata === 'object' ? (object.metadata as { user_id?: string }).user_id : undefined;
  if (payload.type.startsWith('customer.subscription.') && userId) {
    const providerSubscriptionId = String(object.id ?? '');
    await getPool().query(
      `insert into subscriptions (
         user_id, provider, provider_customer_id, provider_subscription_id, status,
         current_period_start, current_period_end, cancel_at_period_end, metadata
       ) values (
         $1, 'stripe', $2, $3, $4,
         to_timestamp($5), to_timestamp($6), $7, $8::jsonb
       )
       on conflict (provider_subscription_id) do update set
         status = excluded.status,
         current_period_start = excluded.current_period_start,
         current_period_end = excluded.current_period_end,
         cancel_at_period_end = excluded.cancel_at_period_end,
         metadata = excluded.metadata,
         updated_at = now()`,
      [
        userId,
        object.customer ?? null,
        providerSubscriptionId || null,
        object.status ?? 'inactive',
        Number(object.current_period_start ?? 0),
        Number(object.current_period_end ?? 0),
        Boolean(object.cancel_at_period_end ?? false),
        JSON.stringify(object),
      ]
    );
    await publishEvent({
      type: 'subscription.updated',
      payload: { userId, providerSubscriptionId, status: object.status ?? 'inactive' },
      createdAt: new Date().toISOString(),
    });
  }

  await getPool().query(
    `update subscription_events
     set processed = true, processed_at = now()
     where provider = 'stripe' and provider_event_id = $1`,
    [payload.id]
  );
  return res.json({ ok: true });
});

const port = servicePort('SUBSCRIPTIONS_SERVICE_PORT', 4106);
app.listen(port, () => {
  console.log(`subscriptions-service listening on ${port}`);
});

