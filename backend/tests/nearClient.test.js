const mockNearAccount = jest.fn().mockImplementation((accountId) => Promise.resolve({ id: accountId }));
const mockSetKey = jest.fn();

jest.mock('fs', () => ({
  readFileSync: jest.fn()
}));

jest.mock('near-api-js', () => ({
  connect: jest.fn().mockResolvedValue({
    account: mockNearAccount
  }),
  keyStores: {
    InMemoryKeyStore: jest.fn().mockImplementation(() => ({ setKey: mockSetKey }))
  },
  KeyPair: { fromString: jest.fn().mockReturnValue({}) }
}));

process.env.NEAR_ADMIN_ACCOUNT = 'agripartners.testnet';
process.env.NEAR_ADMIN_PRIVATE_KEY = 'ed25519:FAKE';
process.env.NEAR_NETWORK = 'testnet';

const fs = require('fs');
const { KeyPair } = require('near-api-js');
const {
  getAdminAccount,
  getAccountFromConfiguredCredentials,
  resetInstances
} = require('../src/near/client');

beforeEach(() => {
  delete process.env.NEAR_RPC_URL;
  delete process.env.NEAR_FARMER_SIGNER_ACCOUNT_ID;
  delete process.env.NEAR_FARMER_SIGNER_PRIVATE_KEY;
  delete process.env.NEAR_INVESTOR_SIGNER_ACCOUNT_ID;
  delete process.env.NEAR_INVESTOR_SIGNER_PRIVATE_KEY;
  delete process.env.NEAR_PLATFORM_SIGNER_ACCOUNT_ID;
  delete process.env.NEAR_PLATFORM_SIGNER_PRIVATE_KEY;
  process.env.NODE_ENV = 'test';
  mockNearAccount.mockClear();
  mockSetKey.mockClear();
  fs.readFileSync.mockReset();
  KeyPair.fromString.mockClear();
  resetInstances();
});

test('getAdminAccount returns account object', async () => {
  const account = await getAdminAccount();
  expect(account).toHaveProperty('id', 'agripartners.testnet');
});

test('getAdminAccount returns same instance on repeated calls', async () => {
  const a1 = await getAdminAccount();
  const a2 = await getAdminAccount();
  expect(a1).toBe(a2);
});

test('getAdminAccount uses FastNear as the default testnet RPC', async () => {
  await getAdminAccount();
  const { connect } = require('near-api-js');
  expect(connect).toHaveBeenCalledWith(expect.objectContaining({
    networkId: 'testnet',
    nodeUrl: 'https://rpc.testnet.fastnear.com'
  }));
});

test('getAccountFromConfiguredCredentials reuses admin env key for admin account', async () => {
  const account = await getAccountFromConfiguredCredentials('agripartners.testnet');

  expect(account).toHaveProperty('id', 'agripartners.testnet');
  expect(fs.readFileSync).not.toHaveBeenCalled();
  expect(KeyPair.fromString).toHaveBeenCalledWith('ed25519:FAKE');
  expect(mockNearAccount).toHaveBeenCalledWith('agripartners.testnet');
});

test('getAccountFromConfiguredCredentials loads configured investor signer without local credentials', async () => {
  process.env.NEAR_INVESTOR_SIGNER_ACCOUNT_ID = 'investor-ap.testnet';
  process.env.NEAR_INVESTOR_SIGNER_PRIVATE_KEY = 'ed25519:INVESTOR_ENV_KEY';

  const account = await getAccountFromConfiguredCredentials('investor-ap.testnet');

  expect(account).toHaveProperty('id', 'investor-ap.testnet');
  expect(fs.readFileSync).not.toHaveBeenCalled();
  expect(KeyPair.fromString).toHaveBeenCalledWith('ed25519:INVESTOR_ENV_KEY');
  expect(mockSetKey).toHaveBeenCalledWith('testnet', 'investor-ap.testnet', {});
  expect(mockNearAccount).toHaveBeenCalledWith('investor-ap.testnet');
});

test('getAccountFromConfiguredCredentials loads configured farmer signer without local credentials', async () => {
  process.env.NEAR_FARMER_SIGNER_ACCOUNT_ID = 'farmer-ap.testnet';
  process.env.NEAR_FARMER_SIGNER_PRIVATE_KEY = 'ed25519:FARMER_ENV_KEY';

  const account = await getAccountFromConfiguredCredentials('farmer-ap.testnet');

  expect(account).toHaveProperty('id', 'farmer-ap.testnet');
  expect(fs.readFileSync).not.toHaveBeenCalled();
  expect(KeyPair.fromString).toHaveBeenCalledWith('ed25519:FARMER_ENV_KEY');
  expect(mockSetKey).toHaveBeenCalledWith('testnet', 'farmer-ap.testnet', {});
  expect(mockNearAccount).toHaveBeenCalledWith('farmer-ap.testnet');
});

test('getAccountFromConfiguredCredentials loads configured platform signer without local credentials', async () => {
  process.env.NEAR_PLATFORM_SIGNER_ACCOUNT_ID = 'platform-ap.testnet';
  process.env.NEAR_PLATFORM_SIGNER_PRIVATE_KEY = 'ed25519:PLATFORM_ENV_KEY';

  const account = await getAccountFromConfiguredCredentials('platform-ap.testnet');

  expect(account).toHaveProperty('id', 'platform-ap.testnet');
  expect(fs.readFileSync).not.toHaveBeenCalled();
  expect(KeyPair.fromString).toHaveBeenCalledWith('ed25519:PLATFORM_ENV_KEY');
  expect(mockSetKey).toHaveBeenCalledWith('testnet', 'platform-ap.testnet', {});
  expect(mockNearAccount).toHaveBeenCalledWith('platform-ap.testnet');
});

test('getAccountFromConfiguredCredentials rejects accounts without configured signer account', async () => {
  await expect(getAccountFromConfiguredCredentials('missing-investor.testnet'))
    .rejects.toThrow('No configured NEAR signer account for missing-investor.testnet');
  expect(fs.readFileSync).not.toHaveBeenCalled();
});

test('getAccountFromConfiguredCredentials rejects configured signer account without env private key', async () => {
  process.env.NEAR_INVESTOR_SIGNER_ACCOUNT_ID = 'investor-ap.testnet';
  delete process.env.NEAR_INVESTOR_SIGNER_PRIVATE_KEY;

  await expect(getAccountFromConfiguredCredentials('investor-ap.testnet'))
    .rejects.toThrow('NEAR_INVESTOR_SIGNER_PRIVATE_KEY is required for configured NEAR investor signer investor-ap.testnet');
  expect(fs.readFileSync).not.toHaveBeenCalled();
});
