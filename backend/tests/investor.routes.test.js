process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/services/dealService');
jest.mock('../src/services/nearService');

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const investorRouter = require('../src/routes/investor');
const { requireWalletAuth } = require('../src/middleware/walletAuth');
const dealService = require('../src/services/dealService');
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

beforeEach(() => {
  jest.clearAllMocks();
  dealService.getDealsByUser.mockResolvedValue([investorDeal]);
  dealService.getDealById.mockResolvedValue(investorDeal);
  dealService.getDealEvents.mockResolvedValue([]);
  dealService.addEvent.mockResolvedValue();
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
