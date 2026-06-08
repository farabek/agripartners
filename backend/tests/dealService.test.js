const pool = require('../src/db/index');
jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const {
  getAllDeals,
  getDealById,
  getInvestorDeals,
  getInvestorDealById,
  getFarmerDeals,
  getFarmerDealById,
  createDeal,
  addEvent,
  getDealEvents,
  getFarmerDealCycles,
  confirmFarmerFunding,
  submitFarmerCycleReport,
  getDealsByUser,
} =
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

test('getInvestorDeals returns deals for exact investor account without fallback', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getInvestorDeals('investor.testnet');

  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM deals WHERE investor = $1 ORDER BY created_at DESC',
    ['investor.testnet']
  );
  expect(deals).toHaveLength(1);
});

test('getInvestorDealById returns deal by id and investor account', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deal = await getInvestorDealById('investor.testnet', 1);

  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM deals WHERE id = $1 AND investor = $2',
    [1, 'investor.testnet']
  );
  expect(deal.id).toBe(1);
});

test('getInvestorDealById returns null for missing or non-owned deal', async () => {
  pool.query.mockResolvedValue({ rows: [] });
  const deal = await getInvestorDealById('investor.testnet', 9999);
  expect(deal).toBeNull();
});

test('getFarmerDeals returns deals for exact farmer account', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getFarmerDeals('farmer.testnet');

  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM deals WHERE farmer = $1 ORDER BY created_at DESC',
    ['farmer.testnet']
  );
  expect(deals).toHaveLength(1);
});

test('getFarmerDealById returns deal by id and farmer account', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deal = await getFarmerDealById('farmer.testnet', 1);

  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM deals WHERE id = $1 AND farmer = $2',
    [1, 'farmer.testnet']
  );
  expect(deal.id).toBe(1);
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

test('getFarmerDealCycles combines cycle events and farmer updates', async () => {
  pool.query
    .mockResolvedValueOnce({
      rows: [
        { id: 1, deal_id: 1, event_type: 'cycle_started', cycle_num: 1 },
        { id: 2, deal_id: 1, event_type: 'cycle_reported', cycle_num: 1 },
      ],
    })
    .mockResolvedValueOnce({
      rows: [{
        deal_id: 1,
        cycle_num: 1,
        funding_received_at: '2026-06-08T01:00:00Z',
        report_title: 'Cycle 1 report',
        report_description: 'Purchased livestock',
        report_amount_used: '1.32',
        report_evidence_url: 'https://example.com',
        report_submitted_at: '2026-06-08T02:00:00Z',
      }],
    });

  const cycles = await getFarmerDealCycles(1);

  expect(cycles).toEqual([expect.objectContaining({
    id: 1,
    status: 'reported',
    fundingReceived: true,
    reportStatus: 'submitted',
  })]);
});

test('confirmFarmerFunding upserts confirmation timestamp', async () => {
  pool.query.mockResolvedValue({ rows: [{ deal_id: 1, cycle_num: 1, funding_received_at: 'now' }] });
  const update = await confirmFarmerFunding(1, 1);
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('INSERT INTO farmer_cycle_updates');
  expect(sql).toContain('ON CONFLICT');
  expect(params).toEqual([1, 1]);
  expect(update.cycle_num).toBe(1);
});

test('submitFarmerCycleReport upserts report fields', async () => {
  pool.query.mockResolvedValue({
    rows: [{
      deal_id: 1,
      cycle_num: 1,
      report_title: 'Cycle report',
      report_description: 'Purchased feed',
      report_amount_used: '1.32',
      report_evidence_url: null,
    }],
  });
  const update = await submitFarmerCycleReport(1, 1, {
    title: 'Cycle report',
    description: 'Purchased feed',
    amountUsed: '1.32',
  });
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('INSERT INTO farmer_cycle_updates');
  expect(sql).toContain('report_title');
  expect(params).toEqual([1, 1, 'Cycle report', 'Purchased feed', '1.32', null]);
  expect(update.report_title).toBe('Cycle report');
});

test('getDealsByUser returns farmer deals by near_account', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getDealsByUser('farmer.testnet', 'farmer');
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('WHERE farmer = $1');
  expect(params).toEqual(['farmer.testnet']);
  expect(deals).toHaveLength(1);
});

test('getDealsByUser returns investor deals by near_account', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getDealsByUser('investor.testnet', 'investor');
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('WHERE investor = $1');
  expect(params).toEqual(['investor.testnet']);
  expect(deals).toHaveLength(1);
});

test('getDealsByUser returns all deals for admin role', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getDealsByUser(null, 'admin');
  expect(pool.query).toHaveBeenCalledWith('SELECT * FROM deals ORDER BY created_at DESC');
  expect(deals).toHaveLength(1);
});

test('getDealsByUser returns all deals when near_account is not set', async () => {
  pool.query.mockResolvedValue({ rows: [] });
  await getDealsByUser(null, 'farmer');
  expect(pool.query).toHaveBeenCalledWith('SELECT * FROM deals ORDER BY created_at DESC');
});
