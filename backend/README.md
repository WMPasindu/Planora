# Planora Backend (Supabase)

This folder contains the backend assets for Planora:

- SQL migrations for PostgreSQL schema and RLS
- Edge function skeletons
- backend docs and rollout notes

## Structure

- `supabase/migrations` - versioned SQL schema changes
- `supabase/functions` - edge function handlers
- `docs` - architecture and operational notes

## Apply migrations

You can apply SQL in two ways:

1. Supabase Dashboard SQL editor (manual)
2. Supabase MCP `apply_migration` (recommended for tracked runs)

Primary migration file:

- `supabase/migrations/001_planora_core.sql`

## Required env values in app

The mobile app expects:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

For server-side privileged workflows only:

- `SUPABASE_SERVICE_ROLE_KEY`

Never ship service role keys to the client app.

