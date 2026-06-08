CREATE TABLE IF NOT EXISTS reports (
  id             SERIAL PRIMARY KEY,
  deal_id        INTEGER NOT NULL REFERENCES deals(id),
  cycle_id       INTEGER NOT NULL,
  farmer_wallet  TEXT NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  amount_used    TEXT,
  evidence_url   TEXT,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (deal_id, cycle_id)
);

INSERT INTO reports (
  deal_id, cycle_id, farmer_wallet, title, description, amount_used,
  evidence_url, submitted_at, created_at
)
SELECT
  fcu.deal_id,
  fcu.cycle_num,
  d.farmer,
  fcu.report_title,
  fcu.report_description,
  fcu.report_amount_used,
  fcu.report_evidence_url,
  fcu.report_submitted_at,
  fcu.report_submitted_at
FROM farmer_cycle_updates fcu
JOIN deals d ON d.id = fcu.deal_id
WHERE fcu.report_submitted_at IS NOT NULL
  AND fcu.report_title IS NOT NULL
  AND fcu.report_description IS NOT NULL
ON CONFLICT (deal_id, cycle_id) DO NOTHING;
