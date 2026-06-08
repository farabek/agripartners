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
