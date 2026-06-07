CREATE TABLE IF NOT EXISTS investor_profiles (
  id            SERIAL PRIMARY KEY,
  account_id    TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  country       TEXT,
  investor_type TEXT,
  risk_profile  TEXT,
  kyc_status    TEXT NOT NULL DEFAULT 'not_started',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
