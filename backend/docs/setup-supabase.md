# Supabase Connection Setup

## 1. Create project

- Create a Supabase project in your preferred region.
- Enable Email + Password auth in Authentication settings.

## 2. Run migration

Execute:

- `supabase/migrations/001_planora_core.sql`

This creates all required tables, triggers, and RLS policies.

## 3. Configure Expo env

Set app env variables:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 4. Verify backend modules

Backend integration modules live under:

- `backend/api/src-lib/supabase/client.ts`
- `backend/api/src-lib/api/*`

## 5. Optional: subscription webhook

Deploy edge function:

- `supabase/functions/subscription-webhook/index.ts`

Then configure billing provider webhook endpoint to this function URL.

