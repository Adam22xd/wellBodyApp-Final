CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT,
  calorie_goal INTEGER NOT NULL DEFAULT 0,
  water_goal INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS calorie_goal INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS water_goal INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS food_entries (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT NOT NULL,
  name TEXT NOT NULL,
  weight INTEGER NOT NULL,
  calories INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS water_entries (
  id SERIAL PRIMARY KEY,
  firebase_uid TEXT NOT NULL,
  name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_user_created
ON food_entries(firebase_uid, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_water_user_created
ON water_entries(firebase_uid, created_at DESC);
