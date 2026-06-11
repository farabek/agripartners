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
  expect(showFarmerPortalBody).toContain('buildFarmerDemoDataset(dealsData.deals || [], dealsData.farmer)');
  expect(showFarmerPortalBody).toContain('renderFarmerDashboard(contentEl, deals, dealsData.farmer, profileData.profile)');
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
  expect(appJs).toContain('Completed Deals');
  expect(appJs).toContain('Total Funding');
  expect(appJs).toContain('Active Cycles');
  expect(appJs).toContain('Pending Reports');
});

test('farmer deal cards remain linked to the detail page', () => {
  expect(appJs).toContain('function renderFarmerDealCard');
  expect(appJs).toContain('const dealHref = deal.isDemoPilot ? `#farmer/pilots/${deal.pilot_key}` : `#farmer/deals/${deal.id}`');
  expect(appJs).toContain('View Deal');
});

test('farmer demo dataset shows only clean pilot deals', () => {
  expect(appJs).toContain('const FARMER_DEMO_DATASET_ENABLED = true');
  expect(appJs).toContain('function buildFarmerDemoDataset');
  expect(appJs).toContain('function farmerDemoDealFromPilot');
  expect(appJs).toContain('Fidlot Livestock Project');
  expect(appJs).toContain('Hissar Sheep Breeding Project');
  expect(appJs).toContain("fundingStatus: 'Funding Confirmed'");
  expect(appJs).toContain("cycleStatus: isFidlot ? 'Completed' : 'Cycle Active'");
  expect(appJs).toContain("reportLabel: isFidlot ? 'Report Submitted' : 'Next Report Due'");
  expect(appJs).not.toContain('QA Admin Deal');
  expect(appJs).not.toContain('Deal #4 Unknown');
  expect(appJs).not.toContain('withdraw_signer_test');
});

test('farmer summary metrics show clean demo values', () => {
  expect(appJs).toContain('activeDeals = deals.filter((deal) => deal.status !== \'Completed\').length');
  expect(appJs).toContain('completedDeals = deals.filter((deal) => deal.status === \'Completed\').length');
  expect(appJs).toContain('pendingReports = deals.filter((deal) => deal.reportStatus === \'pending\' || deal.reportStatus === \'due\').length');
  expect(appJs).toContain('displayTotalFunding');
  expect(appJs).toContain("displayAmount: '$50,000'");
  expect(appJs).toContain('Demo financial view in USD');
  expect(appJs).toContain('Completed Deals');
});

test('farmer demo deal detail renders project profile and report cycle status', () => {
  expect(appJs).toContain('showFarmerPilotProfile(farmerPilot[1])');
  expect(appJs).toContain('function renderFarmerDemoDealDetail');
  expect(appJs).toContain('Project Profile');
  expect(appJs).toContain('Funding Status');
  expect(appJs).toContain('Cycle Status');
  expect(appJs).toContain('Farmer Report');
  expect(appJs).toContain('Event History');
  expect(appJs).toContain('Funding Confirmed');
  expect(appJs).toContain('Report Submitted');
  expect(appJs).toContain('Next Report Due');
  expect(appJs).toContain('Return Recorded');
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
