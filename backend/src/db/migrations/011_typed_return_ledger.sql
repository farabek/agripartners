ALTER TABLE deal_returns
  ADD COLUMN entry_type TEXT,
  ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'recorded',
  ADD COLUMN currency TEXT NOT NULL DEFAULT 'NEAR',
  ADD COLUMN recorded_by TEXT,
  ADD COLUMN transaction_hash TEXT,
  ADD COLUMN reconciled_at TIMESTAMPTZ,
  ADD COLUMN reconciled_by TEXT,
  ADD COLUMN reconciliation_metadata JSONB;

ALTER TABLE deal_returns
  ADD CONSTRAINT deal_returns_entry_type_check
    CHECK (entry_type IS NULL OR entry_type IN ('principal', 'profit', 'fee', 'correction')),
  ADD CONSTRAINT deal_returns_payment_status_check
    CHECK (payment_status IN ('recorded', 'approved', 'paid', 'reconciled')),
  ADD CONSTRAINT deal_returns_currency_check
    CHECK (currency = 'NEAR'),
  ADD CONSTRAINT deal_returns_reconciliation_check
    CHECK (
      (payment_status = 'reconciled' AND reconciled_at IS NOT NULL AND reconciled_by IS NOT NULL)
      OR
      (payment_status <> 'reconciled' AND reconciled_at IS NULL AND reconciled_by IS NULL)
    );

ALTER TABLE deal_returns
  ADD CONSTRAINT deal_returns_positive_amount_check
    CHECK (
      CASE
        WHEN amount_near ~ '^[0-9]+(\.[0-9]{1,24})?$'
          THEN amount_near::NUMERIC > 0
        ELSE FALSE
      END
    ) NOT VALID;
