-- Stage 2 Slice 2: additive fiat-only Project Expense Accounting foundation.
-- Migrations 001-016 remain authoritative for all pre-existing records.

CREATE UNIQUE INDEX IF NOT EXISTS financial_workflows_id_deal_operator_unique
  ON financial_workflows (id, deal_id, operator_id);

CREATE TABLE IF NOT EXISTS expense_categories (
  id           BIGSERIAL PRIMARY KEY,
  code         TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  metadata     JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT expense_categories_code_unique UNIQUE (code),
  CONSTRAINT expense_categories_code_check
    CHECK (code ~ '^[A-Z][A-Z0-9_]*$'),
  CONSTRAINT expense_categories_display_name_check
    CHECK (BTRIM(display_name) <> '')
);

CREATE TABLE IF NOT EXISTS financial_workflow_budgets (
  id              BIGSERIAL PRIMARY KEY,
  workflow_id     BIGINT NOT NULL REFERENCES financial_workflows(id),
  category_id     BIGINT NOT NULL REFERENCES expense_categories(id),
  currency_type   TEXT NOT NULL DEFAULT 'FIAT',
  currency        VARCHAR(3) NOT NULL,
  budget_amount   NUMERIC(24,8) NOT NULL,
  is_closed       BOOLEAN NOT NULL DEFAULT FALSE,
  created_by      TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT financial_workflow_budgets_semantic_unique
    UNIQUE (workflow_id, category_id, currency),
  CONSTRAINT financial_workflow_budgets_ownership_unique
    UNIQUE (id, workflow_id, category_id, currency),
  CONSTRAINT financial_workflow_budgets_idempotency_unique
    UNIQUE (idempotency_key),
  CONSTRAINT financial_workflow_budgets_currency_type_check
    CHECK (currency_type = 'FIAT'),
  CONSTRAINT financial_workflow_budgets_currency_check
    CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT financial_workflow_budgets_amount_check
    CHECK (budget_amount > 0),
  CONSTRAINT financial_workflow_budgets_created_by_check
    CHECK (BTRIM(created_by) <> ''),
  CONSTRAINT financial_workflow_budgets_idempotency_check
    CHECK (BTRIM(idempotency_key) <> '')
);

CREATE TABLE IF NOT EXISTS project_expenses (
  id                     BIGSERIAL PRIMARY KEY,
  workflow_id            BIGINT NOT NULL,
  deal_id                INTEGER NOT NULL,
  operator_id            BIGINT NOT NULL,
  budget_id              BIGINT NOT NULL,
  category_id            BIGINT NOT NULL,
  purpose                TEXT NOT NULL,
  description            TEXT,
  supplier_reference     TEXT,
  currency_type          TEXT NOT NULL DEFAULT 'FIAT',
  currency               VARCHAR(3) NOT NULL,
  requested_amount       NUMERIC(24,8) NOT NULL,
  approved_amount        NUMERIC(24,8),
  paid_amount            NUMERIC(24,8),
  current_state          TEXT,
  current_state_event_id BIGINT,
  created_by             TEXT NOT NULL,
  idempotency_key        TEXT NOT NULL,
  metadata               JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT project_expenses_id_workflow_unique
    UNIQUE (id, workflow_id),
  CONSTRAINT project_expenses_idempotency_unique
    UNIQUE (idempotency_key),
  CONSTRAINT project_expenses_workflow_identity_fkey
    FOREIGN KEY (workflow_id, deal_id, operator_id)
    REFERENCES financial_workflows(id, deal_id, operator_id),
  CONSTRAINT project_expenses_budget_ownership_fkey
    FOREIGN KEY (budget_id, workflow_id, category_id, currency)
    REFERENCES financial_workflow_budgets(id, workflow_id, category_id, currency),
  CONSTRAINT project_expenses_currency_type_check
    CHECK (currency_type = 'FIAT'),
  CONSTRAINT project_expenses_currency_check
    CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT project_expenses_requested_amount_check
    CHECK (requested_amount > 0),
  CONSTRAINT project_expenses_purpose_check
    CHECK (BTRIM(purpose) <> ''),
  CONSTRAINT project_expenses_created_by_check
    CHECK (BTRIM(created_by) <> ''),
  CONSTRAINT project_expenses_idempotency_check
    CHECK (BTRIM(idempotency_key) <> ''),
  CONSTRAINT project_expenses_state_check CHECK (
    current_state IS NULL OR current_state IN (
      'REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'PAID'
    )
  ),
  CONSTRAINT project_expenses_projection_pair_check CHECK (
    (current_state IS NULL AND current_state_event_id IS NULL)
    OR (current_state IS NOT NULL AND current_state_event_id IS NOT NULL)
  ),
  CONSTRAINT project_expenses_monetary_state_check CHECK (
    (current_state IS NULL
      AND approved_amount IS NULL
      AND paid_amount IS NULL)
    OR
    (current_state = 'REQUESTED'
      AND approved_amount IS NULL
      AND paid_amount IS NULL)
    OR
    (current_state = 'APPROVED'
      AND approved_amount > 0
      AND paid_amount IS NULL)
    OR
    (current_state = 'REJECTED'
      AND approved_amount IS NULL
      AND paid_amount IS NULL)
    OR
    (current_state = 'CANCELLED'
      AND (approved_amount IS NULL OR approved_amount > 0)
      AND paid_amount IS NULL)
    OR
    (current_state = 'PAID'
      AND approved_amount > 0
      AND paid_amount > 0
      AND paid_amount = approved_amount)
  )
);

CREATE TABLE IF NOT EXISTS project_expense_state_events (
  id               BIGSERIAL PRIMARY KEY,
  expense_id       BIGINT NOT NULL REFERENCES project_expenses(id),
  from_state       TEXT,
  to_state         TEXT NOT NULL,
  requested_amount NUMERIC(24,8) NOT NULL,
  approved_amount  NUMERIC(24,8),
  paid_amount      NUMERIC(24,8),
  actor_id         TEXT NOT NULL,
  actor_role       TEXT NOT NULL,
  occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  idempotency_key  TEXT NOT NULL,
  metadata         JSONB NOT NULL DEFAULT '{}'::JSONB,
  CONSTRAINT project_expense_state_events_id_expense_unique
    UNIQUE (id, expense_id),
  CONSTRAINT project_expense_state_events_idempotency_unique
    UNIQUE (idempotency_key),
  CONSTRAINT project_expense_state_events_from_state_check CHECK (
    from_state IS NULL OR from_state IN (
      'REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'PAID'
    )
  ),
  CONSTRAINT project_expense_state_events_to_state_check CHECK (
    to_state IN ('REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'PAID')
  ),
  CONSTRAINT project_expense_state_events_actor_role_check CHECK (
    actor_role IN (
      'EXPENSE_REQUESTER',
      'EXPENSE_APPROVER',
      'EXPENSE_REJECTOR',
      'EXPENSE_CANCELLER',
      'EXPENSE_PAYER',
      'SYSTEM'
    )
  ),
  CONSTRAINT project_expense_state_events_actor_check
    CHECK (BTRIM(actor_id) <> ''),
  CONSTRAINT project_expense_state_events_idempotency_check
    CHECK (BTRIM(idempotency_key) <> ''),
  CONSTRAINT project_expense_state_events_snapshot_check CHECK (
    (to_state = 'REQUESTED'
      AND requested_amount > 0
      AND approved_amount IS NULL
      AND paid_amount IS NULL)
    OR
    (to_state = 'APPROVED'
      AND requested_amount > 0
      AND approved_amount > 0
      AND paid_amount IS NULL)
    OR
    (to_state = 'REJECTED'
      AND requested_amount > 0
      AND approved_amount IS NULL
      AND paid_amount IS NULL)
    OR
    (to_state = 'CANCELLED'
      AND requested_amount > 0
      AND (approved_amount IS NULL OR approved_amount > 0)
      AND paid_amount IS NULL)
    OR
    (to_state = 'PAID'
      AND requested_amount > 0
      AND approved_amount > 0
      AND paid_amount > 0
      AND paid_amount = approved_amount)
  )
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'project_expenses_current_event_fkey'
      AND conrelid = 'project_expenses'::REGCLASS
  ) THEN
    ALTER TABLE project_expenses
      ADD CONSTRAINT project_expenses_current_event_fkey
      FOREIGN KEY (current_state_event_id, id)
      REFERENCES project_expense_state_events(id, expense_id)
      DEFERRABLE INITIALLY DEFERRED;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS project_expense_evidence (
  id                                BIGSERIAL PRIMARY KEY,
  expense_id                        BIGINT NOT NULL REFERENCES project_expenses(id),
  evidence_type                     TEXT NOT NULL,
  evidence_authority                TEXT NOT NULL,
  evidence_role                     TEXT NOT NULL,
  evidence_reference                TEXT NOT NULL,
  recorded_by                       TEXT NOT NULL,
  recorded_at                       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  supplementary_onchain_reference   TEXT,
  metadata                          JSONB NOT NULL DEFAULT '{}'::JSONB,
  idempotency_key                   TEXT NOT NULL,
  CONSTRAINT project_expense_evidence_idempotency_unique
    UNIQUE (idempotency_key),
  CONSTRAINT project_expense_evidence_type_check CHECK (
    evidence_type IN (
      'INVOICE',
      'RECEIPT',
      'BANK_PAYMENT_RECORD',
      'PAYMENT_CHANNEL_RECORD',
      'ACCOUNTING_RECORD',
      'SUPPLIER_CONFIRMATION',
      'OTHER_SUPPORTING'
    )
  ),
  CONSTRAINT project_expense_evidence_authority_check CHECK (
    evidence_authority IN (
      'BANK',
      'PAYMENT_CHANNEL',
      'ACCOUNTING',
      'OPERATOR',
      'SUPPLIER',
      'OTHER'
    )
  ),
  CONSTRAINT project_expense_evidence_role_check
    CHECK (evidence_role IN ('AUTHORITATIVE_PAYMENT', 'SUPPLEMENTARY')),
  CONSTRAINT project_expense_evidence_authoritative_check CHECK (
    evidence_role <> 'AUTHORITATIVE_PAYMENT'
    OR (
      evidence_type IN (
        'BANK_PAYMENT_RECORD',
        'PAYMENT_CHANNEL_RECORD',
        'ACCOUNTING_RECORD'
      )
      AND evidence_authority IN ('BANK', 'PAYMENT_CHANNEL', 'ACCOUNTING')
      AND supplementary_onchain_reference IS NULL
    )
  ),
  CONSTRAINT project_expense_evidence_reference_check
    CHECK (BTRIM(evidence_reference) <> ''),
  CONSTRAINT project_expense_evidence_recorded_by_check
    CHECK (BTRIM(recorded_by) <> ''),
  CONSTRAINT project_expense_evidence_idempotency_check
    CHECK (BTRIM(idempotency_key) <> '')
);

CREATE INDEX IF NOT EXISTS financial_workflow_budgets_workflow_idx
  ON financial_workflow_budgets (workflow_id);

CREATE INDEX IF NOT EXISTS project_expenses_workflow_state_idx
  ON project_expenses (workflow_id, current_state);

CREATE INDEX IF NOT EXISTS project_expenses_budget_reservation_idx
  ON project_expenses (budget_id, current_state)
  INCLUDE (approved_amount);

CREATE INDEX IF NOT EXISTS project_expenses_budget_ownership_idx
  ON project_expenses (budget_id, workflow_id, category_id, currency);

CREATE INDEX IF NOT EXISTS project_expenses_workflow_identity_idx
  ON project_expenses (workflow_id, deal_id, operator_id);

CREATE INDEX IF NOT EXISTS project_expense_state_events_history_idx
  ON project_expense_state_events (expense_id, id);

CREATE INDEX IF NOT EXISTS project_expense_evidence_history_idx
  ON project_expense_evidence (expense_id, recorded_at, id);

CREATE UNIQUE INDEX IF NOT EXISTS project_expense_evidence_authoritative_unique
  ON project_expense_evidence (expense_id)
  WHERE evidence_role = 'AUTHORITATIVE_PAYMENT';

CREATE OR REPLACE FUNCTION protect_expense_category()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Expense categories cannot be deleted';
  END IF;

  NEW.code := UPPER(BTRIM(NEW.code));
  NEW.display_name := BTRIM(NEW.display_name);

  IF TG_OP = 'UPDATE' THEN
    IF NEW.id IS DISTINCT FROM OLD.id
      OR NEW.code IS DISTINCT FROM OLD.code
      OR NEW.created_at IS DISTINCT FROM OLD.created_at
    THEN
      RAISE EXCEPTION 'Expense category identity is immutable';
    END IF;
    NEW.updated_at := NOW();
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION protect_financial_workflow_budget()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  reserved_amount NUMERIC(24,8);
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Financial workflow budgets cannot be deleted';
  END IF;

  NEW.currency := UPPER(BTRIM(NEW.currency));
  NEW.created_by := BTRIM(NEW.created_by);
  NEW.idempotency_key := BTRIM(NEW.idempotency_key);

  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.workflow_id IS DISTINCT FROM OLD.workflow_id
    OR NEW.category_id IS DISTINCT FROM OLD.category_id
    OR NEW.currency_type IS DISTINCT FROM OLD.currency_type
    OR NEW.currency IS DISTINCT FROM OLD.currency
    OR NEW.created_by IS DISTINCT FROM OLD.created_by
    OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Financial workflow budget identity is immutable';
  END IF;

  IF OLD.is_closed AND NOT NEW.is_closed THEN
    RAISE EXCEPTION 'Closed financial workflow budgets cannot be reopened';
  END IF;

  IF OLD.is_closed AND NEW.budget_amount IS DISTINCT FROM OLD.budget_amount THEN
    RAISE EXCEPTION 'Closed financial workflow budget amounts are immutable';
  END IF;

  IF NEW.budget_amount < OLD.budget_amount THEN
    SELECT COALESCE(SUM(approved_amount), 0)
      INTO reserved_amount
      FROM project_expenses
     WHERE budget_id = OLD.id
       AND current_state IN ('APPROVED', 'PAID');

    IF NEW.budget_amount < reserved_amount THEN
      RAISE EXCEPTION 'Budget amount cannot be reduced below current reservations';
    END IF;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION normalize_project_expense_state_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actor_id := BTRIM(NEW.actor_id);
  NEW.idempotency_key := BTRIM(NEW.idempotency_key);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION protect_project_expense_projection()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  projection_from_state TEXT;
  projection_to_state TEXT;
  projection_requested_amount NUMERIC(24,8);
  projection_approved_amount NUMERIC(24,8);
  projection_paid_amount NUMERIC(24,8);
  projection_occurred_at TIMESTAMPTZ;
  latest_event_id BIGINT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Project Expenses cannot be deleted';
  END IF;

  NEW.currency := UPPER(BTRIM(NEW.currency));
  NEW.purpose := BTRIM(NEW.purpose);
  NEW.created_by := BTRIM(NEW.created_by);
  NEW.idempotency_key := BTRIM(NEW.idempotency_key);
  IF NEW.supplier_reference IS NOT NULL THEN
    NEW.supplier_reference := NULLIF(BTRIM(NEW.supplier_reference), '');
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.current_state IS NOT NULL OR NEW.current_state_event_id IS NOT NULL THEN
      RAISE EXCEPTION 'Project Expense must be created without a state projection';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
    OR NEW.workflow_id IS DISTINCT FROM OLD.workflow_id
    OR NEW.deal_id IS DISTINCT FROM OLD.deal_id
    OR NEW.operator_id IS DISTINCT FROM OLD.operator_id
    OR NEW.budget_id IS DISTINCT FROM OLD.budget_id
    OR NEW.category_id IS DISTINCT FROM OLD.category_id
    OR NEW.currency_type IS DISTINCT FROM OLD.currency_type
    OR NEW.currency IS DISTINCT FROM OLD.currency
    OR NEW.requested_amount IS DISTINCT FROM OLD.requested_amount
    OR NEW.created_by IS DISTINCT FROM OLD.created_by
    OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key
    OR NEW.created_at IS DISTINCT FROM OLD.created_at
  THEN
    RAISE EXCEPTION 'Project Expense identity is immutable';
  END IF;

  IF OLD.current_state IN ('PAID', 'REJECTED', 'CANCELLED')
    AND NEW IS DISTINCT FROM OLD
  THEN
    RAISE EXCEPTION 'Terminal Project Expense records are immutable';
  END IF;

  IF NEW.current_state_event_id IS NOT DISTINCT FROM OLD.current_state_event_id THEN
    IF NEW.current_state IS DISTINCT FROM OLD.current_state
      OR NEW.approved_amount IS DISTINCT FROM OLD.approved_amount
      OR NEW.paid_amount IS DISTINCT FROM OLD.paid_amount
      OR NEW.updated_at IS DISTINCT FROM OLD.updated_at
    THEN
      RAISE EXCEPTION 'Project Expense projection fields may advance only through an event';
    END IF;

    IF NEW IS DISTINCT FROM OLD THEN
      NEW.updated_at := NOW();
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.current_state_event_id IS NULL THEN
    RAISE EXCEPTION 'Project Expense event projection cannot be cleared';
  END IF;

  SELECT from_state, to_state, requested_amount, approved_amount, paid_amount, occurred_at
    INTO projection_from_state, projection_to_state, projection_requested_amount,
         projection_approved_amount, projection_paid_amount, projection_occurred_at
    FROM project_expense_state_events
   WHERE id = NEW.current_state_event_id
     AND expense_id = OLD.id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project Expense projection requires an event owned by the same Expense';
  END IF;

  IF projection_from_state IS DISTINCT FROM OLD.current_state THEN
    RAISE EXCEPTION 'Project Expense projection event from_state is stale';
  END IF;

  IF projection_to_state IS DISTINCT FROM NEW.current_state
    OR projection_requested_amount IS DISTINCT FROM NEW.requested_amount
    OR projection_approved_amount IS DISTINCT FROM NEW.approved_amount
    OR projection_paid_amount IS DISTINCT FROM NEW.paid_amount
  THEN
    RAISE EXCEPTION 'Project Expense projection does not match the event snapshot';
  END IF;

  IF OLD.current_state_event_id IS NOT NULL
    AND NEW.current_state_event_id <= OLD.current_state_event_id
  THEN
    RAISE EXCEPTION 'Project Expense projection cannot point backwards';
  END IF;

  SELECT MAX(id)
    INTO latest_event_id
    FROM project_expense_state_events
   WHERE expense_id = OLD.id;

  IF NEW.current_state_event_id IS DISTINCT FROM latest_event_id THEN
    RAISE EXCEPTION 'Project Expense projection must reference the latest authoritative event';
  END IF;

  NEW.updated_at := projection_occurred_at;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION validate_project_expense_state_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  preliminary_budget_id BIGINT;
  expense_state TEXT;
  expense_requested_amount NUMERIC(24,8);
  expense_approved_amount NUMERIC(24,8);
  expense_budget_id BIGINT;
  expense_created_by TEXT;
  budget_limit NUMERIC(24,8);
  budget_closed BOOLEAN;
  reserved_amount NUMERIC(24,8);
  requester_actor TEXT;
  approver_actor TEXT;
BEGIN
  SELECT budget_id
    INTO preliminary_budget_id
    FROM project_expenses
   WHERE id = NEW.expense_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project Expense % does not exist', NEW.expense_id;
  END IF;

  IF NEW.to_state = 'APPROVED'
    OR (NEW.from_state = 'APPROVED' AND NEW.to_state = 'CANCELLED')
  THEN
    SELECT budget_amount, is_closed
      INTO budget_limit, budget_closed
      FROM financial_workflow_budgets
     WHERE id = preliminary_budget_id
     FOR UPDATE;
  END IF;

  SELECT current_state, requested_amount, approved_amount, budget_id, created_by
    INTO expense_state, expense_requested_amount, expense_approved_amount,
         expense_budget_id, expense_created_by
    FROM project_expenses
   WHERE id = NEW.expense_id
   FOR UPDATE;

  IF NEW.from_state IS DISTINCT FROM expense_state THEN
    RAISE EXCEPTION 'Project Expense transition expected from %, received %',
      expense_state, NEW.from_state;
  END IF;

  IF expense_state IS NULL THEN
    IF NEW.to_state <> 'REQUESTED'
      OR NEW.actor_role NOT IN ('EXPENSE_REQUESTER', 'SYSTEM')
    THEN
      RAISE EXCEPTION 'Invalid initial Project Expense transition';
    END IF;
  ELSIF expense_state = 'REQUESTED' AND NEW.to_state = 'APPROVED' THEN
    IF NEW.actor_role NOT IN ('EXPENSE_APPROVER', 'SYSTEM') THEN
      RAISE EXCEPTION 'Project Expense approval requires an approver actor';
    END IF;
  ELSIF expense_state = 'REQUESTED' AND NEW.to_state = 'REJECTED' THEN
    IF NEW.actor_role NOT IN ('EXPENSE_REJECTOR', 'SYSTEM') THEN
      RAISE EXCEPTION 'Project Expense rejection requires a rejector actor';
    END IF;
  ELSIF expense_state = 'REQUESTED' AND NEW.to_state = 'CANCELLED' THEN
    IF NEW.actor_role NOT IN ('EXPENSE_CANCELLER', 'SYSTEM') THEN
      RAISE EXCEPTION 'Project Expense cancellation requires a canceller actor';
    END IF;
  ELSIF expense_state = 'APPROVED' AND NEW.to_state = 'PAID' THEN
    IF NEW.actor_role NOT IN ('EXPENSE_PAYER', 'SYSTEM') THEN
      RAISE EXCEPTION 'Project Expense payment requires a payer actor';
    END IF;
  ELSIF expense_state = 'APPROVED' AND NEW.to_state = 'CANCELLED' THEN
    IF NEW.actor_role NOT IN ('EXPENSE_CANCELLER', 'SYSTEM') THEN
      RAISE EXCEPTION 'Project Expense cancellation requires a canceller actor';
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid Project Expense transition from % to %',
      expense_state, NEW.to_state;
  END IF;

  IF NEW.requested_amount IS DISTINCT FROM expense_requested_amount THEN
    RAISE EXCEPTION 'Project Expense requested amount is immutable';
  END IF;

  IF expense_state IS NULL THEN
    IF NEW.approved_amount IS NOT NULL OR NEW.paid_amount IS NOT NULL THEN
      RAISE EXCEPTION 'Requested Project Expense cannot contain approval or payment amounts';
    END IF;
    IF BTRIM(NEW.actor_id) IS DISTINCT FROM BTRIM(expense_created_by) THEN
      RAISE EXCEPTION 'Project Expense requester must match the creation actor';
    END IF;
  ELSIF expense_state = 'REQUESTED' AND NEW.to_state = 'APPROVED' THEN
    SELECT actor_id
      INTO requester_actor
      FROM project_expense_state_events
     WHERE expense_id = NEW.expense_id
       AND from_state IS NULL
       AND to_state = 'REQUESTED'
     ORDER BY id
     LIMIT 1;

    IF BTRIM(NEW.actor_id) = BTRIM(requester_actor) THEN
      RAISE EXCEPTION 'Project Expense approver must differ from requester';
    END IF;

    IF budget_closed THEN
      RAISE EXCEPTION 'Closed financial workflow budget cannot accept approvals';
    END IF;

    SELECT COALESCE(SUM(approved_amount), 0)
      INTO reserved_amount
      FROM project_expenses
     WHERE budget_id = expense_budget_id
       AND current_state IN ('APPROVED', 'PAID')
       AND id <> NEW.expense_id;

    IF reserved_amount + NEW.approved_amount > budget_limit THEN
      RAISE EXCEPTION 'Project Expense approval exceeds available budget';
    END IF;
  ELSIF expense_state = 'REQUESTED' THEN
    IF NEW.approved_amount IS NOT NULL OR NEW.paid_amount IS NOT NULL THEN
      RAISE EXCEPTION 'Rejected or pre-approval cancelled Expense cannot contain approved or paid amounts';
    END IF;
  ELSIF expense_state = 'APPROVED' AND NEW.to_state = 'CANCELLED' THEN
    IF NEW.approved_amount IS DISTINCT FROM expense_approved_amount
      OR NEW.paid_amount IS NOT NULL
    THEN
      RAISE EXCEPTION 'Approved Expense cancellation must retain approved financial context';
    END IF;
  ELSIF expense_state = 'APPROVED' AND NEW.to_state = 'PAID' THEN
    IF NEW.approved_amount IS DISTINCT FROM expense_approved_amount
      OR NEW.paid_amount IS DISTINCT FROM expense_approved_amount
    THEN
      RAISE EXCEPTION 'Paid amount must equal the approved amount';
    END IF;

    SELECT actor_id
      INTO approver_actor
      FROM project_expense_state_events
     WHERE expense_id = NEW.expense_id
       AND to_state = 'APPROVED'
     ORDER BY id DESC
     LIMIT 1;

    IF BTRIM(NEW.actor_id) = BTRIM(approver_actor) THEN
      RAISE EXCEPTION 'Project Expense payer must differ from approver';
    END IF;

    PERFORM 1
      FROM project_expense_evidence
     WHERE expense_id = NEW.expense_id
       AND evidence_role = 'AUTHORITATIVE_PAYMENT'
     FOR KEY SHARE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Paid Project Expense requires authoritative fiat payment evidence';
    END IF;
  END IF;

  UPDATE project_expenses
     SET current_state = NEW.to_state,
         current_state_event_id = NEW.id,
         approved_amount = NEW.approved_amount,
         paid_amount = NEW.paid_amount,
         updated_at = NEW.occurred_at
   WHERE id = NEW.expense_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION require_initialized_project_expense()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  persisted_state TEXT;
  persisted_event_id BIGINT;
BEGIN
  SELECT current_state, current_state_event_id
    INTO persisted_state, persisted_event_id
    FROM project_expenses
   WHERE id = NEW.id;

  IF FOUND AND (
    persisted_state IS NULL
    OR persisted_event_id IS NULL
  ) THEN
    RAISE EXCEPTION 'Project Expense must be initialized by a REQUESTED event before commit';
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION reject_project_expense_state_event_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Project Expense state history is immutable';
END;
$$;

CREATE OR REPLACE FUNCTION validate_project_expense_evidence()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  expense_state TEXT;
BEGIN
  NEW.evidence_type := UPPER(BTRIM(NEW.evidence_type));
  NEW.evidence_authority := UPPER(BTRIM(NEW.evidence_authority));
  NEW.evidence_role := UPPER(BTRIM(NEW.evidence_role));
  NEW.evidence_reference := BTRIM(NEW.evidence_reference);
  NEW.recorded_by := BTRIM(NEW.recorded_by);
  NEW.idempotency_key := BTRIM(NEW.idempotency_key);

  SELECT current_state
    INTO expense_state
    FROM project_expenses
   WHERE id = NEW.expense_id
   FOR UPDATE;

  IF NOT FOUND OR expense_state IS NULL THEN
    RAISE EXCEPTION 'Expense evidence requires an initialized Project Expense';
  END IF;

  IF NEW.evidence_role = 'AUTHORITATIVE_PAYMENT'
    AND expense_state <> 'APPROVED'
  THEN
    RAISE EXCEPTION 'Authoritative payment evidence is accepted only for an approved Expense';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION reject_project_expense_evidence_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Project Expense evidence is immutable';
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'expense_categories_protect'
      AND tgrelid = 'expense_categories'::REGCLASS
  ) THEN
    CREATE TRIGGER expense_categories_protect
      BEFORE INSERT OR UPDATE OR DELETE ON expense_categories
      FOR EACH ROW EXECUTE FUNCTION protect_expense_category();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'financial_workflow_budgets_protect'
      AND tgrelid = 'financial_workflow_budgets'::REGCLASS
  ) THEN
    CREATE TRIGGER financial_workflow_budgets_protect
      BEFORE INSERT OR UPDATE OR DELETE ON financial_workflow_budgets
      FOR EACH ROW EXECUTE FUNCTION protect_financial_workflow_budget();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'project_expenses_protect_projection'
      AND tgrelid = 'project_expenses'::REGCLASS
  ) THEN
    CREATE TRIGGER project_expenses_protect_projection
      BEFORE INSERT OR UPDATE OR DELETE ON project_expenses
      FOR EACH ROW EXECUTE FUNCTION protect_project_expense_projection();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'project_expense_state_events_normalize'
      AND tgrelid = 'project_expense_state_events'::REGCLASS
  ) THEN
    CREATE TRIGGER project_expense_state_events_normalize
      BEFORE INSERT ON project_expense_state_events
      FOR EACH ROW EXECUTE FUNCTION normalize_project_expense_state_event();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'project_expense_state_events_validate'
      AND tgrelid = 'project_expense_state_events'::REGCLASS
  ) THEN
    CREATE TRIGGER project_expense_state_events_validate
      AFTER INSERT ON project_expense_state_events
      FOR EACH ROW EXECUTE FUNCTION validate_project_expense_state_event();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'project_expense_state_events_reject_update'
      AND tgrelid = 'project_expense_state_events'::REGCLASS
  ) THEN
    CREATE TRIGGER project_expense_state_events_reject_update
      BEFORE UPDATE ON project_expense_state_events
      FOR EACH ROW EXECUTE FUNCTION reject_project_expense_state_event_mutation();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'project_expense_state_events_reject_delete'
      AND tgrelid = 'project_expense_state_events'::REGCLASS
  ) THEN
    CREATE TRIGGER project_expense_state_events_reject_delete
      BEFORE DELETE ON project_expense_state_events
      FOR EACH ROW EXECUTE FUNCTION reject_project_expense_state_event_mutation();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'project_expenses_require_initialized'
      AND tgrelid = 'project_expenses'::REGCLASS
  ) THEN
    CREATE CONSTRAINT TRIGGER project_expenses_require_initialized
      AFTER INSERT OR UPDATE ON project_expenses
      DEFERRABLE INITIALLY DEFERRED
      FOR EACH ROW EXECUTE FUNCTION require_initialized_project_expense();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'project_expense_evidence_validate'
      AND tgrelid = 'project_expense_evidence'::REGCLASS
  ) THEN
    CREATE TRIGGER project_expense_evidence_validate
      BEFORE INSERT ON project_expense_evidence
      FOR EACH ROW EXECUTE FUNCTION validate_project_expense_evidence();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'project_expense_evidence_reject_update'
      AND tgrelid = 'project_expense_evidence'::REGCLASS
  ) THEN
    CREATE TRIGGER project_expense_evidence_reject_update
      BEFORE UPDATE ON project_expense_evidence
      FOR EACH ROW EXECUTE FUNCTION reject_project_expense_evidence_mutation();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'project_expense_evidence_reject_delete'
      AND tgrelid = 'project_expense_evidence'::REGCLASS
  ) THEN
    CREATE TRIGGER project_expense_evidence_reject_delete
      BEFORE DELETE ON project_expense_evidence
      FOR EACH ROW EXECUTE FUNCTION reject_project_expense_evidence_mutation();
  END IF;
END
$$;

ALTER TABLE financial_state_events
  ADD COLUMN IF NOT EXISTS project_expense_id BIGINT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'financial_state_events_project_expense_workflow_fkey'
      AND conrelid = 'financial_state_events'::REGCLASS
  ) THEN
    ALTER TABLE financial_state_events
      ADD CONSTRAINT financial_state_events_project_expense_workflow_fkey
      FOREIGN KEY (project_expense_id, workflow_id)
      REFERENCES project_expenses(id, workflow_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'financial_state_events_project_expense_link_check'
      AND conrelid = 'financial_state_events'::REGCLASS
  ) THEN
    ALTER TABLE financial_state_events
      ADD CONSTRAINT financial_state_events_project_expense_link_check
      CHECK (
        (to_state = 'PROJECT_EXPENSE_RECORDED' AND project_expense_id IS NOT NULL)
        OR
        (to_state <> 'PROJECT_EXPENSE_RECORDED' AND project_expense_id IS NULL)
      ) NOT VALID;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS financial_state_events_project_expense_unique
  ON financial_state_events (project_expense_id)
  WHERE to_state = 'PROJECT_EXPENSE_RECORDED'
    AND project_expense_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS financial_state_events_project_expense_workflow_idx
  ON financial_state_events (project_expense_id, workflow_id)
  WHERE project_expense_id IS NOT NULL;

CREATE OR REPLACE FUNCTION validate_financial_state_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  workflow_state TEXT;
  linked_expense_state TEXT;
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

  IF NEW.to_state = 'PROJECT_EXPENSE_RECORDED' THEN
    IF NEW.project_expense_id IS NULL THEN
      RAISE EXCEPTION 'New Project Expense workflow events require a linked paid Expense';
    END IF;

    SELECT current_state
      INTO linked_expense_state
      FROM project_expenses
     WHERE id = NEW.project_expense_id
       AND workflow_id = NEW.workflow_id
     FOR UPDATE;

    IF NOT FOUND OR linked_expense_state <> 'PAID' THEN
      RAISE EXCEPTION 'PROJECT_EXPENSE_RECORDED requires a paid Expense in the same workflow';
    END IF;
  ELSIF NEW.project_expense_id IS NOT NULL THEN
    RAISE EXCEPTION 'Only PROJECT_EXPENSE_RECORDED may reference a Project Expense';
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

INSERT INTO expense_categories (code, display_name, description)
VALUES
  ('LIVESTOCK_PURCHASE', 'Livestock Purchase', 'Approved livestock acquisition expenses.'),
  ('FEED', 'Feed', 'Feed and approved nutritional input expenses.'),
  ('VETERINARY', 'Veterinary', 'Veterinary care and approved animal-health expenses.'),
  ('LABOR', 'Labor', 'Approved local labor expenses.'),
  ('TRANSPORT', 'Transport', 'Approved local transport and logistics expenses.'),
  ('UTILITIES', 'Utilities', 'Approved Project utility expenses.'),
  ('FACILITY_OPERATIONS', 'Facility Operations', 'Approved facility operating expenses.'),
  ('OTHER_APPROVED', 'Other Approved', 'Other specifically approved Project expenses.')
ON CONFLICT (code) DO NOTHING;

COMMENT ON TABLE project_expenses IS
  'Authoritative fiat-only Project Expenses with immutable event-backed state projection.';
COMMENT ON TABLE project_expense_state_events IS
  'Immutable authoritative Project Expense lifecycle history ordered by event identity.';
COMMENT ON TABLE project_expense_evidence IS
  'Expense-specific fiat evidence; on-chain references are supplementary only.';
