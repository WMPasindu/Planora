# Planora Backend Architecture (Node/Express)

## Service topology

- `api-gateway`: entry point for mobile/web clients
- `auth-service`: identity, credentials, sessions
- `profile-service`: account profile
- `goals-service`: planner goals CRUD
- `checkins-service`: check-in activity
- `preferences-service`: app/notification preferences
- `subscriptions-service`: billing state and webhook ingestion
- `notifications-service`: notification projections
- `analytics-service`: analytics projections and summary

## Storage and eventing

- PostgreSQL as system of record (see `packages/shared-db/migrations/001_init.sql`)
- Redis pub/sub event bus for cross-service domain events

## Security model

- JWT access + refresh token rotation
- Gateway validates access token and forwards user context headers:
  - `x-user-id`
  - `x-user-email`
- Services trust only gateway-authenticated context

## Runtime flow

1. Client authenticates via `/v1/auth/*`
2. Gateway validates JWT on protected routes
3. Request proxied to target service
4. Domain services persist state to Postgres
5. Domain events published to Redis and consumed by notifications/analytics

## Migration strategy

1. Initialize DB with Node-owned migrations.
2. Import Supabase export using `scripts/migrate-from-supabase.ts`.
3. Verify migration counts using `scripts/verify-migration.ts`.
4. Switch mobile API base URL to gateway endpoint.

