CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  username      TEXT NOT NULL UNIQUE,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'farmer', 'investor')),
  near_account  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
