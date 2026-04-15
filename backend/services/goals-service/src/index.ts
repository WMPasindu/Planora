import { randomUUID } from 'node:crypto';

import { getPool } from '@planora/shared-db';
import { publishEvent } from '@planora/shared-events';
import { createServiceApp, servicePort } from '@planora/shared-utils';

const app = createServiceApp('goals-service');

function requireUserId(req: { headers: Record<string, unknown> }): string {
  const userId = req.headers['x-user-id'];
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Unauthorized');
  }
  return userId;
}

app.get('/goals', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const result = await getPool().query(
      `select * from goals where user_id = $1 order by created_at desc`,
      [userId]
    );
    return res.json(result.rows);
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

app.post('/goals', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const goal = req.body as Record<string, unknown>;
    const id = (goal.id as string | undefined) ?? randomUUID();
    const result = await getPool().query(
      `insert into goals (
        id, user_id, title, logged, target, progress, timer_active, cadence,
        start_date, end_date, ongoing, completed_at, schedule_start_minutes,
        schedule_duration_minutes, schedule_end_minutes, excluded_dates, created_at
      ) values (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16, coalesce($17::timestamptz, now())
      )
      returning *`,
      [
        id,
        userId,
        goal.title,
        goal.logged ?? '0h 0m',
        goal.target ?? '0h',
        goal.progress ?? 0,
        goal.timerActive ?? goal.timer_active ?? false,
        goal.cadence ?? 'weekly',
        goal.startDate ?? goal.start_date,
        goal.endDate ?? goal.end_date ?? null,
        goal.ongoing ?? false,
        goal.completedAt ?? goal.completed_at ?? null,
        goal.scheduleStartMinutes ?? goal.schedule_start_minutes ?? null,
        goal.scheduleDurationMinutes ?? goal.schedule_duration_minutes ?? null,
        goal.scheduleEndMinutes ?? goal.schedule_end_minutes ?? null,
        goal.excludedDates ?? goal.excluded_dates ?? [],
        goal.createdAt ?? goal.created_at ?? null,
      ]
    );
    await publishEvent({
      type: 'goal.created',
      payload: { userId, goalId: id },
      createdAt: new Date().toISOString(),
    });
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create goal', error: `${error}` });
  }
});

app.patch('/goals/:id', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const patch = req.body as Record<string, unknown>;
    const assignments: string[] = [];
    const values: unknown[] = [];
    const map: Array<[keyof typeof patch, string]> = [
      ['title', 'title'],
      ['logged', 'logged'],
      ['target', 'target'],
      ['progress', 'progress'],
      ['timerActive', 'timer_active'],
      ['timer_active', 'timer_active'],
      ['cadence', 'cadence'],
      ['startDate', 'start_date'],
      ['start_date', 'start_date'],
      ['endDate', 'end_date'],
      ['end_date', 'end_date'],
      ['ongoing', 'ongoing'],
      ['completedAt', 'completed_at'],
      ['completed_at', 'completed_at'],
      ['scheduleStartMinutes', 'schedule_start_minutes'],
      ['schedule_start_minutes', 'schedule_start_minutes'],
      ['scheduleDurationMinutes', 'schedule_duration_minutes'],
      ['schedule_duration_minutes', 'schedule_duration_minutes'],
      ['scheduleEndMinutes', 'schedule_end_minutes'],
      ['schedule_end_minutes', 'schedule_end_minutes'],
      ['excludedDates', 'excluded_dates'],
      ['excluded_dates', 'excluded_dates'],
    ];
    for (const [src, col] of map) {
      if (patch[src] !== undefined) {
        values.push(patch[src]);
        assignments.push(`${col} = $${values.length}`);
      }
    }
    values.push(userId);
    values.push(req.params.id);
    const result = await getPool().query(
      `update goals
       set ${assignments.join(', ')}, updated_at = now()
       where user_id = $${values.length - 1} and id = $${values.length}
       returning *`,
      values
    );
    if (!result.rowCount) return res.status(404).json({ message: 'Goal not found' });
    await publishEvent({
      type: 'goal.updated',
      payload: { userId, goalId: req.params.id },
      createdAt: new Date().toISOString(),
    });
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(400).json({ message: 'Unable to update goal', error: `${error}` });
  }
});

app.delete('/goals/:id', async (req, res) => {
  try {
    const userId = requireUserId(req);
    await getPool().query(`delete from goals where id = $1 and user_id = $2`, [req.params.id, userId]);
    await publishEvent({
      type: 'goal.deleted',
      payload: { userId, goalId: req.params.id },
      createdAt: new Date().toISOString(),
    });
    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ message: 'Unable to delete goal' });
  }
});

const port = servicePort('GOALS_SERVICE_PORT', 4103);
app.listen(port, () => {
  console.log(`goals-service listening on ${port}`);
});

