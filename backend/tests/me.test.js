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

const mockDeals = [
  { id: 1, farmer: 'farmer.testnet', investor: 'investor.testnet', deal_type: 'fidlot' }
];

beforeEach(() => jest.clearAllMocks());

test('GET /api/me/deals возвращает 401 без токена', async () => {
  const res = await request(app).get('/api/me/deals');
  expect(res.status).toBe(401);
});

test('GET /api/me/deals возвращает 401 при невалидном токене', async () => {
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', 'Bearer invalid.token.here');
  expect(res.status).toBe(401);
});

test('GET /api/me/deals возвращает сделки фермера', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${farmerToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith('farmer.testnet', 'farmer');
  expect(res.body).toHaveLength(1);
  expect(res.body[0].id).toBe(1);
});

test('GET /api/me/deals вызывает getDealsByUser с near_account инвестора', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${investorToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith('investor.testnet', 'investor');
});

test('GET /api/me/deals вызывает getDealsByUser с null для admin', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith(null, 'admin');
});

test('GET /api/me/deals возвращает 500 при ошибке БД', async () => {
  dealService.getDealsByUser.mockRejectedValue(new Error('DB error'));
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${farmerToken}`);
  expect(res.status).toBe(500);
  expect(res.body.error).toBe('DB error');
});
