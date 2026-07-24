-- Stage 2 Slice 1: additive Estonia-to-Uzbekistan fiat financial foundation.
-- Existing Deal, wallet, NEAR ledger, and return data remains unchanged as Legacy Testnet Alpha.

CREATE TABLE IF NOT EXISTS uzbekistan_feedlot_operators (
  id                             BIGSERIAL PRIMARY KEY,
  legal_name                     TEXT NOT NULL,
  registration_reference        TEXT,
  country_code                   TEXT NOT NULL DEFAULT 'UZ',
  operator_agreement_reference   TEXT NOT NULL,
  fiat_payment_details_reference TEXT,
  status                         TEXT NOT NULL DEFAULT 'pending',
  legacy_metadata                JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_by                     TEXT NOT NULL,
  created_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uzbekistan_feedlot_operators_legal_name_check
    CHECK (BTRIM(legal_name) <> ''),
  CONSTRAINT uzbekistan_feedlot_operators_country_check
    CHECK (country_code = 'UZ'),
  CONSTRAINT uzbekistan_feedlot_operators_agreement_check
    CHECK (BTRIM(operator_agreement_reference) <> ''),
  CONSTRAINT uzbekistan_feedlot_operators_status_check
    CHECK (status IN ('pending', 'approved', 'suspended', 'closed'))
);

CREATE UNIQUE INDEX IF NOT EXISTS uzbekistan_feedlot_operators_agreement_unique
  ON uzbekistan_feedlot_operators (operator_agreement_reference);

CREATE TABLE IF NOT EXISTS operator_farmer_assignments (
  id             BIGSERIAL PRIMARY KEY,
  operator_id    BIGINT NOT NULL REFERENCES uzbekistan_feedlot_operators(id),
  farmer_user_id INTEGER REFERENCES users(id),
  deal_id        INTEGER NOT NULL REFERENCES deals(id),
  assigned_by    TEXT NOT NULL,
  assigned_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at       TIMESTAMPTZ,
  metadata       JSONB NOT NULL DEFAULT '{}'::JSONB,
  CONSTRAINT operator_farmer_assignments_period_check
    CHECK (ended_at IS NULL OR ended_at >= assigned_at),
  CONSTRAINT operator_farmer_assignments_deal_unique
    UNIQUE (deal_id),
  CONSTRAINT operator_farmer_assignments_deal_operator_unique
    UNIQUE (deal_id, operator_id)
);

CREATE TABLE IF NOT EXISTS financial_workflows (
  id                 BIGSERIAL PRIMARY KEY,
  deal_id            INTEGER NOT NULL REFERENCES deals(id),
  operator_id        BIGINT NOT NULL REFERENCES uzbekistan_feedlot_operators(id),
  current_state      TEXT,
  current_state_event_id BIGINT,
  idempotency_key    TEXT NOT NULL UNIQUE,
  created_by         TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  legacy_metadata    JSONB NOT NULL DEFAULT '{}'::JSONB,
  CONSTRAINT financial_workflows_deal_unique UNIQUE (deal_id),
  CONSTRAINT financial_workflows_id_operator_unique UNIQUE (id, operator_id),
  CONSTRAINT financial_workflows_assignment_fkey
    FOREIGN KEY (deal_id, operator_id)
    REFERENCES operator_farmer_assignments(deal_id, operator_id),
  CONSTRAINT financial_workflows_idempotency_key_check
    CHECK (BTRIM(idempotency_key) <> ''),
  CONSTRAINT financial_workflows_current_state_check CHECK (
    current_state IS NULL OR current_state IN (
      'INVESTOR_FUNDING_RECEIVED',
      'CRYPTO_CONVERSION_INITIATED',
      'CRYPTO_CONVERSION_COMPLETED',
      'FIAT_CLEARED',
      'OPERATOR_DISBURSEMENT_APPROVED',
      'OPERATOR_DISBURSEMENT_SENT',
      'OPERATOR_DISBURSEMENT_CONFIRMED',
      'PROJECT_EXPENSE_RECORDED',
      'FIAT_PROCEEDS_RECEIVED',
      'RECONCILIATION_COMPLETED',
      'INVESTOR_SETTLEMENT_APPROVED',
      'INVESTOR_SETTLEMENT_COMPLETED'
    )
  ),
  CONSTRAINT financial_workflows_projection_pair_check CHECK (
    (current_state IS NULL AND current_state_event_id IS NULL)
    OR (current_state IS NOT NULL AND current_state_event_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS crypto_conversion_records (
  id                            BIGSERIAL PRIMARY KEY,
  workflow_id                   BIGINT NOT NULL REFERENCES financial_workflows(id),
  legal_entity                  TEXT NOT NULL DEFAULT 'AgriPartners OÜ',
  jurisdiction_code             CHAR(2) NOT NULL DEFAULT 'EE',
  conversion_layer              TEXT NOT NULL DEFAULT 'ESTONIA',
  crypto_account_scope          TEXT NOT NULL DEFAULT 'AGRIPARTNERS_OU_ESTONIA',
  fiat_recipient_scope          TEXT NOT NULL DEFAULT 'AGRIPARTNERS_OU_ESTONIA',
  status                        TEXT NOT NULL,
  crypto_asset                  TEXT NOT NULL,
  crypto_amount                 NUMERIC(36, 18) NOT NULL,
  fiat_currency                 VARCHAR(3),
  fiat_amount                   NUMERIC(24, 8),
  infrastructure_reference     TEXT NOT NULL,
  supporting_evidence_reference TEXT NOT NULL,
  initiated_by                  TEXT NOT NULL,
  completed_by                  TEXT,
  initiated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at                  TIMESTAMPTZ,
  idempotency_key               TEXT NOT NULL UNIQUE,
  supplementary_onchain_reference TEXT,
  CONSTRAINT crypto_conversion_records_workflow_unique
    UNIQUE (workflow_id),
  CONSTRAINT crypto_conversion_records_legal_entity_check
    CHECK (legal_entity = 'AgriPartners OÜ'),
  CONSTRAINT crypto_conversion_records_jurisdiction_check
    CHECK (jurisdiction_code = 'EE'),
  CONSTRAINT crypto_conversion_records_layer_check
    CHECK (conversion_layer = 'ESTONIA'),
  CONSTRAINT crypto_conversion_records_crypto_scope_check
    CHECK (crypto_account_scope = 'AGRIPARTNERS_OU_ESTONIA'),
  CONSTRAINT crypto_conversion_records_fiat_scope_check
    CHECK (fiat_recipient_scope = 'AGRIPARTNERS_OU_ESTONIA'),
  CONSTRAINT crypto_conversion_records_status_check
    CHECK (status IN ('INITIATED', 'COMPLETED', 'FAILED', 'CANCELLED')),
  CONSTRAINT crypto_conversion_records_crypto_amount_check
    CHECK (crypto_amount > 0),
  CONSTRAINT crypto_conversion_records_fiat_currency_check
    CHECK (fiat_currency IS NULL OR fiat_currency ~ '^[A-Z]{3}$'),
  CONSTRAINT crypto_conversion_records_completion_check CHECK (
    (status = 'COMPLETED'
      AND fiat_currency IS NOT NULL
      AND fiat_amount > 0
      AND completed_by IS NOT NULL
      AND completed_at IS NOT NULL)
    OR
    (status <> 'COMPLETED')
  ),
  CONSTRAINT crypto_conversion_records_idempotency_check
    CHECK (BTRIM(idempotency_key) <> ''),
  CONSTRAINT crypto_conversion_records_infrastructure_reference_check
    CHECK (BTRIM(infrastructure_reference) <> ''),
  CONSTRAINT crypto_conversion_records_evidence_reference_check
    CHECK (BTRIM(supporting_evidence_reference) <> '')
);

CREATE TABLE IF NOT EXISTS operator_fiat_transfers (
  id                            BIGSERIAL PRIMARY KEY,
  workflow_id                   BIGINT NOT NULL REFERENCES financial_workflows(id),
  operator_id                   BIGINT NOT NULL REFERENCES uzbekistan_feedlot_operators(id),
  direction                     TEXT NOT NULL,
  status                        TEXT NOT NULL,
  currency_type                 TEXT NOT NULL DEFAULT 'FIAT',
  currency                      VARCHAR(3) NOT NULL,
  amount                        NUMERIC(24, 8) NOT NULL,
  bank_payment_reference        TEXT NOT NULL,
  supporting_evidence_reference TEXT NOT NULL,
  initiated_by                  TEXT NOT NULL,
  authorized_by                 TEXT NOT NULL,
  operator_confirmed_by         TEXT,
  initiated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at                       TIMESTAMPTZ,
  confirmed_at                  TIMESTAMPTZ,
  idempotency_key               TEXT NOT NULL UNIQUE,
  metadata                      JSONB NOT NULL DEFAULT '{}'::JSONB,
  CONSTRAINT operator_fiat_transfers_workflow_operator_fkey
    FOREIGN KEY (workflow_id, operator_id)
    REFERENCES financial_workflows(id, operator_id),
  CONSTRAINT operator_fiat_transfers_direction_check
    CHECK (direction IN ('DISBURSEMENT', 'RETURN')),
  CONSTRAINT operator_fiat_transfers_status_check
    CHECK (status IN ('APPROVED', 'SENT', 'CONFIRMED', 'RECEIVED', 'RECONCILED')),
  CONSTRAINT operator_fiat_transfers_currency_type_check
    CHECK (currency_type = 'FIAT'),
  CONSTRAINT operator_fiat_transfers_currency_check
    CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT operator_fiat_transfers_amount_check
    CHECK (amount > 0),
  CONSTRAINT operator_fiat_transfers_payment_reference_check
    CHECK (BTRIM(bank_payment_reference) <> ''),
  CONSTRAINT operator_fiat_transfers_evidence_reference_check
    CHECK (BTRIM(supporting_evidence_reference) <> ''),
  CONSTRAINT operator_fiat_transfers_separation_of_duties_check
    CHECK (initiated_by <> authorized_by),
  CONSTRAINT operator_fiat_transfers_idempotency_check
    CHECK (BTRIM(idempotency_key) <> ''),
  CONSTRAINT operator_fiat_transfers_timestamps_check CHECK (
    (status = 'APPROVED' AND sent_at IS NULL AND confirmed_at IS NULL)
    OR
    (status = 'SENT' AND sent_at IS NOT NULL AND confirmed_at IS NULL)
    OR
    (status IN ('CONFIRMED', 'RECEIVED', 'RECONCILED')
      AND sent_at IS NOT NULL
      AND confirmed_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS financial_evidence (
  id                              BIGSERIAL PRIMARY KEY,
  workflow_id                     BIGINT NOT NULL REFERENCES financial_workflows(id),
  evidence_type                   TEXT NOT NULL,
  evidence_reference              TEXT NOT NULL,
  authority                       TEXT NOT NULL,
  supplementary_onchain_reference TEXT,
  recorded_by                     TEXT NOT NULL,
  recorded_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                        JSONB NOT NULL DEFAULT '{}'::JSONB,
  CONSTRAINT financial_evidence_type_check CHECK (
    evidence_type IN (
      'GOVERNING_AGREEMENT',
      'CONVERSION_PROVIDER_RECORD',
      'BANK_PAYMENT_RECORD',
      'ACCOUNTING_RECORD',
      'OPERATOR_CONFIRMATION',
      'PROJECT_EXPENSE_RECORD',
      'RECONCILIATION_RECORD',
      'INVESTOR_SETTLEMENT_RECORD'
    )
  ),
  CONSTRAINT financial_evidence_authority_check CHECK (
    authority IN (
      'AGREEMENT',
      'APPROVED_CONVERSION_INFRASTRUCTURE',
      'BANK_OR_PAYMENT_CHANNEL',
      'ACCOUNTING',
      'OPERATOR',
      'RECONCILIATION'
    )
  ),
  CONSTRAINT financial_evidence_reference_check
    CHECK (BTRIM(evidence_reference) <> '')
);

CREATE TABLE IF NOT EXISTS financial_state_events (
  id                              BIGSERIAL PRIMARY KEY,
  workflow_id                     BIGINT NOT NULL REFERENCES financial_workflows(id),
  from_state                      TEXT,
  to_state                        TEXT NOT NULL,
  currency_type                   TEXT NOT NULL DEFAULT 'FIAT',
  currency                        VARCHAR(3),
  amount                          NUMERIC(24, 8),
  bank_payment_reference          TEXT,
  supporting_evidence_reference   TEXT NOT NULL,
  evidence_authority              TEXT NOT NULL,
  supplementary_onchain_reference TEXT,
  actor_id                        TEXT NOT NULL,
  actor_role                      TEXT NOT NULL,
  authorized_by                   TEXT,
  occurred_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key                 TEXT NOT NULL UNIQUE,
  metadata                        JSONB NOT NULL DEFAULT '{}'::JSONB,
  CONSTRAINT financial_state_events_id_workflow_unique
    UNIQUE (id, workflow_id),
  CONSTRAINT financial_state_events_to_state_check CHECK (
    to_state IN (
      'INVESTOR_FUNDING_RECEIVED',
      'CRYPTO_CONVERSION_INITIATED',
      'CRYPTO_CONVERSION_COMPLETED',
      'FIAT_CLEARED',
      'OPERATOR_DISBURSEMENT_APPROVED',
      'OPERATOR_DISBURSEMENT_SENT',
      'OPERATOR_DISBURSEMENT_CONFIRMED',
      'PROJECT_EXPENSE_RECORDED',
      'FIAT_PROCEEDS_RECEIVED',
      'RECONCILIATION_COMPLETED',
      'INVESTOR_SETTLEMENT_APPROVED',
      'INVESTOR_SETTLEMENT_COMPLETED'
    )
  ),
  CONSTRAINT financial_state_events_currency_type_check
    CHECK (currency_type = 'FIAT'),
  CONSTRAINT financial_state_events_from_state_check CHECK (
    from_state IS NULL OR from_state IN (
      'INVESTOR_FUNDING_RECEIVED',
      'CRYPTO_CONVERSION_INITIATED',
      'CRYPTO_CONVERSION_COMPLETED',
      'FIAT_CLEARED',
      'OPERATOR_DISBURSEMENT_APPROVED',
      'OPERATOR_DISBURSEMENT_SENT',
      'OPERATOR_DISBURSEMENT_CONFIRMED',
      'PROJECT_EXPENSE_RECORDED',
      'FIAT_PROCEEDS_RECEIVED',
      'RECONCILIATION_COMPLETED',
      'INVESTOR_SETTLEMENT_APPROVED',
      'INVESTOR_SETTLEMENT_COMPLETED'
    )
  ),
  CONSTRAINT financial_state_events_currency_check
    CHECK (currency IS NULL OR currency ~ '^[A-Z]{3}$'),
  CONSTRAINT financial_state_events_amount_check
    CHECK (amount IS NULL OR amount > 0),
  CONSTRAINT financial_state_events_authority_check CHECK (
    evidence_authority IN (
      'AGREEMENT',
      'APPROVED_CONVERSION_INFRASTRUCTURE',
      'BANK_OR_PAYMENT_CHANNEL',
      'ACCOUNTING',
      'OPERATOR_CONFIRMATION',
      'RECONCILIATION'
    )
  ),
  CONSTRAINT financial_state_events_actor_role_check CHECK (
    actor_role IN (
      'AGRIPARTNERS_ADMIN',
      'FINANCE_INITIATOR',
      'FINANCE_APPROVER',
      'RECONCILIATION_REVIEWER',
      'OPERATOR_REPRESENTATIVE',
      'SYSTEM'
    )
  ),
  CONSTRAINT financial_state_events_idempotency_check
    CHECK (BTRIM(idempotency_key) <> ''),
  CONSTRAINT financial_state_events_evidence_reference_check
    CHECK (BTRIM(supporting_evidence_reference) <> ''),
  CONSTRAINT financial_state_events_authorization_check CHECK (
    to_state NOT IN (
      'OPERATOR_DISBURSEMENT_APPROVED',
      'RECONCILIATION_COMPLETED',
      'INVESTOR_SETTLEMENT_APPROVED'
    )
    OR (
      authorized_by IS NOT NULL
      AND BTRIM(authorized_by) <> ''
      AND authorized_by <> actor_id
    )
  )
);

ALTER TABLE financial_workflows
  ADD CONSTRAINT financial_workflows_current_event_fkey
  FOREIGN KEY (current_state_event_id, id)
  REFERENCES financial_state_events(id, workflow_id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE OR REPLACE FUNCTION protect_financial_workflow_projection()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  projection_from_state TEXT;
  projection_to_state TEXT;
  latest_event_id BIGINT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.current_state IS NOT NULL OR NEW.current_state_event_id IS NOT NULL THEN
      RAISE EXCEPTION 'Financial workflow must be created without a state projection';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.deal_id IS DISTINCT FROM OLD.deal_id
    OR NEW.operator_id IS DISTINCT FROM OLD.operator_id
  THEN
    RAISE EXCEPTION 'Financial workflow identity is immutable';
  END IF;

  IF NEW.current_state_event_id IS NOT DISTINCT FROM OLD.current_state_event_id THEN
    IF NEW.current_state IS DISTINCT FROM OLD.current_state THEN
      RAISE EXCEPTION 'Financial workflow state and event pointer must advance together';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.current_state_event_id IS NULL THEN
    RAISE EXCEPTION 'Financial workflow event projection cannot be cleared';
  END IF;

  SELECT from_state, to_state
    INTO projection_from_state, projection_to_state
    FROM financial_state_events
   WHERE id = NEW.current_state_event_id
     AND workflow_id = OLD.id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Financial workflow projection requires an event owned by the same workflow';
  END IF;

  IF projection_from_state IS DISTINCT FROM OLD.current_state THEN
    RAISE EXCEPTION 'Projection event from_state does not match the previous workflow state';
  END IF;

  IF projection_to_state IS DISTINCT FROM NEW.current_state THEN
    RAISE EXCEPTION 'Projection event to_state does not match the new workflow state';
  END IF;

  IF OLD.current_state_event_id IS NOT NULL
    AND NEW.current_state_event_id <= OLD.current_state_event_id
  THEN
    RAISE EXCEPTION 'Financial workflow projection cannot point backwards';
  END IF;

  SELECT MAX(id)
    INTO latest_event_id
    FROM financial_state_events
   WHERE workflow_id = OLD.id;

  IF NEW.current_state_event_id IS DISTINCT FROM latest_event_id THEN
    RAISE EXCEPTION 'Financial workflow projection must reference the latest authoritative event';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION protect_crypto_conversion_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.workflow_id IS DISTINCT FROM OLD.workflow_id THEN
    RAISE EXCEPTION 'Crypto conversion workflow ownership is immutable';
  END IF;

  IF OLD.status = 'COMPLETED' AND NEW IS DISTINCT FROM OLD THEN
    RAISE EXCEPTION 'Completed crypto conversion records are immutable';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_financial_state_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  workflow_state TEXT;
BEGIN
  SELECT current_state
    INTO workflow_state
    FROM financial_workflows
   WHERE id = NEW.workflow_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Financial workflow % does not exist', NEW.workflow_id;
  END IF;

  IF NEW.from_state IS DISTINCT FROM workflow_state THEN
    RAISE EXCEPTION 'Financial transition expected from %, received %',
      workflow_state, NEW.from_state;
  END IF;

  IF workflow_state IS NULL THEN
    IF NEW.to_state <> 'INVESTOR_FUNDING_RECEIVED' THEN
      RAISE EXCEPTION 'Invalid initial financial transition to %', NEW.to_state;
    END IF;
  ELSIF COALESCE((
    (workflow_state = 'INVESTOR_FUNDING_RECEIVED'
      AND NEW.to_state IN ('CRYPTO_CONVERSION_INITIATED', 'FIAT_CLEARED'))
    OR (workflow_state = 'CRYPTO_CONVERSION_INITIATED'
      AND NEW.to_state = 'CRYPTO_CONVERSION_COMPLETED')
    OR (workflow_state = 'CRYPTO_CONVERSION_COMPLETED'
      AND NEW.to_state = 'FIAT_CLEARED')
    OR (workflow_state = 'FIAT_CLEARED'
      AND NEW.to_state = 'OPERATOR_DISBURSEMENT_APPROVED')
    OR (workflow_state = 'OPERATOR_DISBURSEMENT_APPROVED'
      AND NEW.to_state = 'OPERATOR_DISBURSEMENT_SENT')
    OR (workflow_state = 'OPERATOR_DISBURSEMENT_SENT'
      AND NEW.to_state = 'OPERATOR_DISBURSEMENT_CONFIRMED')
    OR (workflow_state = 'OPERATOR_DISBURSEMENT_CONFIRMED'
      AND NEW.to_state IN ('PROJECT_EXPENSE_RECORDED', 'FIAT_PROCEEDS_RECEIVED'))
    OR (workflow_state = 'PROJECT_EXPENSE_RECORDED'
      AND NEW.to_state IN ('PROJECT_EXPENSE_RECORDED', 'FIAT_PROCEEDS_RECEIVED'))
    OR (workflow_state = 'FIAT_PROCEEDS_RECEIVED'
      AND NEW.to_state = 'RECONCILIATION_COMPLETED')
    OR (workflow_state = 'RECONCILIATION_COMPLETED'
      AND NEW.to_state = 'INVESTOR_SETTLEMENT_APPROVED')
    OR (workflow_state = 'INVESTOR_SETTLEMENT_APPROVED'
      AND NEW.to_state = 'INVESTOR_SETTLEMENT_COMPLETED')
  ), FALSE) = FALSE THEN
    RAISE EXCEPTION 'Invalid financial transition from % to %',
      workflow_state, NEW.to_state;
  END IF;

  IF NEW.to_state = 'CRYPTO_CONVERSION_INITIATED'
    AND NOT EXISTS (
      SELECT 1
        FROM crypto_conversion_records
       WHERE workflow_id = NEW.workflow_id
         AND status = 'INITIATED'
    )
  THEN
    RAISE EXCEPTION 'Crypto conversion initiation requires an initiated Estonia-layer conversion record';
  END IF;

  IF NEW.to_state = 'CRYPTO_CONVERSION_COMPLETED'
    AND NOT EXISTS (
      SELECT 1
        FROM crypto_conversion_records
       WHERE workflow_id = NEW.workflow_id
         AND status = 'COMPLETED'
         AND fiat_currency IS NOT NULL
         AND fiat_amount > 0
         AND completed_by IS NOT NULL
         AND completed_at IS NOT NULL
    )
  THEN
    RAISE EXCEPTION 'Crypto conversion completion requires a completed Estonia-layer conversion record';
  END IF;

  IF NEW.to_state = 'FIAT_CLEARED'
    AND workflow_state = 'CRYPTO_CONVERSION_COMPLETED'
    AND NOT EXISTS (
      SELECT 1
        FROM crypto_conversion_records
       WHERE workflow_id = NEW.workflow_id
         AND status = 'COMPLETED'
         AND fiat_currency IS NOT NULL
         AND fiat_amount > 0
         AND completed_by IS NOT NULL
         AND completed_at IS NOT NULL
    )
  THEN
    RAISE EXCEPTION 'Fiat clearance after crypto conversion requires a completed Estonia-layer conversion record';
  END IF;

  IF NEW.to_state IN (
    'FIAT_CLEARED',
    'OPERATOR_DISBURSEMENT_SENT',
    'OPERATOR_DISBURSEMENT_CONFIRMED',
    'FIAT_PROCEEDS_RECEIVED',
    'RECONCILIATION_COMPLETED',
    'INVESTOR_SETTLEMENT_COMPLETED'
  ) AND (NEW.currency IS NULL OR NEW.amount IS NULL) THEN
    RAISE EXCEPTION 'State % requires fiat currency and amount', NEW.to_state;
  END IF;

  IF NEW.to_state IN (
    'FIAT_CLEARED',
    'OPERATOR_DISBURSEMENT_SENT',
    'FIAT_PROCEEDS_RECEIVED',
    'INVESTOR_SETTLEMENT_COMPLETED'
  ) AND (NEW.bank_payment_reference IS NULL OR BTRIM(NEW.bank_payment_reference) = '') THEN
    RAISE EXCEPTION 'State % requires a bank or payment reference', NEW.to_state;
  END IF;

  UPDATE financial_workflows
     SET current_state = NEW.to_state,
         current_state_event_id = NEW.id,
         updated_at = NEW.occurred_at
   WHERE id = NEW.workflow_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION reject_financial_state_event_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Financial state history is immutable';
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'crypto_conversion_records_protect_lifecycle'
  ) THEN
    CREATE TRIGGER crypto_conversion_records_protect_lifecycle
      BEFORE UPDATE ON crypto_conversion_records
      FOR EACH ROW EXECUTE FUNCTION protect_crypto_conversion_lifecycle();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'financial_workflows_protect_projection'
  ) THEN
    CREATE TRIGGER financial_workflows_protect_projection
      BEFORE INSERT OR UPDATE ON financial_workflows
      FOR EACH ROW EXECUTE FUNCTION protect_financial_workflow_projection();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'financial_state_events_validate_insert'
  ) THEN
    CREATE TRIGGER financial_state_events_validate_insert
      AFTER INSERT ON financial_state_events
      FOR EACH ROW EXECUTE FUNCTION validate_financial_state_event();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'financial_state_events_reject_update'
  ) THEN
    CREATE TRIGGER financial_state_events_reject_update
      BEFORE UPDATE ON financial_state_events
      FOR EACH ROW EXECUTE FUNCTION reject_financial_state_event_mutation();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'financial_state_events_reject_delete'
  ) THEN
    CREATE TRIGGER financial_state_events_reject_delete
      BEFORE DELETE ON financial_state_events
      FOR EACH ROW EXECUTE FUNCTION reject_financial_state_event_mutation();
  END IF;
END
$$;

COMMENT ON TABLE uzbekistan_feedlot_operators IS
  'Fiat-only legal and operational recipients under separate agreements with AgriPartners OÜ.';
COMMENT ON TABLE operator_farmer_assignments IS
  'Separates Uzbekistan Feedlot Operator identity from the non-crypto Farmer UX role.';
COMMENT ON TABLE financial_state_events IS
  'Immutable authoritative financial workflow history; on-chain references are supplementary only.';
