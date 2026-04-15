# Planora Backend (Node + Express Microservices)

This folder now hosts the full Planora backend as Node/Express microservices.

## Services

- `services/api-gateway`: single public API entry for mobile/web clients
- `services/auth-service`: register, login, refresh, logout, reset password, email verify
- `services/profile-service`: profile read/update
- `services/goals-service`: planner goals CRUD
- `services/checkins-service`: activity check-ins CRUD
- `services/preferences-service`: app + notification preferences
- `services/subscriptions-service`: subscription read + webhook ingestion
- `services/notifications-service`: notification event projection
- `services/analytics-service`: summary + analytics projections

## Shared packages

- `packages/shared-db`: PostgreSQL pool + migration + seed scripts
- `packages/shared-auth`: JWT signing/verification
- `packages/shared-events`: Redis event bus publish/subscribe
- `packages/shared-types`: shared domain interfaces
- `packages/shared-utils`: env and app bootstrap helpers
- `packages/shared-logger`: structured logging helper

## Quick start (local)

1. Copy env:
   - `cp .env.example .env`
2. Start infra:
   - `docker compose up -d`
3. Install dependencies:
   - `npm install`
4. Run DB setup:
   - `npm run db:migrate`
   - `npm run db:seed`
5. Start services:
   - `npm run dev`

Gateway runs on `http://localhost:4000`.

## Database migration ownership

- Active migration source is now:
  - `packages/shared-db/migrations/001_init.sql`
- Old Supabase SQL files are retained as historical reference only.

## Mobile env

Mobile app should point to:

- `EXPO_PUBLIC_API_BASE_URL=http://localhost:4000`

in Expo config/env.

