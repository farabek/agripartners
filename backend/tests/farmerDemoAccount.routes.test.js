process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/services/dealService');
jest.mock('../src/services/nearService');
jest.mock('../src/services/investorProfileService');

const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const farmerRouter = require('../src/routes/farmer');
const investorRouter = require('../src/routes/investor');
const { requireWalletAuth } = require('../src/middleware/walletAuth');
const dealService = require('../src/services/dealService');
const nearService = require('../src/services/nearService');

const app = express();
app.use(express.json());
app.use('/api/farmer', requireWalletAuth, farmerRouter);
app.use('/api/investor', requireWalletAuth, investorRouter);

function walletToken(accountId) {
  return jwt.sign({
    type: 'wallet-auth-poc',
    account_id: accountId,
    public_key: 'ed25519:DEMO',
    network: 'testnet',
  }, process.env.JWT_SECRET);
}

const project = {
  id: 4,
  farmer: 'farmer03.testnet',
  investor: 'farab.testnet',
  investment_amount: '1000000000000000000000000',
  contract_address: 'ap4.farab.testnet',
  deal_type: 'farmer_dashboard_demo',
  total_cycles: 1,
  cycle_duration_days: 30,
};

const cycles = [{
  id: 1,
  status: 'funding_sent',
  fundingReceived: false,
  reportStatus: 'not_submitted',
  report: null,
}];

beforeEach(() => {
  jest.clearAllMocks();
  dealService.getFarmerDeals.mockResolvedValue([project]);
  dealService.getDealById.mockResolvedValue(project);
  dealService.getInvestorDealById.mockResolvedValue(project);
  dealService.getFarmerDealCycles.mockResolvedValue(cycles);
  dealService.enrichDealWithReturnSummary.mockResolvedValue(project);
  nearService.getContractStatus.mockResolvedValue({
    status: 'Funded',
    current_cycle: 1,
  });
});

test.each([
  ['/api/farmer/deals', 'farmer03.testnet'],
  ['/api/farmer/deals/4', 'farmer03.testnet'],
  ['/api/farmer/deals/4/cycles', 'farmer03.testnet'],
  ['/api/investor/deals/4', 'farab.testnet'],
])('canonical demo account can access GET %s', async (path, accountId) => {
  const response = await request(app)
    .get(path)
    .set('Authorization', `Bearer ${walletToken(accountId)}`);

  expect(response.status).toBe(200);
});

test('canonical demo cycle starts at funding_sent without confirmation or report', async () => {
  const response = await request(app)
    .get('/api/farmer/deals/4/cycles')
    .set('Authorization', `Bearer ${walletToken('farmer03.testnet')}`);

  expect(response.body.cycles).toEqual([expect.objectContaining({
    id: 1,
    status: 'funding_sent',
    fundingReceived: false,
    reportStatus: 'not_submitted',
  })]);
});
