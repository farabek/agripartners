CREATE TABLE IF NOT EXISTS wallet_auth_challenges (
  nonce TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  recipient TEXT NOT NULL,
  nonce_bytes BYTEA NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (OCTET_LENGTH(nonce_bytes) = 32)
);

CREATE INDEX IF NOT EXISTS wallet_auth_challenges_expiry_idx
  ON wallet_auth_challenges (expires_at)
  WHERE consumed_at IS NULL;

COMMENT ON TABLE wallet_auth_challenges IS
  'Shared, single-use NEP-413 authentication challenges. Expired records may be deleted by maintenance jobs.';
