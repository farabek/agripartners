process.env.JWT_SECRET = 'test-jwt-secret';
process.env.API_KEY = 'test-api-key';
process.env.NEAR_ADMIN_ACCOUNT = 'admin.testnet';
process.env.NEAR_ADMIN_PRIVATE_KEY = 'ed25519:test';

jest.mock('../src/services/userService');
jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const authRouter = require('../src/routes/auth');
const userService = require('../src/services/userService');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);

const mockUser = { id: 1, username: 'admin', email: 'admin@test.local', role: 'admin', password_hash: 'hashed' };
const adminToken = jwt.sign({ id: 1, username: 'admin', role: 'admin' }, 'test-jwt-secret');

beforeEach(() => jest.clearAllMocks());

test('POST /api/auth/login returns token for valid credentials', async () => {
  userService.findByUsername.mockResolvedValue(mockUser);
  userService.verifyPassword.mockResolvedValue(true);

  const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Admin123!' });
  expect(res.status).toBe(200);
  expect(res.body.token).toBeDefined();
  expect(res.body.user).toMatchObject({ id: 1, username: 'admin', role: 'admin' });
});

test('POST /api/auth/login returns 401 for wrong password', async () => {
  userService.findByUsername.mockResolvedValue(mockUser);
  userService.verifyPassword.mockResolvedValue(false);

  const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'wrong' });
  expect(res.status).toBe(401);
});

test('POST /api/auth/login returns 401 for unknown user', async () => {
  userService.findByUsername.mockResolvedValue(null);

  const res = await request(app).post('/api/auth/login').send({ username: 'nobody', password: 'pass' });
  expect(res.status).toBe(401);
});

test('POST /api/auth/login returns 400 when fields missing', async () => {
  const res = await request(app).post('/api/auth/login').send({ username: 'admin' });
  expect(res.status).toBe(400);
});

test('POST /api/auth/register creates user when called by admin', async () => {
  userService.createUser.mockResolvedValue({ id: 2, username: 'farmer1', role: 'farmer' });

  const res = await request(app)
    .post('/api/auth/register')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ username: 'farmer1', email: 'farmer@test.com', password: 'pass123', role: 'farmer' });
  expect(res.status).toBe(201);
  expect(res.body.username).toBe('farmer1');
});

test('POST /api/auth/register returns 401 without token', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ username: 'x', email: 'x@x.com', password: 'p', role: 'farmer' });
  expect(res.status).toBe(401);
});

test('POST /api/auth/register returns 403 for non-admin token', async () => {
  const farmerToken = jwt.sign({ id: 2, username: 'farmer1', role: 'farmer' }, 'test-jwt-secret');
  const res = await request(app)
    .post('/api/auth/register')
    .set('Authorization', `Bearer ${farmerToken}`)
    .send({ username: 'x', email: 'x@x.com', password: 'p', role: 'farmer' });
  expect(res.status).toBe(403);
});

test('POST /api/auth/register returns 400 for invalid role', async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ username: 'x', email: 'x@x.com', password: 'p', role: 'superuser' });
  expect(res.status).toBe(400);
});

test('POST /api/auth/register returns 409 for duplicate username', async () => {
  userService.createUser.mockRejectedValue({ code: '23505' });
  const res = await request(app)
    .post('/api/auth/register')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ username: 'admin', email: 'dup@test.com', password: 'p', role: 'farmer' });
  expect(res.status).toBe(409);
});

test('POST /api/auth/login токен содержит near_account', async () => {
  userService.findByUsername.mockResolvedValue({ ...mockUser, near_account: 'farmer.testnet' });
  userService.verifyPassword.mockResolvedValue(true);

  const res = await request(app).post('/api/auth/login').send({ username: 'farmer1', password: 'pass' });
  expect(res.status).toBe(200);
  const decoded = jwt.verify(res.body.token, 'test-jwt-secret');
  expect(decoded.near_account).toBe('farmer.testnet');
  expect(res.body.user.near_account).toBe('farmer.testnet');
});

test('POST /api/auth/login near_account равен null когда не задан', async () => {
  userService.findByUsername.mockResolvedValue(mockUser);
  userService.verifyPassword.mockResolvedValue(true);

  const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Admin123!' });
  expect(res.status).toBe(200);
  const decoded = jwt.verify(res.body.token, 'test-jwt-secret');
  expect(decoded.near_account).toBeNull();
  expect(res.body.user.near_account).toBeNull();
});
