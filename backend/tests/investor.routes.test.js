process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/services/dealService');
jest.mock('../src/services/investorProfileService');
jest.mock('../src/services/nearService');

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const investorRouter = require('../src/routes/investor');
const { requireWalletAuth } = require('../src/middleware/walletAuth');
const dealService = require('../src/services/dealService');
const investorProfileService = require('../src/services/investorProfileService');
const nearService = require('../src/services/nearService');

const app = express();
app.use(express.json());
app.use('/api/investor', requireWalletAuth, investorRouter);

const walletToken = jwt.sign(
  {
    type: 'wallet-auth-poc',
    account_id: 'investor.testnet',
    public_key: 'ed25519:PUBLIC',
    network: 'testnet',
  },
  'test-jwt-secret'
);

const adminToken = jwt.sign(
  { id: 1, username: 'admin', role: 'admin' },
  'test-jwt-secret'
);

const investorDeal = {
  id: 1,
  investor: 'investor.testnet',
  contract_address: 'ap1.agripartners.testnet',
};
const investorProfile = {
  id: 1,
  account_id: 'investor.testnet',
  display_name: null,
  country: null,
  investor_type: null,
  risk_profile: null,
  kyc_status: 'not_started',
};

beforeEach(() => {
  jest.clearAllMocks();
  dealService.getDealsByUser.mockResolvedValue([investorDeal]);
  dealService.getDealById.mockResolvedValue(investorDeal);
  dealService.getDealEvents.mockResolvedValue([]);
  dealService.addEvent.mockResolvedValue();
  investorProfileService.getOrCreateInvestorProfile.mockResolvedValue(investorProfile);
  investorProfileService.updateInvestorProfile.mockResolvedValue({
    ...investorProfile,
    display_name: 'Investor One',
    investor_type: 'individual',
    risk_profile: 'balanced',
  });
  nearService.getContractStatus.mockResolvedValue({ status: 'Funded', current_cycle: 0 });
  nearService.getContractBalances.mockResolvedValue({ farmer: '0', investor: '0', platform: '0', escrow: '0' });
  nearService.withdrawContractAs.mockResolvedValue({ txHash: 'tx_withdraw123' });
});

test('GET /api/investor/deals requires wallet JWT', async () => {
  const res = await request(app)
    .get('/api/investor/deals')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.status).toBe(403);
});

test('GET /api/investor/profile requires wallet JWT', async () => {
  const res = await request(app)
    .get('/api/investor/profile')
    .set('Authorization', `Bearer ${adminToken}`);

  expect(res.status).toBe(403);
});

test('GET /api/investor/profile auto-creates profile for wallet account', async () => {
  const res = await request(app)
    .get('/api/investor/profile')
    .set('Authorization', `Bearer ${walletToken}`);

  expect(res.status).toBe(200);
  expect(investorProfileService.getOrCreateInvestorProfile)
    .toHaveBeenCalledWith('investor.testnet');
  expect(res.body.account_id).toBe('investor.testnet');
});

test('PUT /api/investor/profile updates editable fields for wallet account', async () => {
  const payload = {
    display_name: 'Investor One',
    country: 'Uzbekistan',
    investor_type: 'individual',
    risk_profile: 'balanced',
  };

  const res = await request(app)
    .put('/api/investor/profile')
    .set('Authorization', `Bearer ${walletToken}`)
    .send(payload);

  expect(res.status).toBe(200);
  expect(investorProfileService.updateInvestorProfile)
    .toHaveBeenCalledWith('investor.testnet', payload);
  expect(res.body.display_name).toBe('Investor One');
});

test('PUT /api/investor/profile rejects protected fields', async () => {
  investorProfileService.updateInvestorProfile.mockRejectedValue(new Error('kyc_status cannot be edited'));

  const res = await request(app)
    .put('/api/investor/profile')
    .set('Authorization', `Bearer ${walletToken}`)
    .send({ kyc_status: 'approved' });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('kyc_status cannot be edited');
});

test('GET /api/investor/deals returns deals for wallet account', async () => {
  const res = await request(app)
    .get('/api/investor/deals')
    .set('Authorization', `Bearer ${walletToken}`);

  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith('investor.testnet', 'investor');
  expect(res.body).toHaveLength(1);
});

test('GET /api/investor/deals/:id rejects deals for another investor wallet', async () => {
  dealService.getDealById.mockResolvedValue({
    ...investorDeal,
    investor: 'other.testnet',
  });

  const res = await request(app)
    .get('/api/investor/deals/1')
    .set('Authorization', `Bearer ${walletToken}`);

  expect(res.status).toBe(403);
});

test('GET /api/investor/deals/:id/status uses protected investor deal', async () => {
  const res = await request(app)
    .get('/api/investor/deals/1/status')
    .set('Authorization', `Bearer ${walletToken}`);

  expect(res.status).toBe(200);
  expect(nearService.getContractStatus).toHaveBeenCalledWith('ap1.agripartners.testnet');
});

test('POST /api/investor/deals/:id/withdraw uses wallet-protected investor signer', async () => {
  const res = await request(app)
    .post('/api/investor/deals/1/withdraw')
    .set('Authorization', `Bearer ${walletToken}`);

  expect(res.status).toBe(200);
  expect(nearService.withdrawContractAs).toHaveBeenCalledWith(
    'investor.testnet',
    'ap1.agripartners.testnet'
  );
  expect(dealService.addEvent).toHaveBeenCalledWith(expect.objectContaining({
    deal_id: 1,
    event_type: 'InvestorWithdraw',
    tx_hash: 'tx_withdraw123',
  }));
  expect(res.body.tx_hash).toBe('tx_withdraw123');
});
