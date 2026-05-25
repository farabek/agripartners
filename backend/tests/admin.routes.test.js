process.env.API_KEY = 'test-secret';
process.env.NEAR_ADMIN_ACCOUNT = 'agripartners.testnet';

jest.mock('../src/services/dealService');
jest.mock('../src/services/nearService');

const request = require('supertest');
const express = require('express');
const { requireApiKey } = require('../src/middleware/auth');
const adminRouter = require('../src/routes/admin');
const dealService = require('../src/services/dealService');
const nearService = require('../src/services/nearService');

const app = express();
app.use(express.json());
app.use('/api/admin', requireApiKey, adminRouter);

const mockDeal = { id: 1, contract_address: 'ap1.agripartners.testnet', deal_type: 'fidlot', investment_amount: '10000000000000000000000000' };

beforeEach(() => {
  dealService.getDealById.mockResolvedValue(mockDeal);
  dealService.createDeal.mockResolvedValue(mockDeal);
  dealService.addEvent.mockResolvedValue(undefined);
  nearService.deployContract.mockResolvedValue({ contractId: 'ap1.agripartners.testnet', txHash: 'tx1' });
  nearService.startCycle.mockResolvedValue({ txHash: 'tx2' });
  nearService.reportCycle.mockResolvedValue({ txHash: 'tx3' });
  nearService.getContractStatus.mockResolvedValue({ status: 'CycleActive', current_cycle: 1 });
});

test('POST /api/admin/deals without API key returns 401', async () => {
  const res = await request(app).post('/api/admin/deals').send({});
  expect(res.status).toBe(401);
});

test('POST /api/admin/deals with valid key deploys contract and saves to DB', async () => {
  const res = await request(app)
    .post('/api/admin/deals')
    .set('X-API-Key', 'test-secret')
    .send({
      deal_type: 'fidlot',
      farmer: 'farmer.testnet',
      investor: 'investor.testnet',
      investment_amount: '50000000000000000000000000',
      total_cycles: 7,
      cycle_duration_days: 150,
      capital_return_near: '20400000000000000000000000'
    });
  expect(res.status).toBe(201);
  expect(nearService.deployContract).toHaveBeenCalled();
  expect(dealService.createDeal).toHaveBeenCalled();
  expect(dealService.addEvent).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'deployed' }));
});

test('POST /api/admin/deals returns 400 when required fields missing', async () => {
  const res = await request(app)
    .post('/api/admin/deals')
    .set('X-API-Key', 'test-secret')
    .send({ deal_type: 'fidlot' });
  expect(res.status).toBe(400);
});

test('POST /api/admin/deals/:id/start-cycle calls startCycle and records event', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/start-cycle')
    .set('X-API-Key', 'test-secret');
  expect(res.status).toBe(200);
  expect(nearService.startCycle).toHaveBeenCalledWith('ap1.agripartners.testnet');
  expect(dealService.addEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_type: 'cycle_started', tx_hash: 'tx2' })
  );
});

test('POST /api/admin/deals/:id/report-cycle calls reportCycle and records events', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/report-cycle')
    .set('X-API-Key', 'test-secret')
    .send({ profit_near: '5000000000000000000000000', losses_near: '0' });
  expect(res.status).toBe(200);
  expect(nearService.reportCycle).toHaveBeenCalledWith(
    'ap1.agripartners.testnet',
    '5000000000000000000000000',
    '0'
  );
  expect(dealService.addEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_type: 'cycle_reported' })
  );
});

test('POST /api/admin/deals/:id/report-cycle without profit_near returns 400', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/report-cycle')
    .set('X-API-Key', 'test-secret')
    .send({});
  expect(res.status).toBe(400);
});

test('POST /api/admin/deals/:id/fund calls fundContract and records event', async () => {
  nearService.fundContract = jest.fn().mockResolvedValue({ txHash: 'tx4' });
  const res = await request(app)
    .post('/api/admin/deals/1/fund')
    .set('X-API-Key', 'test-secret');
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.tx_hash).toBe('tx4');
  expect(nearService.fundContract).toHaveBeenCalledWith(
    'ap1.agripartners.testnet',
    '10000000000000000000000000'
  );
  expect(dealService.addEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_type: 'funded', tx_hash: 'tx4' })
  );
});

test('POST /api/admin/deals/:id/fund returns 404 when deal not found', async () => {
  dealService.getDealById.mockResolvedValueOnce(null);
  const res = await request(app)
    .post('/api/admin/deals/999/fund')
    .set('X-API-Key', 'test-secret');
  expect(res.status).toBe(404);
});
