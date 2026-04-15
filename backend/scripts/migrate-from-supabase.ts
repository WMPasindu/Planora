import fs from 'node:fs/promises';

import { getPool } from '../packages/shared-db/src/index.js';

type ExportBundle = {
  users?: Array<Record<string, unknown>>;
  profiles?: Array<Record<string, unknown>>;
  goals?: Array<Record<string, unknown>>;
  check_ins?: Array<Record<string, unknown>>;
  app_preferences?: Array<Record<string, unknown>>;
  notification_preferences?: Array<Record<string, unknown>>;
  subscriptions?: Array<Record<string, unknown>>;
  plans?: Array<Record<string, unknown>>;
};

async function run() {
  const file = process.argv[2];
  if (!file) {
    throw new Error('Usage: tsx scripts/migrate-from-supabase.ts <export.json>');
  }
  const content = await fs.readFile(file, 'utf8');
  const data = JSON.parse(content) as ExportBundle;

  await getPool().query('begin');
  try {
    for (const plan of data.plans ?? []) {
      await getPool().query(
        `insert into plans (id, code, name, interval, price_cents, currency, feature_flags, is_active, created_at)
         values ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, coalesce($9::timestamptz, now()))
         on conflict (code) do nothing`,
        [
          plan.id,
          plan.code,
          plan.name,
          plan.interval,
          plan.price_cents ?? 0,
          plan.currency ?? 'usd',
          JSON.stringify(plan.feature_flags ?? {}),
          plan.is_active ?? true,
          plan.created_at ?? null,
        ]
      );
    }

    for (const user of data.users ?? []) {
      await getPool().query(
        `insert into users (id, email, password_hash, display_name, email_verified, created_at)
         values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
         on conflict (id) do nothing`,
        [
          user.id,
          user.email,
          user.password_hash ?? '$argon2id$v=19$m=65536,t=3,p=4$placeholder$placeholder',
          user.display_name ?? null,
          user.email_verified ?? true,
          user.created_at ?? null,
        ]
      );
    }

    for (const profile of data.profiles ?? []) {
      await getPool().query(
        `insert into profiles (id, email, display_name, avatar_url, timezone, created_at)
         values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
         on conflict (id) do update set
           email = excluded.email,
           display_name = excluded.display_name,
           avatar_url = excluded.avatar_url,
           timezone = excluded.timezone`,
        [
          profile.id,
          profile.email,
          profile.display_name ?? null,
          profile.avatar_url ?? null,
          profile.timezone ?? 'UTC',
          profile.created_at ?? null,
        ]
      );
    }

    for (const goal of data.goals ?? []) {
      await getPool().query(
        `insert into goals (
          id, user_id, title, logged, target, progress, timer_active, cadence,
          start_date, end_date, ongoing, completed_at, schedule_start_minutes,
          schedule_duration_minutes, schedule_end_minutes, excluded_dates, created_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9::date, $10::date, $11, $12::timestamptz, $13,
          $14, $15, $16, coalesce($17::timestamptz, now())
        )
        on conflict (id) do nothing`,
        [
          goal.id,
          goal.user_id,
          goal.title,
          goal.logged ?? '0h 0m',
          goal.target ?? '0h',
          goal.progress ?? 0,
          goal.timer_active ?? false,
          goal.cadence ?? 'weekly',
          goal.start_date,
          goal.end_date ?? null,
          goal.ongoing ?? false,
          goal.completed_at ?? null,
          goal.schedule_start_minutes ?? null,
          goal.schedule_duration_minutes ?? null,
          goal.schedule_end_minutes ?? null,
          goal.excluded_dates ?? [],
          goal.created_at ?? null,
        ]
      );
    }

    for (const item of data.check_ins ?? []) {
      await getPool().query(
        `insert into check_ins (id, user_id, note, created_at)
         values ($1, $2, $3, coalesce($4::timestamptz, now()))
         on conflict (id) do nothing`,
        [item.id, item.user_id, item.note ?? '', item.created_at ?? null]
      );
    }

    for (const pref of data.app_preferences ?? []) {
      await getPool().query(
        `insert into app_preferences (user_id, achievement_alerts, missed_gap_alerts, theme_preference, last_sync_at, updated_at)
         values ($1, $2, $3, $4, $5, coalesce($6::timestamptz, now()))
         on conflict (user_id) do update set
           achievement_alerts = excluded.achievement_alerts,
           missed_gap_alerts = excluded.missed_gap_alerts,
           theme_preference = excluded.theme_preference,
           last_sync_at = excluded.last_sync_at`,
        [
          pref.user_id,
          pref.achievement_alerts ?? true,
          pref.missed_gap_alerts ?? false,
          pref.theme_preference ?? 'light',
          pref.last_sync_at ?? null,
          pref.updated_at ?? null,
        ]
      );
    }

    for (const pref of data.notification_preferences ?? []) {
      await getPool().query(
        `insert into notification_preferences (
          user_id, daily_accountability, weekly_summary, custom_goal_reminders, deep_focus_mode, reflection_hour, reflection_minute, check_in_frequency, updated_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, coalesce($9::timestamptz, now())
        )
        on conflict (user_id) do update set
          daily_accountability = excluded.daily_accountability,
          weekly_summary = excluded.weekly_summary,
          custom_goal_reminders = excluded.custom_goal_reminders,
          deep_focus_mode = excluded.deep_focus_mode,
          reflection_hour = excluded.reflection_hour,
          reflection_minute = excluded.reflection_minute,
          check_in_frequency = excluded.check_in_frequency`,
        [
          pref.user_id,
          pref.daily_accountability ?? true,
          pref.weekly_summary ?? true,
          pref.custom_goal_reminders ?? false,
          pref.deep_focus_mode ?? true,
          pref.reflection_hour ?? 20,
          pref.reflection_minute ?? 0,
          pref.check_in_frequency ?? 'daily',
          pref.updated_at ?? null,
        ]
      );
    }

    for (const sub of data.subscriptions ?? []) {
      await getPool().query(
        `insert into subscriptions (
          id, user_id, plan_id, provider, provider_customer_id, provider_subscription_id, status,
          current_period_start, current_period_end, cancel_at_period_end, metadata, created_at, updated_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7,
          $8::timestamptz, $9::timestamptz, $10, $11::jsonb, coalesce($12::timestamptz, now()), coalesce($13::timestamptz, now())
        )
        on conflict (id) do nothing`,
        [
          sub.id,
          sub.user_id,
          sub.plan_id ?? null,
          sub.provider ?? 'stripe',
          sub.provider_customer_id ?? null,
          sub.provider_subscription_id ?? null,
          sub.status ?? 'inactive',
          sub.current_period_start ?? null,
          sub.current_period_end ?? null,
          sub.cancel_at_period_end ?? false,
          JSON.stringify(sub.metadata ?? {}),
          sub.created_at ?? null,
          sub.updated_at ?? null,
        ]
      );
    }

    await getPool().query('commit');
    console.log('Supabase export migration completed.');
  } catch (error) {
    await getPool().query('rollback');
    throw error;
  } finally {
    await getPool().end();
  }
}

void run();

