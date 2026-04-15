create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  display_name text,
  email_verified boolean not null default false,
  verification_token text,
  password_reset_token text,
  password_reset_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  logged text not null default '0h 0m',
  target text not null default '0h',
  progress integer not null default 0,
  timer_active boolean not null default false,
  cadence text not null check (cadence in ('daily', 'weekly', 'monthly')),
  start_date date not null,
  end_date date,
  ongoing boolean not null default false,
  completed_at timestamptz,
  schedule_start_minutes integer,
  schedule_duration_minutes integer,
  schedule_end_minutes integer,
  excluded_dates date[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_id_created_at_idx on goals(user_id, created_at desc);

create table if not exists check_ins (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists check_ins_user_id_created_at_idx on check_ins(user_id, created_at desc);

create table if not exists notification_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  daily_accountability boolean not null default true,
  weekly_summary boolean not null default true,
  custom_goal_reminders boolean not null default false,
  deep_focus_mode boolean not null default true,
  reflection_hour integer not null default 20,
  reflection_minute integer not null default 0,
  check_in_frequency text not null default 'daily' check (check_in_frequency in ('daily', 'weekly', 'weekdays')),
  updated_at timestamptz not null default now()
);

create table if not exists app_preferences (
  user_id uuid primary key references users(id) on delete cascade,
  achievement_alerts boolean not null default true,
  missed_gap_alerts boolean not null default false,
  theme_preference text not null default 'light' check (theme_preference in ('light', 'dark', 'system')),
  last_sync_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  interval text not null check (interval in ('month', 'year')),
  price_cents integer not null default 0,
  currency text not null default 'usd',
  feature_flags jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  plan_id uuid references plans(id),
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text unique,
  status text not null default 'inactive',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_created_at_idx on subscriptions(user_id, created_at desc);

create table if not exists subscription_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);

create table if not exists notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

