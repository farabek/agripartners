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
  getFarmerReports,
  getDealReturns,
  createDealReturn,
  getDealReturnSummary,
  createFarmerReport,
  confirmFarmerFunding,
  submitFarmerCycleReport,
  getDealsByUser,
} =
  require('../src/services/dealService');

const sampleDeal = {
  contract_address: 'ap123.agripartners.testnet',
  deal_type: 'fidlot',
  title: 'Fidlot cycle',
  description: 'Demo livestock financing deal',
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
      }],
    })
    .mockResolvedValueOnce({
      rows: [{
        id: 7,
        deal_id: 1,
        cycle_id: 1,
        farmer_wallet: 'farmer.testnet',
        title: 'Cycle 1 report',
        description: 'Purchased livestock',
        amount_used: '1.32',
        evidence_url: 'https://example.com',
        submitted_at: '2026-06-08T02:00:00Z',
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

test('getFarmerReports returns reports for deal ordered by cycle', async () => {
  const reports = [{ id: 1, deal_id: 1, cycle_id: 1, title: 'Report' }];
  pool.query.mockResolvedValue({ rows: reports });

  const result = await getFarmerReports(1);

  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM reports WHERE deal_id = $1 ORDER BY cycle_id ASC, created_at ASC',
    [1]
  );
  expect(result).toBe(reports);
});

test('getDealReturns returns repayment history ordered by creation time', async () => {
  const returns = [{ id: 1, deal_id: 1, amount_near: '0.05', note: 'First repayment' }];
  pool.query.mockResolvedValue({ rows: returns });

  const result = await getDealReturns(1);

  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM deal_returns WHERE deal_id = $1 ORDER BY created_at ASC',
    [1]
  );
  expect(result).toBe(returns);
});

test('createDealReturn inserts normalized repayment amount', async () => {
  pool.query.mockResolvedValue({
    rows: [{ id: 1, deal_id: 1, amount_near: '0.05', note: 'First repayment' }],
  });

  const result = await createDealReturn(1, { amount_near: '0.050', note: 'First repayment' });

  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('INSERT INTO deal_returns');
  expect(params).toEqual([1, '0.05', 'First repayment']);
  expect(result.amount_near).toBe('0.05');
});

test('getDealReturnSummary marks partial return when returned amount is below expected return', async () => {
  pool.query.mockResolvedValue({
    rows: [{ id: 1, deal_id: 1, amount_near: '0.05' }],
  });

  const summary = await getDealReturnSummary({
    id: 1,
    investment_amount: '100000000000000000000000',
  });

  expect(summary).toEqual({
    amount: '0.10',
    invested_amount: '0.10',
    projected_roi_pct: 20,
    expected_return: '0.12',
    returned_amount: '0.05',
    outstanding_amount: '0.07',
    return_status: 'partial',
    roi_percent: 20,
  });
});

test('getDealReturnSummary uses deal-level projected ROI when present', async () => {
  pool.query.mockResolvedValue({
    rows: [{ id: 1, deal_id: 1, amount_near: '0.05' }],
  });

  const summary = await getDealReturnSummary({
    id: 1,
    investment_amount: '100000000000000000000000',
    projected_roi_pct: '12.5',
  });

  expect(summary).toEqual({
    amount: '0.10',
    invested_amount: '0.10',
    projected_roi_pct: 12.5,
    expected_return: '0.1125',
    returned_amount: '0.05',
    outstanding_amount: '0.0625',
    return_status: 'partial',
    roi_percent: 12.5,
  });
});

test('getDealReturnSummary marks no_returns when returned amount is zero', async () => {
  pool.query.mockResolvedValue({ rows: [] });

  await expect(getDealReturnSummary({
    id: 1,
    investment_amount: '100000000000000000000000',
    projected_roi_pct: '20',
  })).resolves.toEqual(expect.objectContaining({
    returned_amount: '0.00',
    return_status: 'no_returns',
  }));
});

test('getDealReturnSummary marks completed when returned amount equals expected return', async () => {
  pool.query.mockResolvedValue({
    rows: [{ id: 1, deal_id: 1, amount_near: '0.12' }],
  });

  await expect(getDealReturnSummary({
    id: 1,
    investment_amount: '100000000000000000000000',
    projected_roi_pct: '20',
  })).resolves.toEqual(expect.objectContaining({
    expected_return: '0.12',
    returned_amount: '0.12',
    outstanding_amount: '0.00',
    return_status: 'completed',
  }));
});

test('getDealReturnSummary marks completed when returned amount exceeds expected return', async () => {
  pool.query.mockResolvedValue({
    rows: [{ id: 1, deal_id: 1, amount_near: '0.12' }],
  });

  await expect(getDealReturnSummary({
    id: 1,
    investment_amount: '10000000000000000000000',
    projected_roi_pct: '20',
  })).resolves.toEqual(expect.objectContaining({
    expected_return: '0.012',
    returned_amount: '0.12',
    outstanding_amount: '0.00',
    return_status: 'completed',
  }));
});

test('getDealReturnSummary floors outstanding at zero for overpaid returns', async () => {
  pool.query.mockResolvedValue({
    rows: [{ id: 1, deal_id: 1, amount_near: '0.50' }],
  });

  const summary = await getDealReturnSummary({
    id: 1,
    investment_amount: '100000000000000000000000',
    projected_roi_pct: '20',
  });

  expect(summary.outstanding_amount).toBe('0.00');
  expect(summary.return_status).toBe('completed');
});

test('getDealReturnSummary handles zero or missing values safely', async () => {
  pool.query.mockResolvedValue({ rows: [] });

  await expect(getDealReturnSummary({ id: 1 })).resolves.toEqual(expect.objectContaining({
    amount: '0.00',
    invested_amount: '0.00',
    expected_return: '0.00',
    returned_amount: '0.00',
    outstanding_amount: '0.00',
    return_status: 'no_returns',
    projected_roi_pct: 20,
    roi_percent: 20,
  }));
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

test('createFarmerReport inserts report row', async () => {
  pool.query.mockResolvedValue({
    rows: [{
      id: 1,
      deal_id: 1,
      cycle_id: 1,
      farmer_wallet: 'farmer.testnet',
      title: 'Cycle report',
      description: 'Purchased feed',
      amount_used: '1.32',
      evidence_url: null,
    }],
  });
  const report = await createFarmerReport(1, 1, 'farmer.testnet', {
    title: 'Cycle report',
    description: 'Purchased feed',
    amountUsed: '1.32',
  });
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('INSERT INTO reports');
  expect(sql).toContain('farmer_wallet');
  expect(params).toEqual([1, 1, 'farmer.testnet', 'Cycle report', 'Purchased feed', '1.32', null]);
  expect(report.title).toBe('Cycle report');
});

test('submitFarmerCycleReport creates report and syncs cycle update', async () => {
  pool.query
    .mockResolvedValueOnce({
      rows: [{
        id: 1,
        deal_id: 1,
        cycle_id: 1,
        farmer_wallet: 'farmer.testnet',
        title: 'Cycle report',
        description: 'Purchased feed',
        amount_used: '1.32',
        evidence_url: null,
      }],
    })
    .mockResolvedValueOnce({
      rows: [{ deal_id: 1, cycle_num: 1, report_title: 'Cycle report' }],
    });

  const report = await submitFarmerCycleReport(1, 1, 'farmer.testnet', {
    title: 'Cycle report',
    description: 'Purchased feed',
    amountUsed: '1.32',
  });

  expect(pool.query).toHaveBeenCalledTimes(2);
  expect(pool.query.mock.calls[0][0]).toContain('INSERT INTO reports');
  expect(pool.query.mock.calls[1][0]).toContain('INSERT INTO farmer_cycle_updates');
  expect(report.title).toBe('Cycle report');
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

test.each([
  [null, 'farmer'],
  [null, 'investor'],
  ['auditor.testnet', 'auditor'],
  [null, undefined],
])('getDealsByUser rejects unsupported access context without querying (%s, %s)', async (nearAccount, role) => {
  await expect(getDealsByUser(nearAccount, role)).rejects.toThrow('Unsupported deal access context');
  expect(pool.query).not.toHaveBeenCalled();
});
