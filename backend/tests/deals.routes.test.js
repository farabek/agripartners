jest.mock('../src/services/dealService');
jest.mock('../src/services/nearService');

const request = require('supertest');
const express = require('express');
const dealsRouter = require('../src/routes/deals');
const dealService = require('../src/services/dealService');
const nearService = require('../src/services/nearService');

const app = express();
app.use(express.json());
app.use('/api/deals', dealsRouter);

const mockDeal = { id: 1, contract_address: 'ap1.agripartners.testnet', deal_type: 'fidlot' };

beforeEach(() => {
  dealService.getAllDeals.mockResolvedValue([mockDeal]);
  dealService.getDealById.mockResolvedValue(mockDeal);
  dealService.getDealEvents.mockResolvedValue([]);
  nearService.getContractStatus.mockResolvedValue({ status: 'Funded', current_cycle: 0 });
  nearService.getContractBalances.mockResolvedValue({ farmer: '0', investor: '0', platform: '0', escrow: '0' });
});

test('GET /api/deals returns all deals', async () => {
  const res = await request(app).get('/api/deals');
  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
});

test('GET /api/deals/:id returns deal', async () => {
  const res = await request(app).get('/api/deals/1');
  expect(res.status).toBe(200);
  expect(res.body.id).toBe(1);
});

test('GET /api/deals/:id returns 404 for missing deal', async () => {
  dealService.getDealById.mockResolvedValue(null);
  const res = await request(app).get('/api/deals/999');
  expect(res.status).toBe(404);
});

test('GET /api/deals/:id/status returns blockchain status', async () => {
  const res = await request(app).get('/api/deals/1/status');
  expect(res.status).toBe(200);
  expect(res.body.status).toBe('Funded');
});

test('GET /api/deals/:id/balances returns four balance fields', async () => {
  const res = await request(app).get('/api/deals/1/balances');
  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({ farmer: '0', investor: '0', platform: '0', escrow: '0' });
});

test('GET /api/deals/:id/events returns array', async () => {
  const res = await request(app).get('/api/deals/1/events');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
