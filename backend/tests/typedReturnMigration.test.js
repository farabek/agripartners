const fs = require('fs');
const path = require('path');

const migrationPath = path.join(
  __dirname,
  '..',
  'src',
  'db',
  'migrations',
  '011_typed_return_ledger.sql'
);
const migration = fs.readFileSync(migrationPath, 'utf8');

test('typed return migration is additive and adds every Alpha-safe field', () => {
  expect(migration).toContain('ALTER TABLE deal_returns');
  expect(migration).not.toMatch(/DROP\s+(COLUMN|TABLE)/i);
  expect(migration).not.toMatch(/RENAME\s+(COLUMN|TO)/i);

  for (const field of [
    'entry_type',
    'payment_status',
    'currency',
    'recorded_by',
    'transaction_hash',
    'reconciled_at',
    'reconciled_by',
    'reconciliation_metadata',
  ]) {
    expect(migration).toMatch(new RegExp(`ADD COLUMN ${field}\\b`));
  }
});

test('typed return migration preserves legacy type and applies safe defaults', () => {
  expect(migration).toMatch(/ADD COLUMN entry_type TEXT[,;]/);
  expect(migration).not.toMatch(/entry_type TEXT NOT NULL/);
  expect(migration).toMatch(/payment_status TEXT NOT NULL DEFAULT 'recorded'/);
  expect(migration).toMatch(/currency TEXT NOT NULL DEFAULT 'NEAR'/);
  expect(migration).not.toMatch(/UPDATE\s+deal_returns\s+SET\s+entry_type/i);
});

test('typed return migration constrains types, statuses, currency, and positive amounts', () => {
  expect(migration).toContain("entry_type IN ('principal', 'profit', 'fee', 'correction')");
  expect(migration).toContain("payment_status IN ('recorded', 'approved', 'paid', 'reconciled')");
  expect(migration).toContain("CHECK (currency = 'NEAR')");
  expect(migration).toContain('amount_near::NUMERIC > 0');
  expect(migration).toContain('payment_status = \'reconciled\'');
  expect(migration).toContain('reconciled_at IS NOT NULL');
  expect(migration).toContain('reconciled_by IS NOT NULL');
});
