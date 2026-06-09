const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'app.js'),
  'utf8'
);

test('farmer report submission refreshes cycle state', () => {
  const submitStart = appJs.indexOf('async function submitFarmerReport');
  expect(submitStart).toBeGreaterThan(-1);
  const submitBody = appJs.slice(submitStart, submitStart + 1000);

  expect(submitBody).toContain("fetchFarmerJson(`/api/farmer/deals/${dealId}/cycles/${cycleId}/report`");
  expect(submitBody).toContain('report_title');
  expect(submitBody).toContain('report_body');
  expect(submitBody).toContain('showFarmerActionResult');
  expect(submitBody).toContain('await showFarmerDeal(dealId)');
});

test('submitted farmer reports render summary and disable repeat submission', () => {
  expect(appJs).toContain('function renderFarmerReportSummary');
  expect(appJs).toContain('Report submitted');
  expect(appJs).toContain('const canSubmitReport = cycle.fundingReceived && !reportSubmitted');
  expect(appJs).toContain("${canSubmitReport ? '' : 'disabled'}");
  expect(appJs).toContain('Confirm funding first');
});

test('farmer confirmation posts to cycle endpoint', () => {
  const confirmStart = appJs.indexOf('async function confirmFarmerFunding');
  expect(confirmStart).toBeGreaterThan(-1);
  const confirmBody = appJs.slice(confirmStart, confirmStart + 700);

  expect(confirmBody).toContain('fetchFarmerJson(`/api/farmer/deals/${dealId}/cycles/${cycleId}/confirm-funding`');
  expect(appJs).toContain('const canConfirmFunding = fundingSent && !cycle.fundingReceived');
  expect(appJs).toContain("${canConfirmFunding ? '' : 'disabled'}");
});

test('investor deal detail fetches and renders farmer reports and cycle status', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${id}/reports`, { headers })");
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${id}/cycles`, { headers })");
  expect(appJs).toContain('function renderInvestorReports');
  expect(appJs).toContain('function renderCycleStatusCards');
  expect(appJs).toContain('Farmer Reports');
  expect(appJs).toContain('id="investor-reports-list"');
  expect(appJs).toContain('id="investor-cycles-list"');
});
