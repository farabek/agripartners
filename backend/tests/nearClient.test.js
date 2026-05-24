jest.mock('near-api-js', () => ({
  connect: jest.fn().mockResolvedValue({
    account: jest.fn().mockResolvedValue({ id: 'agripartners.testnet' })
  }),
  keyStores: {
    InMemoryKeyStore: jest.fn().mockImplementation(() => ({ setKey: jest.fn() }))
  },
  KeyPair: { fromString: jest.fn().mockReturnValue({}) }
}));

process.env.NEAR_ADMIN_ACCOUNT = 'agripartners.testnet';
process.env.NEAR_ADMIN_PRIVATE_KEY = 'ed25519:FAKE';
process.env.NEAR_NETWORK = 'testnet';

const { getAdminAccount, resetInstances } = require('../src/near/client');

beforeEach(() => resetInstances());

test('getAdminAccount returns account object', async () => {
  const account = await getAdminAccount();
  expect(account).toHaveProperty('id', 'agripartners.testnet');
});

test('getAdminAccount returns same instance on repeated calls', async () => {
  const a1 = await getAdminAccount();
  const a2 = await getAdminAccount();
  expect(a1).toBe(a2);
});
