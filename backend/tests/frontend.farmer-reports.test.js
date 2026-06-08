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
  expect(submitBody).toContain('showFarmerActionResult');
  expect(submitBody).toContain('await showFarmerDeal(dealId)');
});

test('submitted farmer reports render summary and disable repeat submission', () => {
  expect(appJs).toContain('function renderFarmerReportSummary');
  expect(appJs).toContain('Report submitted');
  expect(appJs).toContain('${reportSubmitted || !cycle.fundingReceived ? \'disabled\' : \'\'}');
  expect(appJs).toContain('Confirm funding first');
});

test('investor deal detail fetches and renders farmer reports', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${id}/reports`, { headers })");
  expect(appJs).toContain('function renderInvestorReports');
  expect(appJs).toContain('Farmer Reports');
  expect(appJs).toContain('id="investor-reports-list"');
});
