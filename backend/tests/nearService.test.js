jest.mock('../src/near/client', () => ({
  getAdminAccount: jest.fn()
}));

const { getAdminAccount } = require('../src/near/client');
const { getContractStatus, getContractBalances } = require('../src/services/nearService');

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
