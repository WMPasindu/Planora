-- Planora core schema
-- Includes profile/auth-adjacent data, planner goals, activity, preferences,
-- and subscription-ready tables for post-MVP billing enablement.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  logged text not null default '0h 0m',
  target text not null default '0h',
  progress numeric(5,4) not null default 0 check (progress >= 0 and progress <= 1),
  timer_active boolean not null default false,
  cadence text not null check (cadence in ('daily', 'weekly', 'monthly')),
  start_date date not null,
  end_date date,
  ongoing boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  schedule_start_minutes integer,
  schedule_duration_minutes integer,
  schedule_end_minutes integer,
  excluded_dates date[] not null default '{}',
  constraint goals_schedule_minutes_valid check (
    schedule_start_minutes is null
    or (schedule_start_minutes >= 0 and schedule_start_minutes <= 1439)
  ),
  constraint goals_schedule_duration_valid check (
    schedule_duration_minutes is null
    or (schedule_duration_minutes > 0 and schedule_duration_minutes <= 720)
  )
);

drop trigger if exists trg_goals_updated_at on public.goals;
create trigger trg_goals_updated_at
before update on public.goals
for each row execute procedure public.set_updated_at();

create index if not exists idx_goals_user_id on public.goals(user_id);
create index if not exists idx_goals_user_start_date on public.goals(user_id, start_date);
create index if not exists idx_goals_user_end_date on public.goals(user_id, end_date);
create index if not exists idx_goals_user_cadence on public.goals(user_id, cadence);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_check_ins_user_created_at on public.check_ins(user_id, created_at desc);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_accountability boolean not null default true,
  weekly_summary boolean not null default true,
  custom_goal_reminders boolean not null default false,
  deep_focus_mode boolean not null default true,
  reflection_hour smallint not null default 20,
  reflection_minute smallint not null default 0,
  check_in_frequency text not null default 'daily' check (check_in_frequency in ('daily', 'weekly', 'weekdays')),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_notification_preferences_updated_at on public.notification_preferences;
create trigger trg_notification_preferences_updated_at
before update on public.notification_preferences
for each row execute procedure public.set_updated_at();

create table if not exists public.app_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  achievement_alerts boolean not null default true,
  missed_gap_alerts boolean not null default false,
  theme_preference text not null default 'light' check (theme_preference in ('light', 'dark', 'system')),
  last_sync_at timestamptz,
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_app_preferences_updated_at on public.app_preferences;
create trigger trg_app_preferences_updated_at
before update on public.app_preferences
for each row execute procedure public.set_updated_at();

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  interval text not null check (interval in ('month', 'year', 'lifetime')),
  price_cents integer not null default 0,
  currency text not null default 'usd',
  feature_flags jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.plans(id),
  provider text not null default 'stripe',
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'inactive' check (status in ('trialing', 'active', 'past_due', 'canceled', 'inactive')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute procedure public.set_updated_at();

create index if not exists idx_subscriptions_user_status on public.subscriptions(user_id, status);
create unique index if not exists idx_subscriptions_provider_sub_id on public.subscriptions(provider_subscription_id)
where provider_subscription_id is not null;

create table if not exists public.subscription_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'stripe',
  provider_event_id text not null,
  event_type text not null,
  payload jsonb not null,
  processed boolean not null default false,
  processed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_subscription_events_provider_event on public.subscription_events(provider, provider_event_id);

-- Create profile row automatically for new auth users.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', null))
  on conflict (id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.app_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.goals enable row level security;
alter table public.check_ins enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.app_preferences enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_events enable row level security;

-- plans can be read globally in app (active catalog), writes remain admin-only.
alter table public.plans enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own'
  ) then
    create policy profiles_select_own on public.profiles for select using (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy profiles_update_own on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

do $$
declare
  t text;
begin
  foreach t in array array['goals', 'check_ins', 'notification_preferences', 'app_preferences', 'subscriptions']
  loop
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = t || '_select_own'
    ) then
      execute format('create policy %I_select_own on public.%I for select using (auth.uid() = user_id);', t, t);
    end if;
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = t || '_insert_own'
    ) then
      execute format('create policy %I_insert_own on public.%I for insert with check (auth.uid() = user_id);', t, t);
    end if;
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = t || '_update_own'
    ) then
      execute format('create policy %I_update_own on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t, t);
    end if;
    if not exists (
      select 1 from pg_policies where schemaname = 'public' and tablename = t and policyname = t || '_delete_own'
    ) then
      execute format('create policy %I_delete_own on public.%I for delete using (auth.uid() = user_id);', t, t);
    end if;
  end loop;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'plans' and policyname = 'plans_read_active'
  ) then
    create policy plans_read_active on public.plans
    for select using (is_active = true);
  end if;
end $$;

