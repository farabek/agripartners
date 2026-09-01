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
const pool = require('../src/db/index');

test('GET /health returns readiness metadata after checking PostgreSQL', async () => {
  pool.query
    .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] })
    .mockResolvedValueOnce({ rows: [{ count: 18 }] });
  const response = await request(app).get('/health');

  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({
    ok: true,
    service: 'agripartners-backend',
    database: 'ready',
    migrations: 18,
    environment: 'test',
  });
  expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);
});

test('GET /health/live remains available without database readiness', async () => {
  const response = await request(app).get('/health/live');
  expect(response.status).toBe(200);
  expect(response.body).toMatchObject({ ok: true, environment: 'test' });
});

test('CORS allows configured comma-separated origins', async () => {
  const response = await request(app)
    .get('/health/live')
    .set('Origin', 'https://preview.example.com');

  expect(response.headers['access-control-allow-origin']).toBe('https://preview.example.com');
});

test('CORS allows the production Vercel frontend', async () => {
  const response = await request(app)
    .get('/health/live')
    .set('Origin', 'https://agripartners.vercel.app');

  expect(response.headers['access-control-allow-origin'])
    .toBe('https://agripartners.vercel.app');
});

test('OPTIONS preflight allows the production frontend for wallet challenge', async () => {
  const response = await request(app)
    .options('/api/wallet-auth/challenge')
    .set('Origin', 'https://agripartners.vercel.app')
    .set('Access-Control-Request-Method', 'POST')
    .set('Access-Control-Request-Headers', 'content-type');

  expect(response.status).toBe(204);
  expect(response.headers['access-control-allow-origin'])
    .toBe('https://agripartners.vercel.app');
  expect(response.headers['access-control-allow-methods']).toContain('POST');
  expect(response.headers['access-control-allow-headers']).toBe('content-type');
});

test('CORS omits allow-origin for origins outside the allowlist', async () => {
  const response = await request(app)
    .get('/health/live')
    .set('Origin', 'https://untrusted.example.com');

  expect(response.headers['access-control-allow-origin']).toBeUndefined();
});

test('CORS keeps all local development origins when no environment value is set', () => {
  expect(getAllowedOrigins('')).toEqual([
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'https://agripartners.vercel.app',
    'https://frontend-omega-woad-90.vercel.app',
  ]);
});

test('CORS environment origins extend rather than replace required origins', () => {
  expect(getAllowedOrigins('https://custom.example.com')).toEqual([
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'https://agripartners.vercel.app',
    'https://frontend-omega-woad-90.vercel.app',
    'https://custom.example.com',
  ]);
});
