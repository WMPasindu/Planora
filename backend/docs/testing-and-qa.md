# Backend QA and Test Plan

## Service-level tests

- Auth:
  - register/login/refresh/logout
  - verify email token
  - request/reset password
- Goals:
  - create/list/update/delete
  - schedule fields preserved (`schedule_start_minutes`, `excluded_dates`)
- Check-ins:
  - create/list
- Preferences:
  - upsert and fetch app + notification preferences
- Subscriptions:
  - current snapshot endpoint
  - webhook event ingestion and subscription projection

## Integration tests

- Gateway auth middleware:
  - valid JWT -> upstream route success
  - invalid/expired JWT -> 401
- Gateway route mapping:
  - `/v1/*` routes proxy to correct service path and method

## Event bus tests

- Publish `goal.created`, `checkin.created`, `subscription.updated`.
- Verify `notification_events` and `analytics_snapshots` receive projections.

## End-to-end smoke

1. Register user via gateway.
2. Verify email.
3. Login and obtain tokens.
4. Create goal and check-in.
5. Fetch profile/preferences/subscription/analytics summary.
6. Refresh token and retry protected request.

## Release gates

- All service health checks pass.
- Migration verification script passes.
- Mobile auth + planner smoke tests pass against gateway.
- Rollback procedure validated in staging.

