const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'app.js'),
  'utf8'
);

test('farmer dashboard loads profile and deals together', () => {
  const showFarmerPortalStart = appJs.indexOf('async function showFarmerPortal');
  expect(showFarmerPortalStart).toBeGreaterThan(-1);
  const showFarmerPortalBody = appJs.slice(showFarmerPortalStart, showFarmerPortalStart + 1800);

  expect(showFarmerPortalBody).toContain('fetchMyProfile()');
  expect(showFarmerPortalBody).toContain("fetchFarmerJson('/api/farmer/deals')");
  expect(showFarmerPortalBody).toContain('renderFarmerDashboard(contentEl, dealsData.deals || [], dealsData.farmer, profileData.profile)');
});

test('new farmer empty state is friendly and actionable', () => {
  expect(appJs).toContain('No active deals yet');
  expect(appJs).toContain('Your farmer profile is ready');
  expect(appJs).toContain('Share your wallet account with AgriPartners admin');
  expect(appJs).toContain('Copy Wallet Account');
});

test('farmer dashboard renders profile fields and summary cards', () => {
  expect(appJs).toContain('renderFarmerProfilePanel');
  expect(appJs).toContain('Display Name');
  expect(appJs).toContain('Organization / Farm Name');
  expect(appJs).toContain('Active Deals');
  expect(appJs).toContain('Total Funding');
  expect(appJs).toContain('Active Cycles');
  expect(appJs).toContain('Pending Reports');
});

test('farmer deal cards remain linked to the detail page', () => {
  expect(appJs).toContain('function renderFarmerDealCard');
  expect(appJs).toContain('href="#farmer/deals/${deal.id}"');
  expect(appJs).toContain('View Deal');
});

test('farmer deal detail fetches balances for withdraw state', () => {
  const showFarmerDealStart = appJs.indexOf('async function showFarmerDeal');
  expect(showFarmerDealStart).toBeGreaterThan(-1);
  const showFarmerDealBody = appJs.slice(showFarmerDealStart, showFarmerDealStart + 1400);

  expect(showFarmerDealBody).toContain('fetchFarmerJson(`/api/deals/${id}/balances`)');
  expect(showFarmerDealBody).toContain('renderFarmerDealDetail(el, dealData.deal, cyclesData.cycles || [], balancesData)');
});

test('farmer withdraw button is hidden behind positive farmer balance', () => {
  const detailStart = appJs.indexOf('function renderFarmerDealDetail');
  expect(detailStart).toBeGreaterThan(-1);
  const detailBody = appJs.slice(detailStart, detailStart + 2500);

  expect(detailBody).toContain("const farmerBalance = balances?.farmer || '0'");
  expect(detailBody).toContain('const canWithdrawFarmer = hasPositiveYocto(farmerBalance)');
  expect(detailBody).toContain('id="btn-farmer-withdraw"');
  expect(detailBody).toContain("${canWithdrawFarmer ? '' : 'disabled'}");
  expect(detailBody).toContain('Withdraw Farmer Balance');
  expect(detailBody).toContain('No Farmer Balance');
});

test('farmer withdraw uses wallet signed contract call, not backend private keys', () => {
  const withdrawStart = appJs.indexOf('async function withdrawFarmerWithWallet');
  expect(withdrawStart).toBeGreaterThan(-1);
  const withdrawBody = appJs.slice(withdrawStart, withdrawStart + 1800);

  expect(withdrawBody).toContain('signAndSendWalletFunctionCall');
  expect(withdrawBody).toContain('contractId: deal.contract_address');
  expect(withdrawBody).toContain("methodName: 'withdraw'");
  expect(withdrawBody).toContain('expectedAccountId: deal.farmer');
  expect(withdrawBody).toContain('connectedWallet !== deal.farmer');
  expect(withdrawBody).toContain('await showFarmerDeal(deal.id)');
  expect(withdrawBody).not.toContain('/api/admin/deals');
  expect(withdrawBody).not.toContain('/withdraw-as');
});
