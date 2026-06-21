process.env.JWT_SECRET = 'test-jwt-secret';
process.env.API_KEY = 'test-api-key';
process.env.NEAR_ADMIN_ACCOUNT = 'admin.testnet';
process.env.NEAR_ADMIN_PRIVATE_KEY = 'ed25519:test';
process.env.NODE_ENV = 'test';
process.env.CORS_ORIGIN = 'https://alpha.example.com, https://preview.example.com';

jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const request = require('supertest');
const app = require('../src/app');
const { getAllowedOrigins } = require('../src/config/cors');

test('GET /health returns deployment health metadata', async () => {
  const response = await request(app).get('/health');

  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    ok: true,
    service: 'agripartners-backend',
    environment: 'test',
  });
  expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
});

test('CORS allows configured comma-separated origins', async () => {
  const response = await request(app)
    .get('/health')
    .set('Origin', 'https://preview.example.com');

  expect(response.headers['access-control-allow-origin']).toBe('https://preview.example.com');
});

test('CORS allows the production Vercel frontend', async () => {
  const response = await request(app)
    .get('/health')
    .set('Origin', 'https://frontend-omega-woad-90.vercel.app');

  expect(response.headers['access-control-allow-origin'])
    .toBe('https://frontend-omega-woad-90.vercel.app');
});

test('OPTIONS preflight allows the production frontend for wallet challenge', async () => {
  const response = await request(app)
    .options('/api/wallet-auth/challenge')
    .set('Origin', 'https://frontend-omega-woad-90.vercel.app')
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'content-type');

  expect(response.status).toBe(204);
  expect(response.headers['access-control-allow-origin'])
    .toBe('https://frontend-omega-woad-90.vercel.app');
  expect(response.headers['access-control-allow-methods']).toContain('POST');
  expect(response.headers['access-control-allow-headers']).toBe('content-type');
});

test('CORS omits allow-origin for origins outside the allowlist', async () => {
  const response = await request(app)
    .get('/health')
    .set('Origin', 'https://untrusted.example.com');

  expect(response.headers['access-control-allow-origin']).toBeUndefined();
});

test('CORS keeps all local development origins when no environment value is set', () => {
  expect(getAllowedOrigins('')).toEqual([
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'https://frontend-omega-woad-90.vercel.app',
  ]);
});

test('CORS environment origins extend rather than replace required origins', () => {
  expect(getAllowedOrigins('https://custom.example.com')).toEqual([
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'https://frontend-omega-woad-90.vercel.app',
    'https://custom.example.com',
  ]);
});
