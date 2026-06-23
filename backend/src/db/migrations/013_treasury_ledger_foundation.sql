CREATE TABLE IF NOT EXISTS treasury_accounts (
  id           SERIAL PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  currency     TEXT NOT NULL DEFAULT 'NEAR',
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT treasury_accounts_account_type_check
    CHECK (account_type IN ('asset', 'liability', 'revenue', 'expense', 'adjustment')),
  CONSTRAINT treasury_accounts_currency_check
    CHECK (currency <> '')
);

CREATE TABLE IF NOT EXISTS treasury_transactions (
  id                   SERIAL PRIMARY KEY,
  transaction_type     TEXT NOT NULL,
  currency             TEXT NOT NULL DEFAULT 'NEAR',
  description          TEXT,
  related_deal_id      INTEGER REFERENCES deals(id),
  related_investor     TEXT,
  related_farmer       TEXT,
  blockchain_reference TEXT,
  metadata             JSONB,
  created_by           TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT treasury_transactions_currency_check
    CHECK (currency <> '')
);

CREATE TABLE IF NOT EXISTS treasury_ledger_entries (
  id               SERIAL PRIMARY KEY,
  transaction_id   INTEGER NOT NULL REFERENCES treasury_transactions(id),
  account_code     TEXT NOT NULL REFERENCES treasury_accounts(account_code),
  direction        TEXT NOT NULL,
  amount           TEXT NOT NULL,
  currency         TEXT NOT NULL DEFAULT 'NEAR',
  related_deal_id  INTEGER REFERENCES deals(id),
  related_investor TEXT,
  related_farmer   TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT treasury_ledger_entries_direction_check
    CHECK (direction IN ('debit', 'credit')),
  CONSTRAINT treasury_ledger_entries_positive_amount_check
    CHECK (
      CASE
        WHEN amount ~ '^[0-9]+(\.[0-9]{1,24})?$'
          THEN amount::NUMERIC > 0
        ELSE FALSE
      END
    ),
  CONSTRAINT treasury_ledger_entries_currency_check
    CHECK (currency <> '')
);

INSERT INTO treasury_accounts (account_code, account_name, account_type, currency)
VALUES
  ('PLATFORM_TREASURY_CASH', 'Platform Treasury Cash', 'asset', 'NEAR'),
  ('INVESTOR_LIABILITY', 'Investor Liability', 'liability', 'NEAR'),
  ('RESERVED_INVESTMENT_CAPITAL', 'Reserved Investment Capital', 'asset', 'NEAR'),
  ('ACTIVE_DEAL_CAPITAL', 'Active Deal Capital', 'asset', 'NEAR'),
  ('FARMER_FUNDING_DISBURSED', 'Farmer Funding Disbursed', 'asset', 'NEAR'),
  ('RECORDED_OFFCHAIN_RETURNS', 'Recorded Off-chain Returns', 'asset', 'NEAR'),
  ('INVESTOR_PAYABLE_RETURNS', 'Investor Payable Returns', 'liability', 'NEAR'),
  ('PLATFORM_FEE_REVENUE', 'Platform Fee Revenue', 'revenue', 'NEAR'),
  ('TREASURY_SUSPENSE', 'Treasury Suspense / Unreconciled', 'adjustment', 'NEAR'),
  ('LOSS_ADJUSTMENT', 'Loss / Adjustment', 'expense', 'NEAR')
ON CONFLICT (account_code) DO NOTHING;
