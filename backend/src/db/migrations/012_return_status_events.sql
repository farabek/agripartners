CREATE TABLE IF NOT EXISTS return_status_events (
  id                SERIAL PRIMARY KEY,
  return_id         INTEGER NOT NULL REFERENCES deal_returns(id),
  from_status       TEXT,
  to_status         TEXT NOT NULL,
  changed_by        TEXT,
  changed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note              TEXT,
  evidence_metadata JSONB,
  CONSTRAINT return_status_events_from_status_check
    CHECK (from_status IS NULL OR from_status IN ('recorded', 'approved', 'paid', 'reconciled')),
  CONSTRAINT return_status_events_to_status_check
    CHECK (to_status IN ('recorded', 'approved', 'paid', 'reconciled'))
);
