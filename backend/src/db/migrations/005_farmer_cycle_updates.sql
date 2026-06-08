CREATE TABLE IF NOT EXISTS farmer_cycle_updates (
  id                    SERIAL PRIMARY KEY,
  deal_id               INTEGER NOT NULL REFERENCES deals(id),
  cycle_num             INTEGER NOT NULL,
  funding_received_at   TIMESTAMPTZ,
  report_title          TEXT,
  report_description    TEXT,
  report_amount_used    TEXT,
  report_evidence_url   TEXT,
  report_submitted_at   TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (deal_id, cycle_num)
);
