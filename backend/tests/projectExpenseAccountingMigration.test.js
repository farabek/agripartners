const fs = require('fs');
const path = require('path');

const migrationPath = path.join(
  __dirname,
  '..',
  'src',
  'db',
  'migrations',
  '017_project_expense_accounting_foundation.sql'
);
const migration = fs.readFileSync(migrationPath, 'utf8');

const approvedTables = [
  'expense_categories',
  'financial_workflow_budgets',
  'project_expenses',
  'project_expense_state_events',
  'project_expense_evidence',
];

const expenseStates = ['REQUESTED', 'APPROVED', 'REJECTED', 'CANCELLED', 'PAID'];

test('migration is additive and remains inside the approved database boundary', () => {
  expect(migration).not.toMatch(/\bDROP\s+(TABLE|COLUMN)\b/i);
  expect(migration).not.toMatch(/\bRENAME\s+(COLUMN|TO)\b/i);
  expect(migration).not.toMatch(/\bUPDATE\s+(deals|users|reports|deal_returns|treasury_)/i);
  expect(migration).not.toMatch(/\bDELETE\s+FROM\b/i);
});

test('migration creates exactly the five approved Slice 2 tables', () => {
  const createdTables = [...migration.matchAll(/CREATE TABLE IF NOT EXISTS\s+([a-z_]+)/g)]
    .map((match) => match[1]);
  expect(createdTables).toEqual(approvedTables);
});

test('all Slice 2 monetary fields use canonical NUMERIC(24,8)', () => {
  for (const field of [
    'budget_amount',
    'requested_amount',
    'approved_amount',
    'paid_amount',
  ]) {
    const definitions = migration.match(new RegExp(`${field}\\s+NUMERIC\\(24,8\\)`, 'g')) || [];
    expect(definitions.length).toBeGreaterThan(0);
  }
  expect(migration).not.toMatch(/\b(FLOAT|REAL|DOUBLE PRECISION)\b/i);
  expect(migration).not.toContain('NUMERIC(36,18)');
  expect(migration).not.toMatch(/yocto|token conversion/i);
});

test('budgets and Expenses are structurally fiat-only with canonical currencies', () => {
  expect((migration.match(/currency_type\s+TEXT NOT NULL DEFAULT 'FIAT'/g) || [])).toHaveLength(2);
  expect((migration.match(/CHECK \(currency_type = 'FIAT'\)/g) || []).length).toBeGreaterThanOrEqual(2);
  expect((migration.match(/CHECK \(currency ~ '\^\[A-Z\]\{3\}\$'\)/g) || []).length).toBeGreaterThanOrEqual(2);
});

test('category catalog uses stable codes and conflict-safe non-overwriting seeds', () => {
  for (const code of [
    'LIVESTOCK_PURCHASE',
    'FEED',
    'VETERINARY',
    'LABOR',
    'TRANSPORT',
    'UTILITIES',
    'FACILITY_OPERATIONS',
    'OTHER_APPROVED',
  ]) {
    expect(migration).toContain(`'${code}'`);
  }
  expect(migration).toContain('expense_categories_code_unique');
  expect(migration).toContain('Expense category identity is immutable');
  expect(migration).toContain('Expense categories cannot be deleted');
  expect(migration).toContain('ON CONFLICT (code) DO NOTHING');
  expect(migration).not.toMatch(/ON CONFLICT \(code\)\s+DO UPDATE/i);
});

test('budget identity, idempotency, lifecycle, and dynamic reservations are enforced', () => {
  expect(migration).toContain('financial_workflow_budgets_semantic_unique');
  expect(migration).toMatch(/UNIQUE \(workflow_id, category_id, currency\)/);
  expect(migration).toContain('financial_workflow_budgets_ownership_unique');
  expect(migration).toContain('financial_workflow_budgets_idempotency_unique');
  expect(migration).toContain('Closed financial workflow budgets cannot be reopened');
  expect(migration).toContain('Financial workflow budgets cannot be deleted');
  expect(migration).toContain('Budget amount cannot be reduced below current reservations');
  expect(migration).toMatch(/current_state IN \('APPROVED', 'PAID'\)/);
  expect(migration).toContain('SUM(approved_amount)');
  const tableDefinitions = migration.slice(
    0,
    migration.indexOf('CREATE OR REPLACE FUNCTION')
  );
  expect(tableDefinitions).not.toMatch(/\breserved_(amount|balance)\s+NUMERIC/i);
});

test('Option B and budget ownership are database-enforced', () => {
  expect(migration).toContain('financial_workflows_id_deal_operator_unique');
  expect(migration).toMatch(
    /FOREIGN KEY \(workflow_id, deal_id, operator_id\)\s+REFERENCES financial_workflows\(id, deal_id, operator_id\)/
  );
  expect(migration).toMatch(
    /FOREIGN KEY \(budget_id, workflow_id, category_id, currency\)\s+REFERENCES financial_workflow_budgets\(id, workflow_id, category_id, currency\)/
  );
});

test('Expense has one event-backed state projection and no independent status', () => {
  expect(migration).toContain('current_state          TEXT');
  expect(migration).toContain('current_state_event_id BIGINT');
  expect(migration).toContain('project_expenses_projection_pair_check');
  const expenseDefinition = migration.slice(
    migration.indexOf('CREATE TABLE IF NOT EXISTS project_expenses'),
    migration.indexOf('CREATE TABLE IF NOT EXISTS project_expense_state_events')
  );
  expect(expenseDefinition).not.toMatch(/\bstatus\s+TEXT/i);
});

test('Expense and event monetary NULL semantics cover every approved state', () => {
  for (const state of expenseStates) {
    expect(migration).toContain(`current_state = '${state}'`);
    expect(migration).toContain(`to_state = '${state}'`);
  }
  expect(migration).toMatch(/current_state = 'REQUESTED'[\s\S]*?approved_amount IS NULL[\s\S]*?paid_amount IS NULL/);
  expect(migration).toMatch(/current_state = 'APPROVED'[\s\S]*?approved_amount > 0[\s\S]*?paid_amount IS NULL/);
  expect(migration).toMatch(/current_state = 'REJECTED'[\s\S]*?approved_amount IS NULL[\s\S]*?paid_amount IS NULL/);
  expect(migration).toMatch(/current_state = 'CANCELLED'[\s\S]*?paid_amount IS NULL/);
  expect(migration).toMatch(/current_state = 'PAID'[\s\S]*?paid_amount = approved_amount/);
});

test('the exact Expense lifecycle and actor roles are validation-controlled', () => {
  for (const transition of [
    "NEW.to_state <> 'REQUESTED'",
    "expense_state = 'REQUESTED' AND NEW.to_state = 'APPROVED'",
    "expense_state = 'REQUESTED' AND NEW.to_state = 'REJECTED'",
    "expense_state = 'REQUESTED' AND NEW.to_state = 'CANCELLED'",
    "expense_state = 'APPROVED' AND NEW.to_state = 'PAID'",
    "expense_state = 'APPROVED' AND NEW.to_state = 'CANCELLED'",
  ]) {
    expect(migration).toContain(transition);
  }
  for (const role of [
    'EXPENSE_REQUESTER',
    'EXPENSE_APPROVER',
    'EXPENSE_REJECTOR',
    'EXPENSE_CANCELLER',
    'EXPENSE_PAYER',
    'SYSTEM',
  ]) {
    expect(migration).toContain(`'${role}'`);
  }
  expect(migration).toContain('Invalid Project Expense transition from % to %');
});

test('projection validates ownership, latest event, stale state, and monotonic pointer', () => {
  expect(migration).toContain('project_expenses_current_event_fkey');
  expect(migration).toMatch(
    /FOREIGN KEY \(current_state_event_id, id\)\s+REFERENCES project_expense_state_events\(id, expense_id\)/
  );
  expect(migration).toContain('Project Expense projection event from_state is stale');
  expect(migration).toContain('Project Expense projection cannot point backwards');
  expect(migration).toContain('SELECT MAX(id)');
  expect(migration).toContain('Project Expense projection must reference the latest authoritative event');
  expect(migration).toContain('Project Expense projection fields may advance only through an event');
  expect(migration).not.toMatch(/pg_trigger_depth\s*\(/);
});

test('uninitialized Expense commit is rejected through a deferred constraint trigger', () => {
  expect(migration).toContain('CREATE CONSTRAINT TRIGGER project_expenses_require_initialized');
  expect(migration).toContain('DEFERRABLE INITIALLY DEFERRED');
  expect(migration).toContain('must be initialized by a REQUESTED event before commit');
});

test('Expense event and terminal records are immutable', () => {
  expect(migration).toContain('Project Expense state history is immutable');
  expect(migration).toContain('BEFORE UPDATE ON project_expense_state_events');
  expect(migration).toContain('BEFORE DELETE ON project_expense_state_events');
  expect(migration).toContain('Terminal Project Expense records are immutable');
  expect(migration).toContain('Project Expenses cannot be deleted');
});

test('approval uses dynamic APPROVED and PAID reservations under a budget lock', () => {
  expect(migration).toMatch(
    /FROM financial_workflow_budgets[\s\S]*?WHERE id = preliminary_budget_id[\s\S]*?FOR UPDATE/
  );
  expect(migration).toMatch(/current_state IN \('APPROVED', 'PAID'\)/);
  expect(migration).toContain('Project Expense approval exceeds available budget');
  expect(migration).toContain('Closed financial workflow budget cannot accept approvals');
  expect(migration).not.toMatch(/workflow.{0,30}(funding|ceiling).{0,30}budget/i);
});

test('PAID requires exactly one authoritative fiat evidence record', () => {
  expect(migration).toContain("evidence_role IN ('AUTHORITATIVE_PAYMENT', 'SUPPLEMENTARY')");
  expect(migration).toContain('project_expense_evidence_authoritative_unique');
  expect(migration).toContain("WHERE evidence_role = 'AUTHORITATIVE_PAYMENT'");
  expect(migration).toContain('Paid Project Expense requires authoritative fiat payment evidence');
  expect(migration).toContain('Authoritative payment evidence is accepted only for an approved Expense');
  expect(migration).toContain("evidence_authority IN ('BANK', 'PAYMENT_CHANNEL', 'ACCOUNTING')");
  expect(migration).toMatch(/AUTHORITATIVE_PAYMENT[\s\S]*?supplementary_onchain_reference IS NULL/);
  expect(migration).toContain('Project Expense evidence is immutable');
});

test('paid amount equals approved amount and no partial-payment model exists', () => {
  expect((migration.match(/paid_amount = approved_amount/g) || []).length).toBeGreaterThanOrEqual(2);
  expect(migration).toContain('Paid amount must equal the approved amount');
  expect(migration).not.toMatch(/partial[_ ]payment|payment_installment|PAYMENT_PENDING/i);
});

test('Design A links new workflow Expense events prospectively without rewriting history', () => {
  expect(migration).toContain('ADD COLUMN IF NOT EXISTS project_expense_id BIGINT');
  expect(migration).toMatch(
    /FOREIGN KEY \(project_expense_id, workflow_id\)\s+REFERENCES project_expenses\(id, workflow_id\)/
  );
  expect(migration).toContain('financial_state_events_project_expense_link_check');
  expect(migration).toContain('NOT VALID');
  expect(migration).toContain('New Project Expense workflow events require a linked paid Expense');
  expect(migration).toContain('PROJECT_EXPENSE_RECORDED requires a paid Expense in the same workflow');
  expect(migration).toContain('Only PROJECT_EXPENSE_RECORDED may reference a Project Expense');
  expect(migration).not.toMatch(/UPDATE\s+financial_state_events/i);
  expect(migration).not.toMatch(/project_expense_id\s*=/i);
});

test('one workflow event per Expense is enforced without blocking different Expenses', () => {
  expect(migration).toContain('financial_state_events_project_expense_unique');
  expect(migration).toMatch(
    /ON financial_state_events \(project_expense_id\)\s+WHERE to_state = 'PROJECT_EXPENSE_RECORDED'/
  );
  expect(migration).not.toMatch(/UNIQUE[^(]*\(workflow_id\)[\s\S]*?PROJECT_EXPENSE_RECORDED/i);
});

test('global idempotency exists for budgets, Expenses, events, and evidence', () => {
  for (const constraint of [
    'financial_workflow_budgets_idempotency_unique',
    'project_expenses_idempotency_unique',
    'project_expense_state_events_idempotency_unique',
    'project_expense_evidence_idempotency_unique',
  ]) {
    expect(migration).toContain(constraint);
  }
});

test('migration introduces no Uzbekistan-side crypto destination fields', () => {
  expect(migration).not.toMatch(/(operator|farmer|supplier).{0,40}(wallet|near_account|crypto_destination)/i);
  expect(migration).not.toMatch(/(wallet|near_account|crypto_destination).{0,40}(operator|farmer|supplier)/i);
});

test('repeat-run guards cover alterations, indexes, functions, triggers, and seeds', () => {
  expect((migration.match(/CREATE TABLE IF NOT EXISTS/g) || [])).toHaveLength(5);
  expect(migration).toContain('ADD COLUMN IF NOT EXISTS project_expense_id');
  expect(migration).toContain('SELECT 1 FROM pg_constraint');
  expect(migration).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
  expect(migration).toContain('CREATE OR REPLACE FUNCTION');
  expect(migration).toContain('SELECT 1 FROM pg_trigger');
  expect(migration).toContain('ON CONFLICT (code) DO NOTHING');
});
