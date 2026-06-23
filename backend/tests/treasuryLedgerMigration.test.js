const fs = require('fs');
const path = require('path');

const migrationPath = path.join(
  __dirname,
  '..',
  'src',
  'db',
  'migrations',
  '013_treasury_ledger_foundation.sql'
);
const migration = fs.readFileSync(migrationPath, 'utf8');
const idempotencyMigrationPath = path.join(
  __dirname,
  '..',
  'src',
  'db',
  'migrations',
  '014_treasury_transaction_idempotency.sql'
);
const idempotencyMigration = fs.readFileSync(idempotencyMigrationPath, 'utf8');

test('treasury ledger migration creates additive foundation tables', () => {
  expect(migration).toContain('CREATE TABLE IF NOT EXISTS treasury_accounts');
  expect(migration).toContain('CREATE TABLE IF NOT EXISTS treasury_transactions');
  expect(migration).toContain('CREATE TABLE IF NOT EXISTS treasury_ledger_entries');
  expect(migration).not.toMatch(/DROP\s+(COLUMN|TABLE)/i);
  expect(migration).not.toMatch(/RENAME\s+(COLUMN|TO)/i);
});

test('treasury accounts migration constrains account catalog', () => {
  expect(migration).toContain('account_code TEXT NOT NULL UNIQUE');
  expect(migration).toContain("account_type IN ('asset', 'liability', 'revenue', 'expense', 'adjustment')");
  expect(migration).toContain("currency     TEXT NOT NULL DEFAULT 'NEAR'");
});

test('treasury ledger migration constrains entries and foreign keys', () => {
  expect(migration).toContain('transaction_id   INTEGER NOT NULL REFERENCES treasury_transactions(id)');
  expect(migration).toContain('account_code     TEXT NOT NULL REFERENCES treasury_accounts(account_code)');
  expect(migration).toContain("direction IN ('debit', 'credit')");
  expect(migration).toContain('amount::NUMERIC > 0');
  expect(migration).toContain("currency         TEXT NOT NULL DEFAULT 'NEAR'");
});

test('treasury ledger migration seeds initial logical accounts', () => {
  for (const accountCode of [
    'PLATFORM_TREASURY_CASH',
    'INVESTOR_LIABILITY',
    'RESERVED_INVESTMENT_CAPITAL',
    'ACTIVE_DEAL_CAPITAL',
    'FARMER_FUNDING_DISBURSED',
    'RECORDED_OFFCHAIN_RETURNS',
    'INVESTOR_PAYABLE_RETURNS',
    'PLATFORM_FEE_REVENUE',
    'TREASURY_SUSPENSE',
    'LOSS_ADJUSTMENT',
  ]) {
    expect(migration).toContain(accountCode);
  }
  expect(migration).toContain('ON CONFLICT (account_code) DO NOTHING');
});

test('treasury idempotency migration adds source reference fields additively', () => {
  expect(idempotencyMigration).toContain('ALTER TABLE treasury_transactions');
  expect(idempotencyMigration).toContain('ADD COLUMN IF NOT EXISTS source_type TEXT');
  expect(idempotencyMigration).toContain('ADD COLUMN IF NOT EXISTS source_id TEXT');
  expect(idempotencyMigration).toContain('ADD COLUMN IF NOT EXISTS idempotency_key TEXT');
  expect(idempotencyMigration).not.toMatch(/DROP\s+(COLUMN|TABLE)/i);
  expect(idempotencyMigration).not.toMatch(/RENAME\s+(COLUMN|TO)/i);
});

test('treasury idempotency migration constrains duplicate non-null keys', () => {
  expect(idempotencyMigration).toContain('treasury_transactions_idempotency_key_nonempty_check');
  expect(idempotencyMigration).toContain('idempotency_key IS NULL OR BTRIM(idempotency_key) <>');
  expect(idempotencyMigration).toContain('CREATE UNIQUE INDEX IF NOT EXISTS treasury_transactions_idempotency_key_unique');
  expect(idempotencyMigration).toContain('ON treasury_transactions (idempotency_key)');
  expect(idempotencyMigration).toContain('WHERE idempotency_key IS NOT NULL');
});
