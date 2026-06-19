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

test('CORS omits allow-origin for origins outside the allowlist', async () => {
  const response = await request(app)
    .get('/health')
    .set('Origin', 'https://untrusted.example.com');

  expect(response.headers['access-control-allow-origin']).toBeUndefined();
});

test('CORS defaults to both local Vite origins', () => {
  expect(getAllowedOrigins('')).toEqual([
    'http://127.0.0.1:5173',
    'http://localhost:5173',
  ]);
});
