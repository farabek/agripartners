jest.mock('../src/near/client', () => ({
  getAdminAccount: jest.fn()
}));

const { getAdminAccount } = require('../src/near/client');
const { getContractStatus, getContractBalances, startCycle, reportCycle } = require('../src/services/nearService');

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
