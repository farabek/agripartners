process.env.JWT_SECRET = 'test-jwt-secret';

jest.mock('../src/services/profileService');

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const profileRouter = require('../src/routes/profile');
const { requireWalletAuth } = require('../src/middleware/walletAuth');
const profileService = require('../src/services/profileService');

const app = express();
app.use(express.json());
app.use('/api/profile', requireWalletAuth, profileRouter);

function token(accountId = 'new-wallet.testnet') {
  return jwt.sign(
    {
      type: 'wallet-auth-poc',
      account_id: accountId,
      public_key: 'ed25519:PUBLIC',
      network: 'testnet',
    },
    'test-jwt-secret'
  );
}

const farmerProfile = {
  walletAccountId: 'farmer.testnet',
  role: 'farmer',
  displayName: 'Test Farmer',
  country: 'Uzbekistan',
  phone: '+998901234567',
  organizationName: 'Test Farm',
  bio: 'Sheep farmer',
};

const investorProfile = {
  walletAccountId: 'investor.testnet',
  role: 'investor',
  displayName: 'Test Investor',
  country: 'Uzbekistan',
};

beforeEach(() => {
  jest.clearAllMocks();
  profileService.getProfile.mockResolvedValue(null);
  profileService.createOnboardingProfile.mockImplementation((accountId, payload) => Promise.resolve({
    walletAccountId: accountId,
    role: payload.role,
    displayName: payload.displayName,
    country: payload.country || null,
    phone: payload.phone || null,
    organizationName: payload.organizationName || null,
    bio: payload.bio || null,
  }));
  profileService.updateProfile.mockImplementation((accountId, payload) => Promise.resolve({
    ...farmerProfile,
    walletAccountId: accountId,
    ...payload,
  }));
});

test('GET /api/profile/me requires auth', async () => {
  const res = await request(app).get('/api/profile/me');

  expect(res.status).toBe(401);
  expect(profileService.getProfile).not.toHaveBeenCalled();
});

test('GET /api/profile/me returns needsOnboarding for new wallet', async () => {
  const res = await request(app)
    .get('/api/profile/me')
    .set('Authorization', `Bearer ${token()}`);

  expect(res.status).toBe(200);
  expect(profileService.getProfile).toHaveBeenCalledWith('new-wallet.testnet');
  expect(res.body).toEqual({ ok: true, profile: null, needsOnboarding: true });
});

test('GET /api/profile/me returns existing profile', async () => {
  profileService.getProfile.mockResolvedValue(farmerProfile);

  const res = await request(app)
    .get('/api/profile/me')
    .set('Authorization', `Bearer ${token('farmer.testnet')}`);

  expect(res.status).toBe(200);
  expect(res.body.profile).toMatchObject({
    walletAccountId: 'farmer.testnet',
    role: 'farmer',
    displayName: 'Test Farmer',
  });
  expect(res.body.needsOnboarding).toBe(false);
});

test('POST /api/profile/onboarding requires auth', async () => {
  const res = await request(app)
    .post('/api/profile/onboarding')
    .send({ role: 'farmer', displayName: 'Test Farmer' });

  expect(res.status).toBe(401);
  expect(profileService.createOnboardingProfile).not.toHaveBeenCalled();
});

test('POST /api/profile/onboarding creates farmer profile', async () => {
  const payload = {
    role: 'farmer',
    displayName: 'Test Farmer',
    country: 'Uzbekistan',
    phone: '+998901234567',
    organizationName: 'Test Farm',
    bio: 'Sheep farmer',
  };

  const res = await request(app)
    .post('/api/profile/onboarding')
    .set('Authorization', `Bearer ${token('farmer.testnet')}`)
    .send(payload);

  expect(res.status).toBe(201);
  expect(profileService.createOnboardingProfile).toHaveBeenCalledWith('farmer.testnet', payload);
  expect(res.body.profile).toMatchObject({ role: 'farmer', displayName: 'Test Farmer' });
});

test('POST /api/profile/onboarding creates investor profile', async () => {
  const payload = { role: 'investor', displayName: 'Test Investor', country: 'Uzbekistan' };
  profileService.createOnboardingProfile.mockResolvedValue(investorProfile);

  const res = await request(app)
    .post('/api/profile/onboarding')
    .set('Authorization', `Bearer ${token('investor.testnet')}`)
    .send(payload);

  expect(res.status).toBe(201);
  expect(profileService.createOnboardingProfile).toHaveBeenCalledWith('investor.testnet', payload);
  expect(res.body.profile.role).toBe('investor');
});

test('POST /api/profile/onboarding rejects invalid role', async () => {
  profileService.createOnboardingProfile.mockRejectedValue(new Error('role must be farmer or investor'));

  const res = await request(app)
    .post('/api/profile/onboarding')
    .set('Authorization', `Bearer ${token()}`)
    .send({ role: 'admin', displayName: 'Bad Role' });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('role must be farmer or investor');
});

test('POST /api/profile/onboarding rejects missing displayName', async () => {
  profileService.createOnboardingProfile.mockRejectedValue(new Error('displayName is required'));

  const res = await request(app)
    .post('/api/profile/onboarding')
    .set('Authorization', `Bearer ${token()}`)
    .send({ role: 'farmer' });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('displayName is required');
});

test('POST /api/profile/onboarding rejects duplicate profile', async () => {
  const err = new Error('Profile already exists');
  err.code = 'PROFILE_EXISTS';
  profileService.createOnboardingProfile.mockRejectedValue(err);

  const res = await request(app)
    .post('/api/profile/onboarding')
    .set('Authorization', `Bearer ${token('farmer.testnet')}`)
    .send({ role: 'farmer', displayName: 'Test Farmer' });

  expect(res.status).toBe(409);
  expect(res.body.error).toBe('Profile already exists');
});

test('PUT /api/profile/me updates own profile', async () => {
  profileService.getProfile.mockResolvedValue(farmerProfile);

  const res = await request(app)
    .put('/api/profile/me')
    .set('Authorization', `Bearer ${token('farmer.testnet')}`)
    .send({ displayName: 'Updated Farmer', country: 'Uzbekistan' });

  expect(res.status).toBe(200);
  expect(profileService.updateProfile).toHaveBeenCalledWith('farmer.testnet', {
    displayName: 'Updated Farmer',
    country: 'Uzbekistan',
  });
  expect(res.body.profile.displayName).toBe('Updated Farmer');
});

test('PUT /api/profile/me does not allow changing wallet_account_id', async () => {
  profileService.getProfile.mockResolvedValue(farmerProfile);
  profileService.updateProfile.mockRejectedValue(new Error('wallet_account_id cannot be edited'));

  const res = await request(app)
    .put('/api/profile/me')
    .set('Authorization', `Bearer ${token('farmer.testnet')}`)
    .send({ wallet_account_id: 'other.testnet' });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('wallet_account_id cannot be edited');
});

test('PUT /api/profile/me blocks role change after onboarding', async () => {
  profileService.getProfile.mockResolvedValue(farmerProfile);
  profileService.updateProfile.mockRejectedValue(new Error('role cannot be edited'));

  const res = await request(app)
    .put('/api/profile/me')
    .set('Authorization', `Bearer ${token('farmer.testnet')}`)
    .send({ role: 'investor' });

  expect(res.status).toBe(400);
  expect(res.body.error).toBe('role cannot be edited');
});
