ALTER TABLE treasury_transactions
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'treasury_transactions_idempotency_key_nonempty_check'
  ) THEN
    ALTER TABLE treasury_transactions
      ADD CONSTRAINT treasury_transactions_idempotency_key_nonempty_check
      CHECK (idempotency_key IS NULL OR BTRIM(idempotency_key) <> '');
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS treasury_transactions_idempotency_key_unique
  ON treasury_transactions (idempotency_key)
  WHERE idempotency_key IS NOT NULL;
