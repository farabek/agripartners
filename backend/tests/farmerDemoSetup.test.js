const {
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
  prepareFarmerDemoAccount,
} = require('../scripts/setup-farmer-demo-account');

test('canonical Farmer demo wallet defaults to farmer03.testnet', () => {
  expect(DEFAULT_ACCOUNT_ID).toBe('farmer03.testnet');
  expect(normalizeAccountId(' Farmer03.Testnet ')).toBe('farmer03.testnet');
  expect(() => normalizeAccountId('farmer-demo.near')).toThrow(
    'FARMER_DEMO_ACCOUNT_ID must be a valid NEAR Testnet account ID'
  );
});

test('Farmer demo setup upserts the profile, preserves Investor assignment, and resets Farmer workflow', async () => {
  const query = jest.fn()
    .mockResolvedValueOnce({
      rows: [{
        id: 4,
        title: null,
        deal_type: 'test_farmer_dashboard',
        farmer: 'old-farmer.testnet',
        investor: 'farab.testnet',
        contract_address: 'demo-contract.testnet',
        total_cycles: 1,
      }],
    })
    .mockResolvedValueOnce({
      rows: [{
        wallet_account_id: 'farmer03.testnet',
        role: 'farmer',
        display_name: 'Demo Farmer',
        organization_name: 'AgriPartners Demo Farm',
        onboarding_complete: true,
      }],
    })
    .mockResolvedValueOnce({
      rows: [{
        id: 4,
        title: null,
        deal_type: 'test_farmer_dashboard',
        farmer: 'farmer03.testnet',
        investor: 'farab.testnet',
        contract_address: 'demo-contract.testnet',
        total_cycles: 1,
      }],
    })
    .mockResolvedValueOnce({ rowCount: 1 })
    .mockResolvedValueOnce({ rowCount: 1 })
    .mockResolvedValueOnce({ rowCount: 2 })
    .mockResolvedValueOnce({ rowCount: 0 })
    .mockResolvedValueOnce({ rows: [{ wallet_account_id: 'farmer01.testnet' }] });

  const result = await prepareFarmerDemoAccount({ query }, {
    accountId: 'farmer03.testnet',
    displayName: 'Demo Farmer',
    projectId: 4,
  });

  expect(result).toEqual(expect.objectContaining({
    onboardingCompleted: true,
    account: expect.objectContaining({
      wallet_account_id: 'farmer03.testnet',
      role: 'farmer',
      display_name: 'Demo Farmer',
      onboarding_complete: true,
    }),
    project: expect.objectContaining({
      id: 4,
      farmer: 'farmer03.testnet',
      investor: 'farab.testnet',
    }),
    cycle: {
      cycleNumber: 1,
      fundingConfirmationRequired: true,
      reportStatus: 'not_submitted',
    },
  }));

  const projectUpdateSql = query.mock.calls[2][0];
  expect(projectUpdateSql).toContain('SET farmer = $1');
  expect(projectUpdateSql).not.toContain('SET investor');
  expect(query.mock.calls[3]).toEqual([
    'DELETE FROM reports WHERE deal_id = $1 AND cycle_id = $2',
    [4, 1],
  ]);
  expect(query.mock.calls[4]).toEqual([
    'DELETE FROM farmer_cycle_updates WHERE deal_id = $1 AND cycle_num = $2',
    [4, 1],
  ]);
  expect(query.mock.calls[5][0]).toContain("'cycle_reported'");
  expect(query.mock.calls[7][1]).toEqual(['farmer01.testnet']);
  expect(result.reset.obsoleteProfiles).toEqual(['farmer01.testnet']);
});
