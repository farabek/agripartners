CREATE TABLE IF NOT EXISTS user_profiles (
  wallet_account_id  TEXT PRIMARY KEY,
  role               TEXT NOT NULL CHECK (role IN ('farmer', 'investor')),
  display_name       TEXT NOT NULL,
  country            TEXT,
  phone              TEXT,
  organization_name  TEXT,
  bio                TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO user_profiles (wallet_account_id, role, display_name, country, created_at, updated_at)
SELECT account_id, 'investor', COALESCE(display_name, account_id), country, NOW(), NOW()
FROM investor_profiles
ON CONFLICT (wallet_account_id) DO NOTHING;

INSERT INTO user_profiles (wallet_account_id, role, display_name, created_at, updated_at)
SELECT near_account, role, near_account, NOW(), NOW()
FROM users
WHERE near_account IS NOT NULL
  AND role IN ('farmer', 'investor')
ON CONFLICT (wallet_account_id) DO NOTHING;

INSERT INTO user_profiles (wallet_account_id, role, display_name, created_at, updated_at)
SELECT DISTINCT farmer, 'farmer', farmer, NOW(), NOW()
FROM deals
ON CONFLICT (wallet_account_id) DO NOTHING;
