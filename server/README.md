# Server Structure

Minimal backend layout for this project:

```text
server/
  src/
    config/
      env.ts
    db/
      prisma.ts
    middleware/
      auth.ts
    routes/
      auth.routes.ts
      food.routes.ts
      water.routes.ts
    types/
      express.d.ts
    index.ts
```

## First Run

1. Add env variables to `.env`:
   - `DATABASE_URL`
   - `PORT` (optional, default `4000`)
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
2. Install prisma runtime client:
   - `npm i @prisma/client firebase-admin`
3. Run migrations:
   - `npx prisma migrate dev --name init`
4. Start API:
   - `npm run server:dev`

If `prisma migrate` has local connectivity issues with `prisma dev`, use SQL fallback:

- `server/sql/init.sql`

## Auth Flow

- Frontend logs in with Firebase SDK.
- Frontend sends Firebase ID token in `Authorization: Bearer <token>`.
- Backend verifies token with `firebase-admin` in middleware.
- Data is scoped by `firebase_uid`.
