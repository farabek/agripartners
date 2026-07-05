CREATE TABLE IF NOT EXISTS deals (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_address    TEXT NOT NULL UNIQUE,
  deal_type           TEXT NOT NULL,
  title               TEXT,
  description         TEXT,
  farmer              TEXT NOT NULL,
  investor            TEXT NOT NULL,
  admin               TEXT NOT NULL,
  platform            TEXT NOT NULL,
  investment_amount   TEXT NOT NULL,
  farmer_split_pct    INTEGER NOT NULL,
  investor_split_pct  INTEGER NOT NULL,
  escrow_pct          INTEGER NOT NULL,
  performance_fee_pct INTEGER NOT NULL,
  cycle_duration_days INTEGER NOT NULL,
  total_cycles        INTEGER NOT NULL,
  capital_return_near TEXT NOT NULL,
  projected_roi_pct   NUMERIC(8, 4) NOT NULL DEFAULT 20,
  created_at          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id     INTEGER NOT NULL REFERENCES deals(id),
  event_type  TEXT NOT NULL,
  cycle_num   INTEGER,
  profit_near TEXT,
  losses_near TEXT,
  tx_hash     TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS investor_profiles (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id    TEXT NOT NULL UNIQUE,
  display_name  TEXT,
  country       TEXT,
  investor_type TEXT,
  risk_profile  TEXT,
  kyc_status    TEXT NOT NULL DEFAULT 'not_started',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS farmer_cycle_updates (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id               INTEGER NOT NULL REFERENCES deals(id),
  cycle_num             INTEGER NOT NULL,
  funding_received_at   TEXT,
  report_title          TEXT,
  report_description    TEXT,
  report_amount_used    TEXT,
  report_evidence_url   TEXT,
  report_submitted_at   TEXT,
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL,
  UNIQUE (deal_id, cycle_num)
);

CREATE TABLE IF NOT EXISTS user_profiles (
  wallet_account_id  TEXT PRIMARY KEY,
  role               TEXT NOT NULL CHECK (role IN ('farmer', 'investor')),
  display_name       TEXT NOT NULL,
  country            TEXT,
  phone              TEXT,
  organization_name  TEXT,
  bio                TEXT,
  onboarding_complete BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TEXT NOT NULL,
  updated_at         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reports (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id        INTEGER NOT NULL REFERENCES deals(id),
  cycle_id       INTEGER NOT NULL,
  farmer_wallet  TEXT NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  amount_used    TEXT,
  evidence_url   TEXT,
  submitted_at   TEXT NOT NULL,
  created_at     TEXT NOT NULL,
  UNIQUE (deal_id, cycle_id)
);

CREATE TABLE IF NOT EXISTS deal_returns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id INTEGER NOT NULL,
  amount_near TEXT NOT NULL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
