# Planora Cutover Runbook

## Goal

Migrate from Supabase-backed runtime to Node/Express microservices with minimal user disruption.

## Prerequisites

- New backend stack deployed and healthy (`/health` on all services).
- PostgreSQL schema migrated with `packages/shared-db/migrations/001_init.sql`.
- Redis available for event processing.
- Mobile build with `EXPO_PUBLIC_API_BASE_URL` support ready.

## Steps

1. **Freeze writes on old stack**
   - Temporarily disable app write operations (maintenance window).
2. **Export old data**
   - Export users/profiles/goals/check_ins/preferences/subscriptions from Supabase.
3. **Run migration script**
   - Execute `backend/scripts/migrate-from-supabase.ts` against export files.
4. **Run verification**
   - Execute `backend/scripts/verify-migration.ts`.
   - Verify per-user row counts and field checksums for goals/check-ins/preferences.
5. **Enable new gateway**
   - Point mobile config to API gateway base URL.
6. **Canary rollout**
   - Roll out to internal/test users first.
7. **Full rollout**
   - Release to all users after canary success criteria are met.

## Rollback

1. Point mobile back to previous backend URL.
2. Disable new backend write traffic.
3. Restore old system write access.
4. Investigate failures and rerun migration on corrected dataset.

