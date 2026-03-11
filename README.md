# Well Body

Live demo: `https://well-body-app.onrender.com`

Well Body is a full-stack calorie and hydration tracking app built as a portfolio project. It includes user authentication, a production API, PostgreSQL persistence, weekly summaries, and mobile-oriented UI.

## Stack

- React 19 + Vite
- Express 5
- Prisma + PostgreSQL
- Firebase Authentication
- Firebase Admin
- Render

## Features

- User registration and login
- Protected API routes with Firebase token verification
- Daily water and calorie tracking
- Edit and delete entries
- Daily goals for calories and water
- Weekly overview for recent activity
- Barcode scanner for product lookup
- Responsive mobile-first layout

## Architecture

- `src/` contains the React frontend
- `server/src/` contains the Express API
- `prisma/schema.prisma` defines the PostgreSQL models
- Firebase handles identity
- Prisma handles persistence
- Render hosts the frontend, backend, and database

## What This Project Demonstrates

- End-to-end deployment of a full-stack app
- Frontend and backend integration with authenticated requests
- Production environment setup with secrets and service accounts
- Debugging real deployment issues such as CORS, mobile UI behavior, and database initialization

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a root `.env` file with:

```env
DATABASE_URL=
PORT=4001
FIREBASE_PROJECT_ID=
FIREBASE_WEB_API_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
VITE_API_URL=http://localhost:4001/api
```

### 3. Run the frontend

```bash
npm run dev
```

### 4. Run the backend

```bash
npm run server:dev
```

### 5. Sync Prisma schema

```bash
npm run prisma:push
```

## Production Notes

- Frontend and backend are deployed separately on Render
- Backend exposes `GET /health`
- The frontend uses `VITE_API_URL` and production fallbacks for API access
- Firebase Admin can run from env vars or a Render secret file

## Next Improvements

- Split remaining dashboard logic into smaller hooks/components
- Add tests for auth and API flows
- Reduce frontend bundle size
- Improve analytics and progress visualizations
