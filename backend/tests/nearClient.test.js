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
const { getAdminAccount, getAccountFromLocalCredentials, resetInstances } = require('../src/near/client');

beforeEach(() => {
  delete process.env.NEAR_RPC_URL;
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

test('getAccountFromLocalCredentials loads and caches non-production signer account', async () => {
  fs.readFileSync.mockReturnValue(JSON.stringify({
    account_id: 'investor-ap.testnet',
    private_key: 'ed25519:LOCAL_PRIVATE_KEY'
  }));

  const a1 = await getAccountFromLocalCredentials('investor-ap.testnet');
  const a2 = await getAccountFromLocalCredentials('investor-ap.testnet');

  expect(a1).toBe(a2);
  expect(a1).toHaveProperty('id', 'investor-ap.testnet');
  expect(fs.readFileSync).toHaveBeenCalledTimes(1);
  expect(KeyPair.fromString).toHaveBeenCalledWith('ed25519:LOCAL_PRIVATE_KEY');
  expect(mockSetKey).toHaveBeenCalledWith('testnet', 'investor-ap.testnet', {});
  expect(mockNearAccount).toHaveBeenCalledWith('investor-ap.testnet');
});

test('getAccountFromLocalCredentials is disabled in production', async () => {
  process.env.NODE_ENV = 'production';

  await expect(getAccountFromLocalCredentials('investor-ap.testnet'))
    .rejects.toThrow('Local NEAR credentials are disabled in production');
  expect(fs.readFileSync).not.toHaveBeenCalled();
});
