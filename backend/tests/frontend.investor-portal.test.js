const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'app.js'),
  'utf8'
);

test('investor detail fetches farmer cycle reporting endpoint', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${id}/cycles`, { headers })");
  expect(appJs).toContain('normalizeCyclesResponse(await cyclesRes.value.json())');
  expect(appJs).toContain('id="investor-cycles-list"');
});

test('investor cycle cards show funding confirmation and report status', () => {
  expect(appJs).toContain('function renderCycleStatusCards');
  expect(appJs).toContain('Funding sent:');
  expect(appJs).toContain('Funding confirmed:');
  expect(appJs).toContain('Report status:');
  expect(appJs).toContain('Waiting for farmer report');
});

test('investor cycle cards render farmer report fields', () => {
  expect(appJs).toContain('function normalizeCycleCard');
  expect(appJs).toContain('cycle.report_title');
  expect(appJs).toContain('cycle.report_body');
  expect(appJs).toContain('cycle.report_created_at');
  expect(appJs).toContain('renderFarmerReportSummary(card.report)');
});

test('investor detail renders investment summary', () => {
  expect(appJs).toContain('Investment Summary');
  expect(appJs).toContain('id="investor-investment-summary"');
  expect(appJs).toContain('function renderInvestmentSummary');
  expect(appJs).toContain('Expected Return');
  expect(appJs).toContain('Outstanding');
  expect(appJs).toContain('ROI');
});

test('investor detail renders project profile before technical deal data', () => {
  expect(appJs).toContain('function renderProjectProfile');
  expect(appJs).toContain('Project Profile');
  expect(appJs).toContain('Fidlot Livestock Project');
  expect(appJs).toContain('Hissar Sheep Breeding Project');
  expect(appJs).toContain('$50,000');
  expect(appJs).toContain('64%');
  expect(appJs).toContain('63.3%');
  expect(appJs).toContain('21.9%');
  expect(appJs).toContain('21.1%');
  expect(appJs).toContain('Livestock fattening operation based on a real pilot agricultural agreement');
  expect(appJs).toContain('Sheep breeding operation based on a real pilot agricultural agreement');
  expect(appJs).toContain('Technical Deal Data');
  expect(appJs).toContain('Deal #${escapeHtml(deal.id)}');
  expect(appJs).toContain('function getPilotForDeal');
  expect(appJs).toContain('function pilotKeyFromText');
  expect(appJs).not.toContain('[1, 7].includes');
  expect(appJs).not.toContain('[2, 8].includes');
});

test('investor home dashboard renders MVP metrics and pilot deals', () => {
  expect(appJs).toContain('function investorMetrics');
  expect(appJs).toContain('Expected Returns');
  expect(appJs).toContain('Returned');
  expect(appJs).toContain('Outstanding');
  expect(appJs).toContain('Average ROI');
  expect(appJs).toContain('Active Deals');
  expect(appJs).toContain('Completed Deals');
  expect(appJs).toContain('Investment Summary');
  expect(appJs).toContain('Featured Pilot Deals');
  expect(appJs).toContain('Fidlot Livestock Project');
  expect(appJs).toContain('Hissar Sheep Breeding Project');
  expect(appJs).toContain('21.9%');
  expect(appJs).toContain('21.1%');
  expect(appJs).not.toContain('Greenhouse Project');
  expect(appJs).not.toContain('Poultry Farm');
  expect(appJs).not.toContain('Cotton Farm');
  expect(appJs).not.toContain('Demo Portfolio');
  expect(appJs).toContain('INVESTOR_DEMO_DATASET_ENABLED');
  expect(appJs).toContain('buildInvestorDemoDataset(deals, connectedWalletAccount)');
});

test('investor detail fetches and renders repayment history', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${id}/returns`, { headers })");
  expect(appJs).toContain('id="investor-returns-list"');
  expect(appJs).toContain('function renderRepaymentHistory');
  expect(appJs).toContain('amount_near');
  expect(appJs).toContain('repayment.note');
});

test('investor demo dataset hides test records and renders clean pilot routes', () => {
  expect(appJs).toContain('const INVESTOR_DEMO_PILOTS');
  expect(appJs).toContain("key: 'fidlot'");
  expect(appJs).toContain("key: 'hissar'");
  expect(appJs).toContain("status: 'Completed'");
  expect(appJs).toContain("status: 'Active'");
  expect(appJs).toContain('activeDeals: deals.filter');
  expect(appJs).toContain('completedDeals: deals.filter');
  expect(appJs).toContain('showInvestorPilotProfile(investorPilot[1])');
  expect(appJs).toContain('#investor/pilots/${deal.pilot_key}');
  expect(appJs).toContain('renderInvestorDemoDealDetail');
  expect(appJs).toContain('Investor demo profile: this screen is prepared for presentation and screenshot readiness.');
  expect(appJs).not.toContain('QA Admin Deal');
  expect(appJs).not.toContain('Deal #4 Unknown');
  expect(appJs).not.toContain('withdraw_signer_test');
  expect(appJs).not.toContain('test_farmer_dashboard');
});
