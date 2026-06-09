process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/services/dealService');
jest.mock('../src/services/nearService');

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const farmerRouter = require('../src/routes/farmer');
const { requireWalletAuth } = require('../src/middleware/walletAuth');
const dealService = require('../src/services/dealService');
const nearService = require('../src/services/nearService');

const app = express();
app.use(express.json());
app.use('/api/farmer', requireWalletAuth, farmerRouter);

const farmerToken = jwt.sign(
  {
    type: 'wallet-auth-poc',
    account_id: 'farmer.testnet',
    public_key: 'ed25519:FARMER',
    network: 'testnet',
  },
  'test-jwt-secret'
);

const investorToken = jwt.sign(
  {
    type: 'wallet-auth-poc',
    account_id: 'investor.testnet',
    public_key: 'ed25519:INVESTOR',
    network: 'testnet',
  },
  'test-jwt-secret'
);

const farmerDeal = {
  id: 3,
  farmer: 'farmer.testnet',
  investor: 'farab.testnet',
  investment_amount: '1320000000000000000000000',
  contract_address: 'ap3.farab.testnet',
  deal_type: 'fidlot',
  total_cycles: 7,
  cycle_duration_days: 150,
};

const cycle = {
  id: 1,
  status: 'funding_sent',
  fundingReceived: false,
  reportStatus: 'not_submitted',
};

beforeEach(() => {
  jest.clearAllMocks();
  dealService.getFarmerDeals.mockResolvedValue([farmerDeal]);
  dealService.getFarmerDealById.mockResolvedValue(farmerDeal);
  dealService.getDealById.mockResolvedValue(farmerDeal);
  dealService.getFarmerDealCycles.mockResolvedValue([cycle]);
  dealService.confirmFarmerFunding.mockResolvedValue({ deal_id: 3, cycle_num: 1 });
  dealService.submitFarmerCycleReport.mockResolvedValue({
    id: 9,
    title: 'Cycle 1 sheep purchase report',
    description: 'Purchased initial livestock and feed.',
    amount_used: '1.32',
    evidence_url: 'https://example.com/evidence',
    farmer_wallet: 'farmer.testnet',
    submitted_at: '2026-06-08T10:00:00Z',
  });
  dealService.addEvent.mockResolvedValue();
  nearService.getContractStatus.mockResolvedValue({ status: 'Funded', current_cycle: 1 });
});

test('GET /api/farmer/deals requires wallet auth', async () => {
  const res = await request(app).get('/api/farmer/deals');

  expect(res.status).toBe(401);
  expect(dealService.getFarmerDeals).not.toHaveBeenCalled();
});

test('GET /api/farmer/deals returns only current farmer deals', async () => {
  const res = await request(app)
    .get('/api/farmer/deals')
    .set('Authorization', `Bearer ${farmerToken}`);

  expect(res.status).toBe(200);
  expect(dealService.getFarmerDeals).toHaveBeenCalledWith('farmer.testnet');
  expect(res.body).toMatchObject({
    ok: true,
    farmer: 'farmer.testnet',
    deals: [expect.objectContaining({ id: 3, farmer: 'farmer.testnet', activeCycleId: 1 })],
  });
});

test('GET /api/farmer/deals/:dealId returns owned deal', async () => {
  const res = await request(app)
    .get('/api/farmer/deals/3')
    .set('Authorization', `Bearer ${farmerToken}`);

  expect(res.status).toBe(200);
  expect(dealService.getDealById).toHaveBeenCalledWith('3');
  expect(res.body.deal.id).toBe(3);
});

test('GET /api/farmer/deals/:dealId returns 403 for another farmer deal', async () => {
  const res = await request(app)
    .get('/api/farmer/deals/3')
    .set('Authorization', `Bearer ${investorToken}`);

  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Only deal farmer can access this deal');
});

test('GET /api/farmer/deals/:dealId/cycles returns cycles for owned deal', async () => {
  const res = await request(app)
    .get('/api/farmer/deals/3/cycles')
    .set('Authorization', `Bearer ${farmerToken}`);

  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({
    ok: true,
    dealId: 3,
    cycles: [expect.objectContaining({ id: 1, status: 'funding_sent' })],
  });
});

test('POST /api/farmer/deals/:dealId/confirm-funding confirms own cycle', async () => {
  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/1/confirm-funding')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({});

  expect(res.status).toBe(200);
  expect(dealService.confirmFarmerFunding).toHaveBeenCalledWith(3, 1);
  expect(dealService.addEvent).toHaveBeenCalledWith(expect.objectContaining({
    deal_id: 3,
    event_type: 'farmer_funding_confirmed',
    cycle_num: 1,
  }));
  expect(res.body.status).toBe('funding_received_confirmed');
});

test('POST /api/farmer/deals/:dealId/confirm-funding rejects non-farmer', async () => {
  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/1/confirm-funding')
    .set('Authorization', `Bearer ${investorToken}`)
    .send({});

  expect(res.status).toBe(403);
  expect(dealService.confirmFarmerFunding).not.toHaveBeenCalled();
});

test('POST /api/farmer/deals/:dealId/confirm-funding cannot confirm twice', async () => {
  dealService.getFarmerDealCycles.mockResolvedValue([{ ...cycle, fundingReceived: true }]);

  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/1/confirm-funding')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({});

  expect(res.status).toBe(409);
  expect(res.body.error).toBe('Funding already confirmed');
  expect(dealService.confirmFarmerFunding).not.toHaveBeenCalled();
});

test('POST /api/farmer/deals/:dealId/confirm-funding rejects before funding sent', async () => {
  dealService.getFarmerDealCycles.mockResolvedValue([{ ...cycle, status: 'pending' }]);

  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/1/confirm-funding')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({});

  expect(res.status).toBe(409);
  expect(res.body.error).toBe('Funding has not been sent for this cycle');
});

test('POST /api/farmer/deals/:dealId/cycles/:cycleId/report submits own report', async () => {
  dealService.getFarmerDealCycles.mockResolvedValue([{ ...cycle, fundingReceived: true }]);
  const payload = {
    report_title: 'Cycle 1 sheep purchase report',
    report_body: 'Purchased initial livestock and feed.',
  };

  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/1/report')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send(payload);

  expect(res.status).toBe(200);
  expect(dealService.submitFarmerCycleReport).toHaveBeenCalledWith(3, 1, 'farmer.testnet', {
    title: payload.report_title,
    description: payload.report_body,
    amountUsed: undefined,
    evidenceUrl: undefined,
  });
  expect(dealService.addEvent).toHaveBeenCalledWith(expect.objectContaining({
    deal_id: 3,
    event_type: 'farmer_cycle_report_submitted',
    cycle_num: 1,
  }));
  expect(res.body.report).toMatchObject({
    status: 'submitted',
    title: payload.report_title,
    report_title: payload.report_title,
    description: payload.report_body,
    report_body: payload.report_body,
    farmer_account: 'farmer.testnet',
    deal_id: 3,
    cycle_number: 1,
  });
});

test('POST /api/farmer/deals/:dealId/cycles/:cycleId/report allows optional title', async () => {
  dealService.getFarmerDealCycles.mockResolvedValue([{ ...cycle, fundingReceived: true }]);

  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/1/report')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({ report_body: 'Body only MVP report' });

  expect(res.status).toBe(200);
  expect(dealService.submitFarmerCycleReport).toHaveBeenCalledWith(3, 1, 'farmer.testnet', expect.objectContaining({
    title: 'Cycle 1 report',
    description: 'Body only MVP report',
  }));
});

test('POST /api/farmer/deals/:dealId/cycles/:cycleId/report rejects before funding confirmation', async () => {
  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/1/report')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({ report_title: 'Report', report_body: 'Body' });

  expect(res.status).toBe(409);
  expect(res.body.error).toBe('Funding must be confirmed before submitting report');
  expect(dealService.submitFarmerCycleReport).not.toHaveBeenCalled();
});

test('POST /api/farmer/deals/:dealId/cycles/:cycleId/report rejects duplicate report', async () => {
  dealService.getFarmerDealCycles.mockResolvedValue([{
    ...cycle,
    fundingReceived: true,
    reportStatus: 'submitted',
    report: { title: 'Existing report' },
  }]);

  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/1/report')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({ report_title: 'Report', report_body: 'Body' });

  expect(res.status).toBe(409);
  expect(res.body.error).toBe('Report already submitted for this cycle');
  expect(dealService.submitFarmerCycleReport).not.toHaveBeenCalled();
});

test('POST /api/farmer/deals/:dealId/cycles/:cycleId/report rejects non-farmer', async () => {
  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/1/report')
    .set('Authorization', `Bearer ${investorToken}`)
    .send({ report_title: 'Report', report_body: 'Body' });

  expect(res.status).toBe(403);
  expect(dealService.submitFarmerCycleReport).not.toHaveBeenCalled();
});

test('POST /api/farmer/deals/:dealId/cycles/:cycleId/report rejects missing cycle', async () => {
  dealService.getFarmerDealCycles.mockResolvedValue([]);

  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/99/report')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({ report_title: 'Report', report_body: 'Body' });

  expect(res.status).toBe(404);
  expect(res.body.error).toBe('Cycle not found');
});

test('POST /api/farmer/deals/:dealId/cycles/:cycleId/report requires report_body', async () => {
  const res = await request(app)
    .post('/api/farmer/deals/3/cycles/1/report')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({ report_title: 'Report' });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('report_body is required');
});
