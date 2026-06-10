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

test('investor home dashboard renders MVP metrics and pilot deals', () => {
  expect(appJs).toContain('function investorMetrics');
  expect(appJs).toContain('Expected Returns');
  expect(appJs).toContain('Returned');
  expect(appJs).toContain('Outstanding');
  expect(appJs).toContain('Average ROI');
  expect(appJs).toContain('Active Deals');
  expect(appJs).toContain('Completed Deals');
  expect(appJs).toContain('Pilot Deal #1 (Fidlot)');
  expect(appJs).toContain('Pilot Deal #2 (Hissar Sheep)');
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${deal.id}`, { headers })");
});

test('investor detail fetches and renders repayment history', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${id}/returns`, { headers })");
  expect(appJs).toContain('id="investor-returns-list"');
  expect(appJs).toContain('function renderRepaymentHistory');
  expect(appJs).toContain('amount_near');
  expect(appJs).toContain('repayment.note');
});
