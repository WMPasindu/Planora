# Planora Monorepo

## Folders

- `mobile/` - Expo React Native app
- `backend/` - Node/Express microservices backend (gateway + domain services)
- `frontend/` - Web app (placeholder)

## Run mobile app from repo root

```bash
npm run start
```

Other useful commands:

```bash
npm run android
npm run ios
npm run typecheck
npm run start:backend:core
```

These commands are proxied to `mobile/` so running from root is safe.

## Run backend with Yarn

```bash
cd backend
yarn install
yarn db:migrate
yarn db:seed
yarn dev
```

