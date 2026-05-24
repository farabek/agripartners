process.env.DB_PATH = ':memory:';
const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents } = require('../src/services/dealService');

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

test('getAllDeals returns empty array initially', () => {
  expect(getAllDeals()).toEqual([]);
});

test('createDeal inserts and returns deal with id', () => {
  const deal = createDeal(sampleDeal);
  expect(deal).toHaveProperty('id');
  expect(deal.contract_address).toBe('ap123.agripartners.testnet');
  expect(deal.deal_type).toBe('fidlot');
});

test('getDealById returns correct deal', () => {
  const deal = createDeal({ ...sampleDeal, contract_address: 'ap456.agripartners.testnet' });
  expect(getDealById(deal.id)).toMatchObject({ id: deal.id });
});

test('getDealById returns null for missing id', () => {
  expect(getDealById(9999)).toBeNull();
});

test('getAllDeals returns inserted deals', () => {
  expect(getAllDeals().length).toBeGreaterThan(0);
});

test('addEvent and getDealEvents work correctly', () => {
  const deal = createDeal({ ...sampleDeal, contract_address: 'ap789.agripartners.testnet' });
  addEvent({ deal_id: deal.id, event_type: 'deployed', tx_hash: 'abc123' });
  const events = getDealEvents(deal.id);
  expect(events).toHaveLength(1);
  expect(events[0].event_type).toBe('deployed');
  expect(events[0].tx_hash).toBe('abc123');
});
