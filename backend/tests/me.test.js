process.env.JWT_SECRET = 'test-jwt-secret';
process.env.API_KEY = 'test-api-key';
process.env.NEAR_ADMIN_ACCOUNT = 'admin.testnet';
process.env.NEAR_ADMIN_PRIVATE_KEY = 'ed25519:test';

jest.mock('../src/services/dealService');
jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { requireJWT } = require('../src/middleware/jwtAuth');
const meRouter = require('../src/routes/me');
const dealService = require('../src/services/dealService');

const app = express();
app.use(express.json());
app.use('/api/me', requireJWT, meRouter);

const farmerToken = jwt.sign(
  { id: 2, username: 'farmer1', role: 'farmer', near_account: 'farmer.testnet' },
  'test-jwt-secret'
);
const investorToken = jwt.sign(
  { id: 3, username: 'inv1', role: 'investor', near_account: 'investor.testnet' },
  'test-jwt-secret'
);
const adminToken = jwt.sign(
  { id: 1, username: 'admin', role: 'admin', near_account: null },
  'test-jwt-secret'
);
const unknownRoleToken = jwt.sign(
  { id: 4, username: 'unknown', role: 'auditor', near_account: 'auditor.testnet' },
  'test-jwt-secret'
);
const missingRoleToken = jwt.sign(
  { id: 5, username: 'missing-role', near_account: 'user.testnet' },
  'test-jwt-secret'
);
const farmerWithoutAccountToken = jwt.sign(
  { id: 6, username: 'farmer-no-wallet', role: 'farmer', near_account: null },
  'test-jwt-secret'
);
const investorWithoutAccountToken = jwt.sign(
  { id: 7, username: 'investor-no-wallet', role: 'investor', near_account: null },
  'test-jwt-secret'
);
const walletAuthToken = jwt.sign(
  {
    type: 'wallet-auth-poc',
    account_id: 'wallet-user.testnet',
    public_key: 'ed25519:test',
    network: 'testnet',
  },
  'test-jwt-secret'
);

const mockDeals = [
  { id: 1, farmer: 'farmer.testnet', investor: 'investor.testnet', deal_type: 'fidlot' }
];

beforeEach(() => jest.clearAllMocks());

test('GET /api/me/deals returns 401 without token', async () => {
  const res = await request(app).get('/api/me/deals');
  expect(res.status).toBe(401);
});

test('GET /api/me/deals returns 401 for invalid token', async () => {
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', 'Bearer invalid.token.here');
  expect(res.status).toBe(401);
});

test('GET /api/me/deals returns farmer deals', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${farmerToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith('farmer.testnet', 'farmer');
  expect(res.body).toHaveLength(1);
  expect(res.body[0].id).toBe(1);
});

test('GET /api/me/deals calls getDealsByUser with investor near_account', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${investorToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith('investor.testnet', 'investor');
});

test('GET /api/me/deals calls getDealsByUser with null for admin', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith(null, 'admin');
});

test.each([
  ['unknown role', unknownRoleToken],
  ['missing role', missingRoleToken],
  ['wallet-auth JWT', walletAuthToken],
  ['farmer without near_account', farmerWithoutAccountToken],
  ['investor without near_account', investorWithoutAccountToken],
])('GET /api/me/deals returns 403 for %s', async (_label, token) => {
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${token}`);

  expect(res.status).toBe(403);
  expect(res.body.error).toBe('Forbidden');
  expect(dealService.getDealsByUser).not.toHaveBeenCalled();
});

test('GET /api/me/deals returns 500 on DB error', async () => {
  dealService.getDealsByUser.mockRejectedValue(new Error('DB error'));
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${farmerToken}`);
  expect(res.status).toBe(500);
  expect(res.body.error).toBe('DB error');
});
