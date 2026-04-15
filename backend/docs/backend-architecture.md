# Planora Backend Architecture

## Scope

This backend supports:

- User auth and profile state
- Goals/planner and recurrence exceptions
- Activity check-ins
- App and notification preferences
- Subscription-ready schema and event pipeline

## Data domains

- `profiles`
- `goals`
- `check_ins`
- `notification_preferences`
- `app_preferences`
- `plans` (catalog)
- `subscriptions` (user billing state)
- `subscription_events` (webhook inbox/audit)

## Security

- Row Level Security enabled on all user-owned tables
- Policies enforce `user_id = auth.uid()`
- `plans` is read-only public for active rows
- service role key only for server-side jobs/webhooks

## Migration strategy

1. Apply `001_planora_core.sql`
2. Verify RLS policies
3. Backfill/migrate local app data
4. Enable app remote-first store writes

