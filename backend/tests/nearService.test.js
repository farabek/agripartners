jest.mock('../src/near/client', () => ({
  getAdminAccount: jest.fn(),
  getAccountFromConfiguredCredentials: jest.fn()
}));

const {
  getAdminAccount,
  getAccountFromConfiguredCredentials
} = require('../src/near/client');
const {
  getContractStatus,
  getContractBalances,
  startCycle,
  reportCycle,
  fundContract,
  fundContractAs,
  withdrawContract,
  withdrawContractAs
} = require('../src/services/nearService');

beforeEach(() => {
  jest.clearAllMocks();
});

test('getContractStatus returns status and current_cycle', async () => {
  getAdminAccount.mockResolvedValue({
    viewFunction: jest.fn().mockResolvedValue(['CycleActive', 2])
  });
  const result = await getContractStatus('ap123.agripartners.testnet');
  expect(result).toEqual({ status: 'CycleActive', current_cycle: 2 });
});

test('getContractBalances returns farmer/investor/platform/escrow', async () => {
  getAdminAccount.mockResolvedValue({
    viewFunction: jest.fn().mockResolvedValue(['1000', '2000', '3000', '4000'])
  });
  const result = await getContractBalances('ap123.agripartners.testnet');
  expect(result).toEqual({ farmer: '1000', investor: '2000', platform: '3000', escrow: '4000' });
});

test('startCycle calls start_cycle on contract and returns txHash', async () => {
  const mockAccount = {
    viewFunction: jest.fn(),
    functionCall: jest.fn().mockResolvedValue({ transaction: { hash: 'tx_start123' } })
  };
  getAdminAccount.mockResolvedValue(mockAccount);

  const result = await startCycle('ap1.agripartners.testnet');

  expect(result.txHash).toBe('tx_start123');
  expect(mockAccount.functionCall).toHaveBeenCalledWith({
    contractId: 'ap1.agripartners.testnet',
    methodName: 'start_cycle',
    args: {},
    gas: '100000000000000'
  });
});

test('reportCycle passes losses_near arg and profit as attachedDeposit', async () => {
  const mockAccount = {
    functionCall: jest.fn().mockResolvedValue({ transaction: { hash: 'tx_report123' } })
  };
  getAdminAccount.mockResolvedValue(mockAccount);

  const result = await reportCycle(
    'ap1.agripartners.testnet',
    '5000000000000000000000000',
    '100000000000000000000000'
  );

  expect(result.txHash).toBe('tx_report123');
  expect(mockAccount.functionCall).toHaveBeenCalledWith({
    contractId: 'ap1.agripartners.testnet',
    methodName: 'report_cycle',
    args: { losses_near: '100000000000000000000000' },
    gas: '100000000000000',
    attachedDeposit: '5000000000000000000000000'
  });
});

test('fundContract calls fund on contract with attached investment amount', async () => {
  const mockAccount = {
    functionCall: jest.fn().mockResolvedValue({ transaction: { hash: 'tx_fund123' } })
  };
  getAdminAccount.mockResolvedValue(mockAccount);

  const result = await fundContract('ap1.agripartners.testnet', '10000000000000000000000000');

  expect(result.txHash).toBe('tx_fund123');
  expect(mockAccount.functionCall).toHaveBeenCalledWith({
    contractId: 'ap1.agripartners.testnet',
    methodName: 'fund',
    args: {},
    gas: '100000000000000',
    attachedDeposit: '10000000000000000000000000'
  });
});

test('fundContractAs funds using configured account credentials', async () => {
  const mockAccount = {
    functionCall: jest.fn().mockResolvedValue({ transaction: { hash: 'tx_fund_as123' } })
  };
  getAccountFromConfiguredCredentials.mockResolvedValue(mockAccount);

  const result = await fundContractAs(
    'farab.testnet',
    'ap1.agripartners.testnet',
    '10000000000000000000000000'
  );

  expect(result.txHash).toBe('tx_fund_as123');
  expect(getAccountFromConfiguredCredentials).toHaveBeenCalledWith('farab.testnet');
  expect(mockAccount.functionCall).toHaveBeenCalledWith({
    contractId: 'ap1.agripartners.testnet',
    methodName: 'fund',
    args: {},
    gas: '100000000000000',
    attachedDeposit: '10000000000000000000000000'
  });
});

test('withdrawContract calls withdraw with admin signer and returns txHash', async () => {
  const mockAccount = {
    functionCall: jest.fn().mockResolvedValue({ transaction: { hash: 'tx_withdraw123' } })
  };
  getAdminAccount.mockResolvedValue(mockAccount);

  const result = await withdrawContract('ap1.agripartners.testnet');

  expect(result.txHash).toBe('tx_withdraw123');
  expect(getAdminAccount).toHaveBeenCalledWith();
  expect(getAccountFromConfiguredCredentials).not.toHaveBeenCalled();
  expect(mockAccount.functionCall).toHaveBeenCalledWith({
    contractId: 'ap1.agripartners.testnet',
    methodName: 'withdraw',
    args: {},
    gas: '100000000000000'
  });
});

test('withdrawContract ignores optional platform signer and uses admin signer', async () => {
  const mockAccount = {
    functionCall: jest.fn().mockResolvedValue({ transaction: { hash: 'tx_withdraw_as123' } })
  };
  process.env.NEAR_PLATFORM_SIGNER_ACCOUNT_ID = 'platform-ap.testnet';
  getAdminAccount.mockResolvedValue(mockAccount);

  const result = await withdrawContract('ap1.agripartners.testnet');

  expect(result.txHash).toBe('tx_withdraw_as123');
  expect(getAdminAccount).toHaveBeenCalledWith();
  expect(getAccountFromConfiguredCredentials).not.toHaveBeenCalled();
  expect(mockAccount.functionCall).toHaveBeenCalledWith({
    contractId: 'ap1.agripartners.testnet',
    methodName: 'withdraw',
    args: {},
    gas: '100000000000000'
  });
});

test('withdrawContractAs accepts farmer recipient intent but signs with admin', async () => {
  const mockAccount = {
    functionCall: jest.fn().mockResolvedValue({ transaction: { hash: 'tx_withdraw_farmer123' } })
  };
  getAdminAccount.mockResolvedValue(mockAccount);

  const result = await withdrawContractAs('farmer-ap.testnet', 'ap1.agripartners.testnet');

  expect(result.txHash).toBe('tx_withdraw_farmer123');
  expect(getAdminAccount).toHaveBeenCalledWith();
  expect(getAccountFromConfiguredCredentials).not.toHaveBeenCalled();
  expect(mockAccount.functionCall).toHaveBeenCalledWith({
    contractId: 'ap1.agripartners.testnet',
    methodName: 'withdraw',
    args: {},
    gas: '100000000000000'
  });
});

test('withdrawContractAs accepts investor recipient intent but signs with admin', async () => {
  const mockAccount = {
    functionCall: jest.fn().mockResolvedValue({ transaction: { hash: 'tx_withdraw_investor123' } })
  };
  getAdminAccount.mockResolvedValue(mockAccount);

  const result = await withdrawContractAs('investor-ap.testnet', 'ap1.agripartners.testnet');

  expect(result.txHash).toBe('tx_withdraw_investor123');
  expect(getAdminAccount).toHaveBeenCalledWith();
  expect(getAccountFromConfiguredCredentials).not.toHaveBeenCalled();
  expect(mockAccount.functionCall).toHaveBeenCalledWith({
    contractId: 'ap1.agripartners.testnet',
    methodName: 'withdraw',
    args: {},
    gas: '100000000000000'
  });
});
