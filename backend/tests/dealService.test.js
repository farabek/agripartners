const pool = require('../src/db/index');
jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents } =
  require('../src/services/dealService');

const sampleDeal = {
  contract_address: 'ap123.agripartners.testnet',
  deal_type: 'fidlot',
  farmer: 'farmer.testnet',
  investor: 'investor.testnet',
  admin: 'agripartners.testnet',
  platform: 'agripartners.testnet',
  investment_amount: '50000000000000000000000000',
  farmer_split_pct: 60,
  investor_split_pct: 40,
  escrow_pct: 44,
  performance_fee_pct: 20,
  cycle_duration_days: 150,
  total_cycles: 7,
  capital_return_near: '20400000000000000000000000'
};

beforeEach(() => jest.clearAllMocks());

test('getAllDeals calls pool.query and returns rows', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getAllDeals();
  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM deals ORDER BY created_at DESC'
  );
  expect(deals).toHaveLength(1);
  expect(deals[0].id).toBe(1);
});

test('getDealById returns row when found', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deal = await getDealById(1);
  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM deals WHERE id = $1',
    [1]
  );
  expect(deal.id).toBe(1);
});

test('getDealById returns null when not found', async () => {
  pool.query.mockResolvedValue({ rows: [] });
  const deal = await getDealById(9999);
  expect(deal).toBeNull();
});

test('createDeal inserts and returns created row', async () => {
  const created = { id: 1, ...sampleDeal };
  pool.query.mockResolvedValue({ rows: [created] });
  const deal = await createDeal(sampleDeal);
  const [sql] = pool.query.mock.calls[0];
  expect(sql).toContain('INSERT INTO deals');
  expect(sql).toContain('RETURNING *');
  expect(deal.id).toBe(1);
  expect(deal.contract_address).toBe(sampleDeal.contract_address);
});

test('addEvent inserts event row', async () => {
  pool.query.mockResolvedValue({ rows: [] });
  await addEvent({ deal_id: 1, event_type: 'deployed', tx_hash: 'abc123' });
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('INSERT INTO events');
  expect(params).toContain(1);
  expect(params).toContain('deployed');
  expect(params).toContain('abc123');
});

test('getDealEvents returns events for deal', async () => {
  const mockEvents = [{ id: 1, deal_id: 1, event_type: 'deployed', tx_hash: 'abc' }];
  pool.query.mockResolvedValue({ rows: mockEvents });
  const events = await getDealEvents(1);
  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM events WHERE deal_id = $1 ORDER BY created_at ASC',
    [1]
  );
  expect(events).toHaveLength(1);
});
