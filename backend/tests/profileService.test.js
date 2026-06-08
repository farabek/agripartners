const pool = require('../src/db/index');
jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const { getProfilesByRole } = require('../src/services/profileService');

beforeEach(() => jest.clearAllMocks());

test('getProfilesByRole returns farmer profiles ordered for admin selects', async () => {
  pool.query.mockResolvedValue({
    rows: [{
      wallet_account_id: 'farmer.testnet',
      role: 'farmer',
      display_name: 'Farmer Profile',
      country: 'UZ',
      phone: null,
      organization_name: 'Demo Farm',
      bio: null,
      created_at: '2026-06-08T00:00:00Z',
      updated_at: '2026-06-08T00:00:00Z',
    }],
  });

  const profiles = await getProfilesByRole('farmer');

  expect(pool.query).toHaveBeenCalledWith(
    expect.stringContaining('WHERE role = $1'),
    ['farmer']
  );
  expect(profiles).toEqual([expect.objectContaining({
    walletAccountId: 'farmer.testnet',
    role: 'farmer',
    displayName: 'Farmer Profile',
    organizationName: 'Demo Farm',
  })]);
});

test('getProfilesByRole rejects unsupported roles', async () => {
  await expect(getProfilesByRole('admin')).rejects.toThrow('role must be farmer or investor');
  expect(pool.query).not.toHaveBeenCalled();
});
