const pool = require('../src/db/index');
jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const {
  getOrCreateInvestorProfile,
  updateInvestorProfile,
} = require('../src/services/investorProfileService');

const profile = {
  id: 1,
  account_id: 'investor.testnet',
  display_name: null,
  country: null,
  investor_type: null,
  risk_profile: null,
  kyc_status: 'not_started',
};

beforeEach(() => jest.clearAllMocks());

test('getOrCreateInvestorProfile creates profile when missing', async () => {
  pool.query.mockResolvedValueOnce({ rows: [profile] });

  const result = await getOrCreateInvestorProfile('investor.testnet');

  expect(pool.query).toHaveBeenCalledWith(
    expect.stringContaining('INSERT INTO investor_profiles'),
    ['investor.testnet']
  );
  expect(result).toEqual(profile);
});

test('getOrCreateInvestorProfile returns existing profile after conflict', async () => {
  pool.query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [profile] });

  const result = await getOrCreateInvestorProfile('investor.testnet');

  expect(pool.query).toHaveBeenNthCalledWith(
    2,
    'SELECT * FROM investor_profiles WHERE account_id = $1',
    ['investor.testnet']
  );
  expect(result).toEqual(profile);
});

test('updateInvestorProfile updates editable fields and normalizes empty strings', async () => {
  const updated = {
    ...profile,
    display_name: 'Investor One',
    country: null,
    investor_type: 'individual',
    risk_profile: 'balanced',
  };
  pool.query
    .mockResolvedValueOnce({ rows: [] })
    .mockResolvedValueOnce({ rows: [profile] })
    .mockResolvedValueOnce({ rows: [updated] });

  const result = await updateInvestorProfile('investor.testnet', {
    display_name: ' Investor One ',
    country: '',
    investor_type: 'individual',
    risk_profile: 'balanced',
  });

  const [sql, params] = pool.query.mock.calls[2];
  expect(sql).toContain('UPDATE investor_profiles');
  expect(sql).toContain('display_name = $2');
  expect(sql).toContain('country = $3');
  expect(sql).toContain('investor_type = $4');
  expect(sql).toContain('risk_profile = $5');
  expect(params).toEqual(['investor.testnet', 'Investor One', null, 'individual', 'balanced']);
  expect(result).toEqual(updated);
});

test('updateInvestorProfile rejects protected fields', async () => {
  await expect(updateInvestorProfile('investor.testnet', { account_id: 'other.testnet' }))
    .rejects.toThrow('account_id cannot be edited');
  expect(pool.query).not.toHaveBeenCalled();
});

test('updateInvestorProfile rejects invalid enum values', async () => {
  await expect(updateInvestorProfile('investor.testnet', { risk_profile: 'reckless' }))
    .rejects.toThrow('risk_profile must be one of');
  expect(pool.query).not.toHaveBeenCalled();
});

test('updateInvestorProfile enforces string length limits', async () => {
  await expect(updateInvestorProfile('investor.testnet', { display_name: 'x'.repeat(121) }))
    .rejects.toThrow('display_name must be 120 characters or fewer');
  expect(pool.query).not.toHaveBeenCalled();
});
