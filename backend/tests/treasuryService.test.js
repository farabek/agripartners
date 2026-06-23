const pool = require('../src/db/index');
jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const {
  listTreasuryAccounts,
  createTreasuryTransaction,
  getTreasuryTransaction,
  listTreasuryLedgerEntries,
  validateBalancedEntries,
} = require('../src/services/treasuryService');

const accountRows = [
  { account_code: 'PLATFORM_TREASURY_CASH' },
  { account_code: 'INVESTOR_LIABILITY' },
  { account_code: 'RESERVED_INVESTMENT_CAPITAL' },
  { account_code: 'ACTIVE_DEAL_CAPITAL' },
];

function balancedEntries() {
  return [
    { account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '10' },
    { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '10' },
  ];
}

function transactionInput(overrides = {}) {
  return {
    transaction_type: 'investor_deposit',
    currency: 'NEAR',
    description: 'Investor deposit',
    related_deal_id: 7,
    related_investor: 'investor.testnet',
    created_by: 'admin.testnet',
    metadata: { source: 'manual' },
    entries: balancedEntries(),
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  delete pool.connect;
});

test('listTreasuryAccounts returns active catalog ordered by account code', async () => {
  pool.query.mockResolvedValue({ rows: accountRows });

  const accounts = await listTreasuryAccounts();

  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM treasury_accounts ORDER BY account_code ASC'
  );
  expect(accounts).toBe(accountRows);
});

test('validateBalancedEntries accepts balanced debit and credit entries', () => {
  const result = validateBalancedEntries([
    { account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '10', currency: 'NEAR' },
    { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '10.00', currency: 'NEAR' },
  ], 'NEAR', new Set(['PLATFORM_TREASURY_CASH', 'INVESTOR_LIABILITY']));

  expect(result).toEqual([
    expect.objectContaining({ direction: 'debit', amount: '10', currency: 'NEAR' }),
    expect.objectContaining({ direction: 'credit', amount: '10.00', currency: 'NEAR' }),
  ]);
});

test('validateBalancedEntries rejects one-sided transaction', () => {
  expect(() => validateBalancedEntries([
    { account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '10' },
  ])).toThrow('treasury transaction requires at least two ledger entries');
});

test('validateBalancedEntries rejects unbalanced transaction', () => {
  expect(() => validateBalancedEntries([
    { account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '10' },
    { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '9.99' },
  ])).toThrow('treasury transaction must balance for NEAR');
});

test('validateBalancedEntries rejects mixed currency entries', () => {
  expect(() => validateBalancedEntries([
    { account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '10', currency: 'NEAR' },
    { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '10', currency: 'USD' },
  ], 'NEAR')).toThrow('ledger entry currency must match transaction currency');
});

test('validateBalancedEntries rejects invalid account and direction', () => {
  expect(() => validateBalancedEntries([
    { account_code: 'MISSING', direction: 'debit', amount: '10' },
    { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '10' },
  ], 'NEAR', new Set(['INVESTOR_LIABILITY']))).toThrow('Invalid treasury account_code: MISSING');

  expect(() => validateBalancedEntries([
    { account_code: 'PLATFORM_TREASURY_CASH', direction: 'increase', amount: '10' },
    { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '10' },
  ])).toThrow('direction must be debit or credit');
});

test('validateBalancedEntries rejects zero and negative amounts', () => {
  expect(() => validateBalancedEntries([
    { account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '0' },
    { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '0' },
  ])).toThrow('amount must be positive');

  expect(() => validateBalancedEntries([
    { account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '-1' },
    { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '-1' },
  ])).toThrow('amount must be a positive decimal');
});

test('createTreasuryTransaction inserts balanced transaction and ledger entries', async () => {
  pool.query
    .mockResolvedValueOnce({ rows: accountRows })
    .mockResolvedValueOnce({
      rows: [{
        id: 1,
        transaction_type: 'investor_deposit',
        currency: 'NEAR',
        related_deal_id: 7,
        related_investor: 'investor.testnet',
        related_farmer: null,
      }],
    })
    .mockResolvedValueOnce({
      rows: [{ id: 11, transaction_id: 1, account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '10' }],
    })
    .mockResolvedValueOnce({
      rows: [{ id: 12, transaction_id: 1, account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '10' }],
    });

  const result = await createTreasuryTransaction({
    transaction_type: 'investor_deposit',
    currency: 'NEAR',
    description: 'Investor deposit',
    related_deal_id: 7,
    related_investor: 'investor.testnet',
    created_by: 'admin.testnet',
    metadata: { source: 'manual' },
    entries: [
      { account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '10' },
      { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '10' },
    ],
  });

  expect(pool.query.mock.calls[0]).toEqual([
    'SELECT account_code FROM treasury_accounts WHERE is_active = TRUE',
  ]);
  expect(pool.query.mock.calls[1][0]).toContain('INSERT INTO treasury_transactions');
  expect(pool.query.mock.calls[1][1]).toEqual([
    'investor_deposit',
    'NEAR',
    'Investor deposit',
    7,
    'investor.testnet',
    null,
    null,
    { source: 'manual' },
    'admin.testnet',
    null,
    null,
    null,
  ]);
  expect(pool.query.mock.calls[2][0]).toContain('INSERT INTO treasury_ledger_entries');
  expect(pool.query.mock.calls[3][0]).toContain('INSERT INTO treasury_ledger_entries');
  expect(result.entries).toHaveLength(2);
});

test('createTreasuryTransaction stores source references and idempotency key', async () => {
  pool.query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: accountRows })
    .mockResolvedValueOnce({
      rows: [{
        id: 1,
        transaction_type: 'investor_deposit',
        source_type: 'deal_return',
        source_id: '145',
        idempotency_key: 'deal_return:145',
      }],
    })
    .mockResolvedValueOnce({
      rows: [{ id: 11, transaction_id: 1, account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '10' }],
    })
    .mockResolvedValueOnce({
      rows: [{ id: 12, transaction_id: 1, account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '10' }],
    });

  const result = await createTreasuryTransaction(transactionInput({
    source_type: 'deal_return',
    source_id: 145,
    idempotency_key: 'deal_return:145',
  }));

  expect(pool.query.mock.calls[0]).toEqual([
    'SELECT * FROM treasury_transactions WHERE idempotency_key = $1',
    ['deal_return:145'],
  ]);
  expect(pool.query.mock.calls[2][1]).toEqual([
    'investor_deposit',
    'NEAR',
    'Investor deposit',
    7,
    'investor.testnet',
    null,
    null,
    { source: 'manual' },
    'admin.testnet',
    'deal_return',
    '145',
    'deal_return:145',
  ]);
  expect(result.source_type).toBe('deal_return');
  expect(result.source_id).toBe('145');
});

test('createTreasuryTransaction returns existing transaction for repeated idempotency key', async () => {
  pool.query
    .mockResolvedValueOnce({
      rows: [{
        id: 42,
        transaction_type: 'recorded_return',
        idempotency_key: 'deal_return:145',
      }],
    })
    .mockResolvedValueOnce({
      rows: [
        { id: 101, transaction_id: 42, account_code: 'RECORDED_OFFCHAIN_RETURNS' },
        { id: 102, transaction_id: 42, account_code: 'TREASURY_SUSPENSE' },
      ],
    });

  const result = await createTreasuryTransaction(transactionInput({
    idempotency_key: 'deal_return:145',
  }));

  expect(result.id).toBe(42);
  expect(result.entries).toHaveLength(2);
  expect(pool.query).toHaveBeenCalledTimes(2);
  expect(pool.query.mock.calls.some((call) => call[0].includes('INSERT INTO treasury_transactions'))).toBe(false);
  expect(pool.query.mock.calls.some((call) => call[0].includes('INSERT INTO treasury_ledger_entries'))).toBe(false);
});

test('createTreasuryTransaction without idempotency key still creates separate transactions', async () => {
  pool.query
    .mockResolvedValueOnce({ rows: accountRows })
    .mockResolvedValueOnce({ rows: [{ id: 1, transaction_type: 'manual' }] })
    .mockResolvedValueOnce({ rows: [{ id: 11, transaction_id: 1 }] })
    .mockResolvedValueOnce({ rows: [{ id: 12, transaction_id: 1 }] })
    .mockResolvedValueOnce({ rows: accountRows })
    .mockResolvedValueOnce({ rows: [{ id: 2, transaction_type: 'manual' }] })
    .mockResolvedValueOnce({ rows: [{ id: 21, transaction_id: 2 }] })
    .mockResolvedValueOnce({ rows: [{ id: 22, transaction_id: 2 }] });

  await createTreasuryTransaction(transactionInput({ transaction_type: 'manual' }));
  await createTreasuryTransaction(transactionInput({ transaction_type: 'manual' }));

  expect(pool.query.mock.calls.filter((call) => call[0].includes('INSERT INTO treasury_transactions'))).toHaveLength(2);
  expect(pool.query.mock.calls.filter((call) => call[0].includes('WHERE idempotency_key'))).toHaveLength(0);
});

test('createTreasuryTransaction rejects empty idempotency key', async () => {
  await expect(createTreasuryTransaction(transactionInput({
    idempotency_key: '   ',
  }))).rejects.toThrow('idempotency_key must be non-empty when supplied');
  expect(pool.query).not.toHaveBeenCalled();
});

test('createTreasuryTransaction rejects invalid account before insert', async () => {
  pool.query.mockResolvedValueOnce({ rows: accountRows });

  await expect(createTreasuryTransaction({
    transaction_type: 'bad_account',
    entries: [
      { account_code: 'MISSING', direction: 'debit', amount: '10' },
      { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '10' },
    ],
  })).rejects.toThrow('Invalid treasury account_code: MISSING');
  expect(pool.query).toHaveBeenCalledTimes(1);
});

test('createTreasuryTransaction rolls back when ledger entry creation fails', async () => {
  const client = {
    query: jest.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: accountRows })
      .mockResolvedValueOnce({ rows: [{ id: 1, idempotency_key: 'deal_return:145' }] })
      .mockRejectedValueOnce(new Error('ledger insert failed'))
      .mockResolvedValueOnce({ rows: [] }),
    release: jest.fn(),
  };
  pool.connect = jest.fn().mockResolvedValue(client);

  await expect(createTreasuryTransaction(transactionInput({
    idempotency_key: 'deal_return:145',
  }))).rejects.toThrow('ledger insert failed');

  expect(client.query.mock.calls[0]).toEqual(['BEGIN']);
  expect(client.query.mock.calls.some((call) => call[0] === 'ROLLBACK')).toBe(true);
  expect(client.query.mock.calls.some((call) => call[0] === 'COMMIT')).toBe(false);
  expect(client.release).toHaveBeenCalled();
});

test('createTreasuryTransaction with idempotency key rejects invalid data before partial insert', async () => {
  const client = {
    query: jest.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: accountRows })
      .mockResolvedValueOnce({ rows: [] }),
    release: jest.fn(),
  };
  pool.connect = jest.fn().mockResolvedValue(client);

  await expect(createTreasuryTransaction(transactionInput({
    idempotency_key: 'bad:account',
    entries: [
      { account_code: 'MISSING', direction: 'debit', amount: '10' },
      { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '10' },
    ],
  }))).rejects.toThrow('Invalid treasury account_code: MISSING');

  expect(client.query.mock.calls.some((call) => call[0].includes('INSERT INTO treasury_transactions'))).toBe(false);
  expect(client.query.mock.calls.some((call) => call[0] === 'ROLLBACK')).toBe(true);
  expect(client.release).toHaveBeenCalled();
});

test('createTreasuryTransaction with idempotency key rejects unbalanced entries before partial insert', async () => {
  const client = {
    query: jest.fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: accountRows })
      .mockResolvedValueOnce({ rows: [] }),
    release: jest.fn(),
  };
  pool.connect = jest.fn().mockResolvedValue(client);

  await expect(createTreasuryTransaction(transactionInput({
    idempotency_key: 'bad:unbalanced',
    entries: [
      { account_code: 'PLATFORM_TREASURY_CASH', direction: 'debit', amount: '10' },
      { account_code: 'INVESTOR_LIABILITY', direction: 'credit', amount: '9' },
    ],
  }))).rejects.toThrow('treasury transaction must balance for NEAR');

  expect(client.query.mock.calls.some((call) => call[0].includes('INSERT INTO treasury_transactions'))).toBe(false);
  expect(client.query.mock.calls.some((call) => call[0] === 'ROLLBACK')).toBe(true);
  expect(client.release).toHaveBeenCalled();
});

test('getTreasuryTransaction retrieves transaction with entries', async () => {
  pool.query
    .mockResolvedValueOnce({ rows: [{ id: 1, transaction_type: 'investor_deposit' }] })
    .mockResolvedValueOnce({ rows: [{ id: 11, transaction_id: 1 }, { id: 12, transaction_id: 1 }] });

  const result = await getTreasuryTransaction(1);

  expect(pool.query.mock.calls[0]).toEqual([
    'SELECT * FROM treasury_transactions WHERE id = $1',
    [1],
  ]);
  expect(pool.query.mock.calls[1]).toEqual([
    'SELECT * FROM treasury_ledger_entries WHERE transaction_id = $1 ORDER BY id ASC',
    [1],
  ]);
  expect(result.entries).toHaveLength(2);
});

test('getTreasuryTransaction returns null when missing', async () => {
  pool.query.mockResolvedValue({ rows: [] });

  await expect(getTreasuryTransaction(99)).resolves.toBeNull();
  expect(pool.query).toHaveBeenCalledTimes(1);
});

test('listTreasuryLedgerEntries supports basic filters', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, account_code: 'PLATFORM_TREASURY_CASH' }] });

  const result = await listTreasuryLedgerEntries({
    transaction_id: 1,
    account_code: 'PLATFORM_TREASURY_CASH',
    currency: 'near',
    related_deal_id: 7,
    related_investor: 'investor.testnet',
  });

  expect(pool.query).toHaveBeenCalledWith(
    `SELECT * FROM treasury_ledger_entries WHERE transaction_id = $1 AND account_code = $2 AND currency = $3 AND related_deal_id = $4 AND related_investor = $5 ORDER BY created_at ASC, id ASC`,
    [1, 'PLATFORM_TREASURY_CASH', 'NEAR', 7, 'investor.testnet']
  );
  expect(result).toHaveLength(1);
});
