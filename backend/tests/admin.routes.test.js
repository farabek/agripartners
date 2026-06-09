process.env.JWT_SECRET = 'test-jwt-secret';
process.env.API_KEY = 'test-api-key';
process.env.NEAR_ADMIN_ACCOUNT = 'agripartners.testnet';
process.env.NEAR_ADMIN_PRIVATE_KEY = 'ed25519:test';

jest.mock('../src/services/dealService');
jest.mock('../src/services/nearService');
jest.mock('../src/services/profileService');

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { requireAdminAccess } = require('../src/middleware/adminAuth');
const adminRouter = require('../src/routes/admin');
const dealService = require('../src/services/dealService');
const nearService = require('../src/services/nearService');
const profileService = require('../src/services/profileService');

const app = express();
app.use(express.json());
app.use('/api/admin', requireAdminAccess, adminRouter);

const adminToken = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, 'test-jwt-secret');
const farmerToken = jwt.sign({ id: 2, username: 'farmer1', role: 'farmer' }, 'test-jwt-secret');
const adminWalletToken = jwt.sign({
  type: 'wallet-auth-poc',
  network: 'testnet',
  account_id: 'farab.testnet',
  public_key: 'ed25519:test',
}, 'test-jwt-secret');
const investorWalletToken = jwt.sign({
  type: 'wallet-auth-poc',
  network: 'testnet',
  account_id: 'investor.testnet',
  public_key: 'ed25519:test',
}, 'test-jwt-secret');

const mockDeal = {
  id: 1,
  contract_address: 'ap1.agripartners.testnet',
  deal_type: 'fidlot',
  title: 'Fidlot cycle',
  description: 'Demo livestock financing deal',
  farmer: 'farmer-ap.testnet',
  investor: 'investor-ap.testnet',
  platform: 'platform-ap.testnet',
  investment_amount: '10000000000000000000000000'
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.NODE_ENV = 'test';
  delete process.env.NEAR_INVESTOR_SIGNER_ACCOUNT_ID;
  dealService.getDealById.mockResolvedValue(mockDeal);
  dealService.createDeal.mockResolvedValue(mockDeal);
  dealService.addEvent.mockResolvedValue(undefined);
  nearService.deployContract.mockResolvedValue({ contractId: 'ap1.agripartners.testnet', txHash: 'tx1' });
  nearService.startCycle.mockResolvedValue({ txHash: 'tx2' });
  nearService.reportCycle.mockResolvedValue({ txHash: 'tx3' });
  nearService.getContractStatus.mockResolvedValue({ status: 'CycleActive', current_cycle: 1 });
  nearService.fundContract = jest.fn().mockResolvedValue({ txHash: 'tx4' });
  nearService.withdrawContract = jest.fn().mockResolvedValue({ txHash: 'tx5' });
  nearService.fundContractAs = jest.fn().mockResolvedValue({ txHash: 'tx6' });
  nearService.withdrawContractAs = jest.fn().mockResolvedValue({ txHash: 'tx7' });
  profileService.getProfilesByRole.mockImplementation((role) => Promise.resolve([
    {
      walletAccountId: `${role}.testnet`,
      role,
      displayName: `${role} profile`,
    },
  ]));
});

test('POST /api/admin/deals without token returns 401', async () => {
  const res = await request(app).post('/api/admin/deals').send({});
  expect(res.status).toBe(401);
});

test('POST /api/admin/deals with farmer token returns 403', async () => {
  const res = await request(app)
    .post('/api/admin/deals')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({});
  expect(res.status).toBe(403);
});

test('POST /api/admin/deals with admin token deploys contract and saves to DB', async () => {
  const res = await request(app)
    .post('/api/admin/deals')
    .set('Authorization', `Bearer ${adminToken}`)
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
  expect(nearService.deployContract).toHaveBeenCalledWith(expect.objectContaining({
    investor: 'investor.testnet',
    investor_withdraw_signer: 'agripartners.testnet',
  }));
  expect(dealService.createDeal).toHaveBeenCalled();
  expect(dealService.addEvent).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'deployed' }));
  expect(res.body.deal_id).toBe(1);
  expect(res.body.status).toBe('deployed');
});

test('GET /api/admin/farmers returns farmer profiles', async () => {
  const res = await request(app)
    .get('/api/admin/farmers')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.status).toBe(200);
  expect(profileService.getProfilesByRole).toHaveBeenCalledWith('farmer');
  expect(res.body.farmers).toEqual([
    expect.objectContaining({ walletAccountId: 'farmer.testnet', role: 'farmer' }),
  ]);
});

test('GET /api/admin/farmers allows configured admin wallet outside production', async () => {
  const res = await request(app)
    .get('/api/admin/farmers')
    .set('Authorization', `Bearer ${adminWalletToken}`);

  expect(res.status).toBe(200);
  expect(profileService.getProfilesByRole).toHaveBeenCalledWith('farmer');
});

test('GET /api/admin/farmers rejects non-admin wallet token', async () => {
  const res = await request(app)
    .get('/api/admin/farmers')
    .set('Authorization', `Bearer ${investorWalletToken}`);

  expect(res.status).toBe(403);
  expect(profileService.getProfilesByRole).not.toHaveBeenCalled();
});

test('GET /api/admin/investors returns investor profiles', async () => {
  const res = await request(app)
    .get('/api/admin/investors')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.status).toBe(200);
  expect(profileService.getProfilesByRole).toHaveBeenCalledWith('investor');
  expect(res.body.investors).toEqual([
    expect.objectContaining({ walletAccountId: 'investor.testnet', role: 'investor' }),
  ]);
});

test('POST /api/admin/deals accepts admin portal payload', async () => {
  const res = await request(app)
    .post('/api/admin/deals')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      investor_wallet: 'investor.testnet',
      farmer_wallet: 'farmer.testnet',
      amount: '132',
      title: 'Greenhouse expansion',
      description: 'Seed capital for new greenhouse cycle',
    });

  expect(res.status).toBe(201);
  expect(nearService.deployContract).toHaveBeenCalledWith(expect.objectContaining({
    deal_type: 'Greenhouse expansion',
    farmer: 'farmer.testnet',
    investor: 'investor.testnet',
    investment_amount: '132000000000000000000000000',
    total_cycles: 1,
    cycle_duration_days: 150,
    investor_withdraw_signer: 'agripartners.testnet',
  }));
  expect(dealService.createDeal).toHaveBeenCalledWith(expect.objectContaining({
    deal_type: 'Greenhouse expansion',
    title: 'Greenhouse expansion',
    description: 'Seed capital for new greenhouse cycle',
    farmer: 'farmer.testnet',
    investor: 'investor.testnet',
    investment_amount: '132000000000000000000000000',
  }));
  expect(res.body).toEqual(expect.objectContaining({
    ok: true,
    deal_id: 1,
    contract_address: 'ap1.agripartners.testnet',
    status: 'deployed',
  }));
});

test('POST /api/admin/deals defaults investor withdraw signer to admin signer', async () => {
  const res = await request(app)
    .post('/api/admin/deals')
    .set('Authorization', `Bearer ${adminToken}`)
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
  expect(nearService.deployContract).toHaveBeenCalledWith(expect.objectContaining({
    investor_withdraw_signer: 'agripartners.testnet',
  }));
});

test('POST /api/admin/deals can use optional investor withdraw signer account', async () => {
  process.env.NEAR_INVESTOR_SIGNER_ACCOUNT_ID = 'investor-ap.testnet';

  const res = await request(app)
    .post('/api/admin/deals')
    .set('Authorization', `Bearer ${adminToken}`)
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
  expect(nearService.deployContract).toHaveBeenCalledWith(expect.objectContaining({
    investor_withdraw_signer: 'investor-ap.testnet',
  }));
});

test('POST /api/admin/deals returns 400 when required fields missing', async () => {
  const res = await request(app)
    .post('/api/admin/deals')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ deal_type: 'fidlot' });
  expect(res.status).toBe(400);
});

test('POST /api/admin/deals/:id/start-cycle calls startCycle and records event', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/start-cycle')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(nearService.startCycle).toHaveBeenCalledWith('ap1.agripartners.testnet');
  expect(dealService.addEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_type: 'cycle_started', tx_hash: 'tx2' })
  );
});

test('POST /api/admin/deals/:id/report-cycle calls reportCycle and records events', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/report-cycle')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ profit_near: '5000000000000000000000000', losses_near: '0' });
  expect(res.status).toBe(200);
  expect(nearService.reportCycle).toHaveBeenCalledWith('ap1.agripartners.testnet', '5000000000000000000000000', '0');
  expect(dealService.addEvent).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'cycle_reported' }));
});

test('POST /api/admin/deals/:id/report-cycle without profit_near returns 400', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/report-cycle')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({});
  expect(res.status).toBe(400);
});

test('POST /api/admin/deals/:id/fund calls fundContract and records event', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/fund')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(nearService.fundContract).toHaveBeenCalledWith('ap1.agripartners.testnet', '10000000000000000000000000');
  expect(dealService.addEvent).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'funded', tx_hash: 'tx4' }));
});

test('POST /api/admin/deals/:id/fund returns 404 when deal not found', async () => {
  dealService.getDealById.mockResolvedValueOnce(null);
  const res = await request(app)
    .post('/api/admin/deals/999/fund')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(404);
});

test('POST /api/admin/deals/:id/fund-as calls fundContractAs for deal investor outside production', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/fund-as')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ account_id: 'investor-ap.testnet' });
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ success: true, tx_hash: 'tx6' });
  expect(nearService.fundContractAs).toHaveBeenCalledWith(
    'investor-ap.testnet',
    'ap1.agripartners.testnet',
    '10000000000000000000000000'
  );
  expect(dealService.addEvent).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'funded', tx_hash: 'tx6' }));
});

test('POST /api/admin/deals/:id/fund-as rejects non-investor signer', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/fund-as')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ account_id: 'farmer-ap.testnet' });
  expect(res.status).toBe(400);
  expect(nearService.fundContractAs).not.toHaveBeenCalled();
});

test('POST /api/admin/deals/:id/fund-as is disabled in production', async () => {
  process.env.NODE_ENV = 'production';
  const res = await request(app)
    .post('/api/admin/deals/1/fund-as')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ account_id: 'investor-ap.testnet' });
  expect(res.status).toBe(403);
  expect(nearService.fundContractAs).not.toHaveBeenCalled();
});

test('POST /api/admin/deals/:id/withdraw calls withdrawContract and records event', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/withdraw')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ success: true, tx_hash: 'tx5' });
  expect(nearService.withdrawContract).toHaveBeenCalledWith('ap1.agripartners.testnet');
  expect(dealService.addEvent).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'withdrawn', tx_hash: 'tx5' }));
});

test('POST /api/admin/deals/:id/withdraw returns 404 when deal not found', async () => {
  dealService.getDealById.mockResolvedValueOnce(null);
  const res = await request(app)
    .post('/api/admin/deals/999/withdraw')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(404);
});

test('POST /api/admin/deals/:id/withdraw-as calls withdrawContractAs for deal party outside production', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/withdraw-as')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ account_id: 'farmer-ap.testnet' });
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ success: true, tx_hash: 'tx7' });
  expect(nearService.withdrawContractAs).toHaveBeenCalledWith(
    'farmer-ap.testnet',
    'ap1.agripartners.testnet'
  );
  expect(dealService.addEvent).toHaveBeenCalledWith(expect.objectContaining({ event_type: 'withdrawn', tx_hash: 'tx7' }));
});

test('POST /api/admin/deals/:id/withdraw-as rejects account outside deal parties', async () => {
  const res = await request(app)
    .post('/api/admin/deals/1/withdraw-as')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ account_id: 'stranger-ap.testnet' });
  expect(res.status).toBe(400);
  expect(nearService.withdrawContractAs).not.toHaveBeenCalled();
});

test('POST /api/admin/deals/:id/withdraw-as is disabled in production', async () => {
  process.env.NODE_ENV = 'production';
  const res = await request(app)
    .post('/api/admin/deals/1/withdraw-as')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ account_id: 'farmer-ap.testnet' });
  expect(res.status).toBe(403);
  expect(nearService.withdrawContractAs).not.toHaveBeenCalled();
});
