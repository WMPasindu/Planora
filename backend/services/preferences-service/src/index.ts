import { getPool } from '@planora/shared-db';
import { createServiceApp, servicePort } from '@planora/shared-utils';

const app = createServiceApp('preferences-service');

function requireUserId(req: { headers: Record<string, unknown> }): string {
  const userId = req.headers['x-user-id'];
  if (typeof userId !== 'string' || userId.length === 0) {
    throw new Error('Unauthorized');
  }
  return userId;
}

app.get('/preferences', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const [appPrefs, notifPrefs] = await Promise.all([
      getPool().query(`select * from app_preferences where user_id = $1`, [userId]),
      getPool().query(`select * from notification_preferences where user_id = $1`, [userId]),
    ]);
    return res.json({
      app: appPrefs.rows[0] ?? null,
      notifications: notifPrefs.rows[0] ?? null,
    });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

app.put('/preferences', async (req, res) => {
  try {
    const userId = requireUserId(req);
    const payload = req.body as {
      app?: Record<string, unknown>;
      notifications?: Record<string, unknown>;
    };
    const app = payload.app ?? {};
    const notif = payload.notifications ?? {};
    await getPool().query(
      `insert into app_preferences (user_id, achievement_alerts, missed_gap_alerts, theme_preference, last_sync_at)
       values ($1, $2, $3, $4, $5)
       on conflict (user_id)
       do update set
         achievement_alerts = excluded.achievement_alerts,
         missed_gap_alerts = excluded.missed_gap_alerts,
         theme_preference = excluded.theme_preference,
         last_sync_at = excluded.last_sync_at,
         updated_at = now()`,
      [
        userId,
        app.achievementAlerts ?? true,
        app.missedGapAlerts ?? false,
        app.themePreference ?? 'light',
        app.lastSyncAt ?? null,
      ]
    );
    await getPool().query(
      `insert into notification_preferences (
         user_id, daily_accountability, weekly_summary, custom_goal_reminders, deep_focus_mode, reflection_hour, reflection_minute, check_in_frequency
       ) values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (user_id)
       do update set
         daily_accountability = excluded.daily_accountability,
         weekly_summary = excluded.weekly_summary,
         custom_goal_reminders = excluded.custom_goal_reminders,
         deep_focus_mode = excluded.deep_focus_mode,
         reflection_hour = excluded.reflection_hour,
         reflection_minute = excluded.reflection_minute,
         check_in_frequency = excluded.check_in_frequency,
         updated_at = now()`,
      [
        userId,
        notif.dailyAccountability ?? true,
        notif.weeklySummary ?? true,
        notif.customGoalReminders ?? false,
        notif.deepFocusMode ?? true,
        notif.reflectionHour ?? 20,
        notif.reflectionMinute ?? 0,
        notif.checkInFrequency ?? 'daily',
      ]
    );
    return res.json({ ok: true });
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});

const port = servicePort('PREFERENCES_SERVICE_PORT', 4105);
app.listen(port, () => {
  console.log(`preferences-service listening on ${port}`);
});

