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
