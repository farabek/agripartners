CREATE TABLE IF NOT EXISTS deals (
  id                  SERIAL PRIMARY KEY,
  contract_address    TEXT NOT NULL UNIQUE,
  deal_type           TEXT NOT NULL,
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
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id          SERIAL PRIMARY KEY,
  deal_id     INTEGER NOT NULL REFERENCES deals(id),
  event_type  TEXT NOT NULL,
  cycle_num   INTEGER,
  profit_near TEXT,
  losses_near TEXT,
  tx_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
