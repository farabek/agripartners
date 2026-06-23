const fs = require('fs');
const path = require('path');

const migrationPath = path.join(
  __dirname,
  '..',
  'src',
  'db',
  'migrations',
  '012_return_status_events.sql'
);
const migration = fs.readFileSync(migrationPath, 'utf8');

test('return status events migration creates an additive append-only table', () => {
  expect(migration).toContain('CREATE TABLE IF NOT EXISTS return_status_events');
  expect(migration).not.toMatch(/DROP\s+(COLUMN|TABLE)/i);
  expect(migration).not.toMatch(/RENAME\s+(COLUMN|TO)/i);
  expect(migration).not.toMatch(/UPDATE\s+return_status_events/i);

  for (const field of [
    'id',
    'return_id',
    'from_status',
    'to_status',
    'changed_by',
    'changed_at',
    'note',
    'evidence_metadata',
  ]) {
    expect(migration).toMatch(new RegExp(`${field}\\b`));
  }
});

test('return status events migration links events to return ledger rows', () => {
  expect(migration).toContain('return_id         INTEGER NOT NULL REFERENCES deal_returns(id)');
});

test('return status events migration allows initial null from_status and requires to_status', () => {
  expect(migration).toMatch(/from_status\s+TEXT/);
  expect(migration).not.toMatch(/from_status\s+TEXT NOT NULL/);
  expect(migration).toMatch(/to_status\s+TEXT NOT NULL/);
  expect(migration).toMatch(/changed_at\s+TIMESTAMPTZ NOT NULL DEFAULT NOW\(\)/);
});

test('return status events migration constrains current payment statuses and uses JSONB evidence metadata', () => {
  expect(migration).toContain("from_status IS NULL OR from_status IN ('recorded', 'approved', 'paid', 'reconciled')");
  expect(migration).toContain("to_status IN ('recorded', 'approved', 'paid', 'reconciled')");
  expect(migration).toMatch(/evidence_metadata JSONB/);
});
