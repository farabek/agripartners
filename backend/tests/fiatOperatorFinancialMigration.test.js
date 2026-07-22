const fs = require('fs');
const path = require('path');

const migrationPath = path.join(
  __dirname,
  '..',
  'src',
  'db',
  'migrations',
  '016_fiat_operator_financial_foundation.sql'
);
const migration = fs.readFileSync(migrationPath, 'utf8');

const requiredStates = [
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
  'INVESTOR_SETTLEMENT_COMPLETED',
];

test('migration is forward-only and preserves every Legacy Alpha table and column', () => {
  expect(migration).not.toMatch(/DROP\s+(COLUMN|TABLE)/i);
  expect(migration).not.toMatch(/RENAME\s+(COLUMN|TO)/i);
  expect(migration).not.toMatch(/ALTER\s+TABLE\s+(deals|users|reports|deal_returns|treasury_)/i);
  expect(migration).not.toMatch(/UPDATE\s+(deals|users|reports|deal_returns|treasury_)/i);
  expect(migration).not.toMatch(/DELETE\s+FROM/i);
  expect(migration).toContain('Existing Deal, wallet, NEAR ledger, and return data remains unchanged');
});

test('migration creates the fiat operator and financial foundation additively', () => {
  for (const table of [
    'uzbekistan_feedlot_operators',
    'operator_farmer_assignments',
    'financial_workflows',
    'crypto_conversion_records',
    'operator_fiat_transfers',
    'financial_evidence',
    'financial_state_events',
  ]) {
    expect(migration).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
  }
});

test('Operator identity is separate from nullable Farmer UX identity and requires no wallet', () => {
  expect(migration).toContain('operator_id    BIGINT NOT NULL REFERENCES uzbekistan_feedlot_operators(id)');
  expect(migration).toContain('farmer_user_id INTEGER REFERENCES users(id)');
  expect(migration).not.toMatch(/farmer_wallet\s+TEXT\s+NOT NULL/i);
  expect(migration).not.toMatch(/operator_wallet/i);
  expect(migration).not.toMatch(/near_account\s+TEXT\s+NOT NULL/i);
});

test('all authoritative target states are constrained and transition-controlled', () => {
  for (const state of requiredStates) {
    expect(migration).toContain(`'${state}'`);
  }
  expect(migration).toContain('CREATE OR REPLACE FUNCTION validate_financial_state_event()');
  expect(migration).toContain('Invalid financial transition from % to %');
  expect(migration).toContain('AFTER INSERT ON financial_state_events');
  expect(migration).toContain('financial_state_events_from_state_check');
});

test('only NULL to investor funding received is permitted as an initial transition', () => {
  expect(migration).toContain('IF workflow_state IS NULL THEN');
  expect(migration).toContain("IF NEW.to_state <> 'INVESTOR_FUNDING_RECEIVED' THEN");
  expect(migration).toContain('Invalid initial financial transition to %');
  expect(migration).toContain('ELSIF COALESCE((');
  expect(migration).not.toMatch(/workflow_state IS NULL AND NEW\.to_state/);
});

test('workflow identity and state projection are protected from direct updates', () => {
  expect(migration).toContain('CREATE OR REPLACE FUNCTION protect_financial_workflow_projection()');
  expect(migration).toContain('Financial workflow identity is immutable');
  expect(migration).toContain('Financial workflow state and event pointer must advance together');
  expect(migration).not.toContain('pg_trigger_depth()');
  expect(migration).toContain('BEFORE INSERT OR UPDATE ON financial_workflows');
  expect(migration).toContain('UPDATE financial_workflows');
  expect(migration).toContain('SET current_state = NEW.to_state');
  expect(migration).toContain('current_state_event_id = NEW.id');
});

test('workflow creation starts with no state or authoritative event pointer', () => {
  expect(migration).toContain('current_state_event_id BIGINT');
  expect(migration).toContain('financial_workflows_projection_pair_check');
  expect(migration).toContain("IF TG_OP = 'INSERT' THEN");
  expect(migration).toContain('IF NEW.current_state IS NOT NULL OR NEW.current_state_event_id IS NOT NULL THEN');
  expect(migration).toContain('Financial workflow must be created without a state projection');
});

test('authoritative event pointer proves event ownership through a deferred composite foreign key', () => {
  const eventTablePosition = migration.indexOf('CREATE TABLE IF NOT EXISTS financial_state_events');
  const pointerForeignKeyPosition = migration.indexOf('ADD CONSTRAINT financial_workflows_current_event_fkey');
  expect(eventTablePosition).toBeGreaterThan(-1);
  expect(pointerForeignKeyPosition).toBeGreaterThan(eventTablePosition);
  expect(migration).toContain('financial_state_events_id_workflow_unique');
  expect(migration).toMatch(/UNIQUE \(id, workflow_id\)/);
  expect(migration).toMatch(/FOREIGN KEY \(current_state_event_id, id\)\s+REFERENCES financial_state_events\(id, workflow_id\)/);
  expect(migration).toContain('DEFERRABLE INITIALLY DEFERRED');
});

test('projection updates require the matching latest forward event', () => {
  expect(migration).toContain('Financial workflow projection requires an event owned by the same workflow');
  expect(migration).toContain('Projection event from_state does not match the previous workflow state');
  expect(migration).toContain('Projection event to_state does not match the new workflow state');
  expect(migration).toContain('Financial workflow projection cannot point backwards');
  expect(migration).toContain('SELECT MAX(id)');
  expect(migration).toContain('Financial workflow projection must reference the latest authoritative event');
  expect(migration).toContain('Financial workflow event projection cannot be cleared');
});

test('unrelated nested trigger depth cannot authorize a projection change', () => {
  expect(migration).not.toMatch(/pg_trigger_depth\s*\(/);
  expect(migration).toMatch(/WHERE id = NEW\.current_state_event_id\s+AND workflow_id = OLD\.id/);
  expect(migration).toMatch(/projection_from_state IS DISTINCT FROM OLD\.current_state/);
  expect(migration).toMatch(/projection_to_state IS DISTINCT FROM NEW\.current_state/);
});

test('validated events atomically advance state and pointer, including expense self-transitions', () => {
  expect(migration).toContain('AFTER INSERT ON financial_state_events');
  expect(migration).toMatch(/SET current_state = NEW\.to_state,\s+current_state_event_id = NEW\.id/);
  expect(migration).toMatch(/workflow_state = 'PROJECT_EXPENSE_RECORDED'[\s\S]*?NEW\.to_state IN \('PROJECT_EXPENSE_RECORDED', 'FIAT_PROCEEDS_RECEIVED'\)/);
  expect(migration).toContain('NEW.current_state_event_id IS NOT DISTINCT FROM OLD.current_state_event_id');
});

test('Deal assignment, workflow, and transfer enforce one consistent Operator', () => {
  expect(migration).toContain('operator_farmer_assignments_deal_unique');
  expect(migration).toMatch(/UNIQUE \(deal_id\)/);
  expect(migration).toContain('operator_farmer_assignments_deal_operator_unique');
  expect(migration).toMatch(/FOREIGN KEY \(deal_id, operator_id\)\s+REFERENCES operator_farmer_assignments\(deal_id, operator_id\)/);
  expect(migration).toContain('financial_workflows_id_operator_unique');
  expect(migration).toMatch(/FOREIGN KEY \(workflow_id, operator_id\)\s+REFERENCES financial_workflows\(id, operator_id\)/);
});

test('Estonia-layer conversion scope is fixed structurally and remains provider-neutral', () => {
  expect(migration).toContain("legal_entity                  TEXT NOT NULL DEFAULT 'AgriPartners OÜ'");
  expect(migration).toContain("jurisdiction_code             CHAR(2) NOT NULL DEFAULT 'EE'");
  expect(migration).toContain("conversion_layer              TEXT NOT NULL DEFAULT 'ESTONIA'");
  expect(migration).toContain("crypto_account_scope          TEXT NOT NULL DEFAULT 'AGRIPARTNERS_OU_ESTONIA'");
  expect(migration).toContain("fiat_recipient_scope          TEXT NOT NULL DEFAULT 'AGRIPARTNERS_OU_ESTONIA'");
  expect(migration).toContain("CHECK (legal_entity = 'AgriPartners OÜ')");
  expect(migration).toContain("CHECK (jurisdiction_code = 'EE')");
  expect(migration).toContain("CHECK (conversion_layer = 'ESTONIA')");
  expect(migration).not.toMatch(/(?:destination|recipient)_(?:wallet|near_account)/i);
  expect(migration).toContain('crypto_conversion_records_infrastructure_reference_check');
  expect(migration).toContain('crypto_conversion_records_evidence_reference_check');
});

test('crypto-path events require matching conversion lifecycle records', () => {
  expect(migration).toMatch(/NEW\.to_state = 'CRYPTO_CONVERSION_INITIATED'[\s\S]*?status = 'INITIATED'/);
  expect(migration).toMatch(/NEW\.to_state = 'CRYPTO_CONVERSION_COMPLETED'[\s\S]*?status = 'COMPLETED'/);
  expect(migration).toMatch(/NEW\.to_state = 'FIAT_CLEARED'[\s\S]*?workflow_state = 'CRYPTO_CONVERSION_COMPLETED'[\s\S]*?status = 'COMPLETED'/);
  expect(migration).toContain('fiat_amount > 0');
  expect(migration).toContain('completed_by IS NOT NULL');
  expect(migration).toContain('completed_at IS NOT NULL');
  expect(migration).toMatch(/workflow_state = 'INVESTOR_FUNDING_RECEIVED'[\s\S]*?NEW\.to_state IN \('CRYPTO_CONVERSION_INITIATED', 'FIAT_CLEARED'\)/);
});

test('conversion workflow ownership is immutable before and after completion', () => {
  expect(migration).toContain('CREATE OR REPLACE FUNCTION protect_crypto_conversion_lifecycle()');
  expect(migration).toContain('NEW.workflow_id IS DISTINCT FROM OLD.workflow_id');
  expect(migration).toContain('Crypto conversion workflow ownership is immutable');
  expect(migration).toContain('BEFORE UPDATE ON crypto_conversion_records');
  expect(migration).toContain('crypto_conversion_records_protect_lifecycle');
});

test('each workflow has zero or one authoritative conversion record', () => {
  expect(migration).toContain('crypto_conversion_records_workflow_unique');
  expect(migration).toMatch(/CONSTRAINT crypto_conversion_records_workflow_unique\s+UNIQUE \(workflow_id\)/);
  expect(migration).toContain('workflow_id                   BIGINT NOT NULL REFERENCES financial_workflows(id)');
  expect(migration).not.toMatch(/financial_workflows[\s\S]*?crypto_conversion_record_id\s+BIGINT\s+NOT NULL/);
});

test('conversion uniqueness rejects every duplicate lifecycle-row combination', () => {
  const duplicateCombinations = [
    ['INITIATED', 'INITIATED'],
    ['COMPLETED', 'COMPLETED'],
    ['INITIATED', 'COMPLETED'],
    ['COMPLETED', 'INITIATED'],
  ];
  expect(duplicateCombinations).toHaveLength(4);
  for (const [existingStatus, duplicateStatus] of duplicateCombinations) {
    expect(existingStatus).toMatch(/^(INITIATED|COMPLETED)$/);
    expect(duplicateStatus).toMatch(/^(INITIATED|COMPLETED)$/);
    expect(migration).toMatch(/UNIQUE \(workflow_id\)/);
  }
});

test('different workflows retain independent conversion and idempotency uniqueness', () => {
  expect(migration).toContain('workflow_id                   BIGINT NOT NULL REFERENCES financial_workflows(id)');
  expect(migration).toContain('idempotency_key               TEXT NOT NULL UNIQUE');
  expect(migration).toContain('crypto_conversion_records_idempotency_check');
});

test('one initiated row progresses in place to completion without a second record', () => {
  expect(migration).toContain("IF OLD.status = 'COMPLETED' AND NEW IS DISTINCT FROM OLD THEN");
  expect(migration).not.toMatch(/INSERT INTO crypto_conversion_records/i);
  expect(migration).toMatch(/status = 'COMPLETED'[\s\S]*?fiat_currency IS NOT NULL[\s\S]*?fiat_amount > 0/);
});

test('a completed conversion cannot revert or clear its completion identity', () => {
  expect(migration).toContain("IF OLD.status = 'COMPLETED' AND NEW IS DISTINCT FROM OLD THEN");
  expect(migration).toContain('Completed crypto conversion records are immutable');
  expect(migration).toContain("status IN ('INITIATED', 'COMPLETED', 'FAILED', 'CANCELLED')");
});

test.each([
  ['workflow ownership', 'workflow_id'],
  ['legal entity', 'legal_entity'],
  ['jurisdiction', 'jurisdiction_code'],
  ['conversion layer', 'conversion_layer'],
  ['crypto account scope', 'crypto_account_scope'],
  ['fiat recipient scope', 'fiat_recipient_scope'],
  ['fiat currency', 'fiat_currency'],
  ['fiat amount', 'fiat_amount'],
  ['completion actor', 'completed_by'],
  ['completion timestamp', 'completed_at'],
])('completed conversion protects %s (%s)', (_label, field) => {
  expect(migration).toContain(field);
  expect(migration).toContain("OLD.status = 'COMPLETED'");
  expect(migration).toContain('NEW IS DISTINCT FROM OLD');
});

test('an initiated conversion may still progress through the valid completion flow', () => {
  expect(migration).toMatch(/status = 'COMPLETED'[\s\S]*?fiat_currency IS NOT NULL[\s\S]*?fiat_amount > 0[\s\S]*?completed_by IS NOT NULL[\s\S]*?completed_at IS NOT NULL/);
  expect(migration).not.toMatch(/OLD\.status = 'INITIATED'[\s\S]*?RAISE EXCEPTION 'Completed crypto conversion records are immutable'/);
});

test('fiat transfer records require currency, amount, payment evidence, and dual control', () => {
  expect(migration).toContain("CHECK (currency_type = 'FIAT')");
  expect(migration).toContain("CHECK (currency ~ '^[A-Z]{3}$')");
  expect(migration).toContain('CHECK (amount > 0)');
  expect(migration).toContain('bank_payment_reference        TEXT NOT NULL');
  expect(migration).toContain('supporting_evidence_reference TEXT NOT NULL');
  expect(migration).toContain('operator_fiat_transfers_payment_reference_check');
  expect(migration).toContain('operator_fiat_transfers_evidence_reference_check');
  expect(migration).toContain('CHECK (initiated_by <> authorized_by)');
});

test('idempotency is enforced for workflows, conversions, transfers, and state events', () => {
  const uniqueIdempotencyFields = migration.match(/idempotency_key\s+TEXT NOT NULL UNIQUE/g) || [];
  expect(uniqueIdempotencyFields).toHaveLength(4);
  expect(migration).toContain('financial_workflows_idempotency_key_check');
  expect(migration).toContain('crypto_conversion_records_idempotency_check');
  expect(migration).toContain('operator_fiat_transfers_idempotency_check');
  expect(migration).toContain('financial_state_events_idempotency_check');
});

test('financial-state history is immutable', () => {
  expect(migration).toContain('CREATE OR REPLACE FUNCTION reject_financial_state_event_mutation()');
  expect(migration).toContain('Financial state history is immutable');
  expect(migration).toContain('BEFORE UPDATE ON financial_state_events');
  expect(migration).toContain('BEFORE DELETE ON financial_state_events');
});

test('on-chain references are supplementary and cannot be an authoritative evidence source', () => {
  expect(migration).toContain('supplementary_onchain_reference TEXT');
  expect(migration).not.toMatch(/evidence_authority\s+IN\s*\([^)]*ONCHAIN/is);
  expect(migration).not.toMatch(/authority\s+IN\s*\([^)]*ONCHAIN/is);
  expect(migration).not.toMatch(/blockchain_reference\s+TEXT NOT NULL/i);
});

test('repeat-run guards cover tables, indexes, functions, and triggers', () => {
  expect((migration.match(/CREATE TABLE IF NOT EXISTS/g) || [])).toHaveLength(7);
  expect(migration).toContain('CREATE UNIQUE INDEX IF NOT EXISTS');
  expect(migration).toContain('CONSTRAINT crypto_conversion_records_workflow_unique');
  expect(migration).toContain('CREATE OR REPLACE FUNCTION validate_financial_state_event()');
  expect(migration).toContain('CREATE OR REPLACE FUNCTION protect_financial_workflow_projection()');
  expect(migration).toContain('CREATE OR REPLACE FUNCTION protect_crypto_conversion_lifecycle()');
  expect(migration).toContain("WHERE tgname = 'crypto_conversion_records_protect_lifecycle'");
  expect(migration).toContain("WHERE tgname = 'financial_workflows_protect_projection'");
  expect(migration).toContain("WHERE tgname = 'financial_state_events_validate_insert'");
  expect(migration).toContain("WHERE tgname = 'financial_state_events_reject_update'");
  expect(migration).toContain("WHERE tgname = 'financial_state_events_reject_delete'");
});
