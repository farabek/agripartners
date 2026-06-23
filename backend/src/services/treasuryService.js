const pool = require('../db/index');

const TREASURY_DIRECTIONS = new Set(['debit', 'credit']);
const DECIMAL_SCALE = 24n;
const DECIMAL_FACTOR = 10n ** DECIMAL_SCALE;

function normalizeCurrency(value) {
  const currency = String(value ?? 'NEAR').trim().toUpperCase();
  if (!currency) throw new Error('currency is required');
  return currency;
}

function normalizeDirection(value) {
  const direction = String(value ?? '').trim().toLowerCase();
  if (!TREASURY_DIRECTIONS.has(direction)) {
    throw new Error('direction must be debit or credit');
  }
  return direction;
}

function normalizeAmount(value) {
  const raw = String(value ?? '').trim();
  if (!/^[0-9]+(\.[0-9]{1,24})?$/.test(raw)) {
    throw new Error('amount must be a positive decimal');
  }
  const [whole, fraction = ''] = raw.split('.');
  const units = BigInt(whole) * DECIMAL_FACTOR + BigInt(fraction.padEnd(Number(DECIMAL_SCALE), '0'));
  if (units <= 0n) throw new Error('amount must be positive');
  return { amount: raw, units };
}

function normalizeOptionalText(value) {
  const normalized = String(value ?? '').trim();
  return normalized || null;
}

function normalizeLedgerEntry(entry, transactionCurrency, validAccountCodes = null) {
  const accountCode = String(entry?.account_code ?? '').trim();
  if (!accountCode) throw new Error('account_code is required');
  if (validAccountCodes && !validAccountCodes.has(accountCode)) {
    throw new Error(`Invalid treasury account_code: ${accountCode}`);
  }
  const currency = normalizeCurrency(entry.currency ?? transactionCurrency);
  if (currency !== transactionCurrency) {
    throw new Error('ledger entry currency must match transaction currency');
  }
  const { amount, units } = normalizeAmount(entry.amount);
  return {
    account_code: accountCode,
    direction: normalizeDirection(entry.direction),
    amount,
    amountUnits: units,
    currency,
    related_deal_id: entry.related_deal_id ?? null,
    related_investor: normalizeOptionalText(entry.related_investor),
    related_farmer: normalizeOptionalText(entry.related_farmer),
  };
}

async function listTreasuryAccounts() {
  const { rows } = await pool.query(
    'SELECT * FROM treasury_accounts ORDER BY account_code ASC'
  );
  return rows;
}

function validateBalancedEntries(entries, transactionCurrency = 'NEAR', validAccountCodes = null) {
  if (!Array.isArray(entries) || entries.length < 2) {
    throw new Error('treasury transaction requires at least two ledger entries');
  }

  const currency = normalizeCurrency(transactionCurrency);
  const totals = new Map();
  const normalizedEntries = entries.map((entry) => normalizeLedgerEntry(entry, currency, validAccountCodes));

  for (const entry of normalizedEntries) {
    const current = totals.get(entry.currency) || { debit: 0n, credit: 0n };
    current[entry.direction] += entry.amountUnits;
    totals.set(entry.currency, current);
  }

  for (const [entryCurrency, total] of totals.entries()) {
    if (total.debit !== total.credit) {
      throw new Error(`treasury transaction must balance for ${entryCurrency}`);
    }
  }

  return normalizedEntries;
}

async function getActiveAccountCodes(queryable = pool) {
  const { rows } = await queryable.query(
    'SELECT account_code FROM treasury_accounts WHERE is_active = TRUE'
  );
  return new Set(rows.map((row) => row.account_code));
}

async function getTreasuryTransactionById(queryable, id) {
  const { rows } = await queryable.query(
    'SELECT * FROM treasury_transactions WHERE id = $1',
    [id]
  );
  const transaction = rows[0];
  if (!transaction) return null;
  const { rows: entries } = await queryable.query(
    'SELECT * FROM treasury_ledger_entries WHERE transaction_id = $1 ORDER BY id ASC',
    [id]
  );
  return { ...transaction, entries };
}

async function getTreasuryTransactionByIdempotencyKey(queryable, idempotencyKey) {
  const { rows } = await queryable.query(
    'SELECT * FROM treasury_transactions WHERE idempotency_key = $1',
    [idempotencyKey]
  );
  const transaction = rows[0];
  if (!transaction) return null;
  const { rows: entries } = await queryable.query(
    'SELECT * FROM treasury_ledger_entries WHERE transaction_id = $1 ORDER BY id ASC',
    [transaction.id]
  );
  return { ...transaction, entries };
}

function normalizeIdempotencyKey(value) {
  if (value === undefined || value === null) return null;
  const normalized = String(value).trim();
  if (!normalized) throw new Error('idempotency_key must be non-empty when supplied');
  return normalized;
}

async function insertTreasuryTransaction(queryable, input, normalizedEntries, currency) {
  const transactionType = normalizeOptionalText(input.transaction_type);
  if (!transactionType) throw new Error('transaction_type is required');
  const { rows } = await queryable.query(
    `INSERT INTO treasury_transactions (
       transaction_type, currency, description, related_deal_id, related_investor,
       related_farmer, blockchain_reference, metadata, created_by,
       source_type, source_id, idempotency_key
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      transactionType,
      currency,
      normalizeOptionalText(input.description),
      input.related_deal_id ?? null,
      normalizeOptionalText(input.related_investor),
      normalizeOptionalText(input.related_farmer),
      normalizeOptionalText(input.blockchain_reference),
      input.metadata ?? null,
      normalizeOptionalText(input.created_by),
      normalizeOptionalText(input.source_type),
      normalizeOptionalText(input.source_id),
      input.idempotency_key,
    ]
  );
  const transaction = rows[0];

  const ledgerEntries = [];
  for (const entry of normalizedEntries) {
    const result = await queryable.query(
      `INSERT INTO treasury_ledger_entries (
         transaction_id, account_code, direction, amount, currency,
         related_deal_id, related_investor, related_farmer
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        transaction.id,
        entry.account_code,
        entry.direction,
        entry.amount,
        entry.currency,
        entry.related_deal_id ?? transaction.related_deal_id,
        entry.related_investor ?? transaction.related_investor,
        entry.related_farmer ?? transaction.related_farmer,
      ]
    );
    ledgerEntries.push(result.rows[0]);
  }

  return { ...transaction, entries: ledgerEntries };
}

async function createTreasuryTransaction(input, queryableOverride = null) {
  const transactionInput = input || {};
  const currency = normalizeCurrency(transactionInput.currency);
  const idempotencyKey = normalizeIdempotencyKey(transactionInput.idempotency_key);
  const normalizedTransactionInput = {
    ...transactionInput,
    idempotency_key: idempotencyKey,
  };

  async function runCreate(queryable) {
    if (idempotencyKey) {
      const existing = await getTreasuryTransactionByIdempotencyKey(queryable, idempotencyKey);
      if (existing) return existing;
    }
    const validAccountCodes = await getActiveAccountCodes(queryable);
    const normalizedEntries = validateBalancedEntries(normalizedTransactionInput.entries, currency, validAccountCodes);
    return insertTreasuryTransaction(queryable, normalizedTransactionInput, normalizedEntries, currency);
  }

  if (queryableOverride) {
    return runCreate(queryableOverride);
  }

  if (typeof pool.connect !== 'function') {
    return runCreate(pool);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const transaction = await runCreate(client);
    await client.query('COMMIT');
    return transaction;
  } catch (err) {
    await client.query('ROLLBACK');
    if (idempotencyKey && err?.code === '23505') {
      const existing = await getTreasuryTransactionByIdempotencyKey(pool, idempotencyKey);
      if (existing) return existing;
    }
    throw err;
  } finally {
    client.release();
  }
}

async function getTreasuryTransaction(id) {
  return getTreasuryTransactionById(pool, id);
}

function addLedgerFilter(clauses, params, field, value) {
  if (value === null || value === undefined || value === '') return;
  params.push(value);
  clauses.push(`${field} = $${params.length}`);
}

async function listTreasuryLedgerEntries(filters = {}) {
  const clauses = [];
  const params = [];
  addLedgerFilter(clauses, params, 'transaction_id', filters.transaction_id);
  addLedgerFilter(clauses, params, 'account_code', filters.account_code);
  addLedgerFilter(clauses, params, 'currency', filters.currency ? normalizeCurrency(filters.currency) : null);
  addLedgerFilter(clauses, params, 'related_deal_id', filters.related_deal_id);
  addLedgerFilter(clauses, params, 'related_investor', filters.related_investor);
  addLedgerFilter(clauses, params, 'related_farmer', filters.related_farmer);

  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT * FROM treasury_ledger_entries${where} ORDER BY created_at ASC, id ASC`,
    params
  );
  return rows;
}

module.exports = {
  listTreasuryAccounts,
  createTreasuryTransaction,
  getTreasuryTransaction,
  listTreasuryLedgerEntries,
  validateBalancedEntries,
};
