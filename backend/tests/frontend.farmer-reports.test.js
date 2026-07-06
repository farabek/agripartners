const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'app.js'),
  'utf8'
);

function loadConfirmFarmerFunding(fetchImpl) {
  const start = appJs.indexOf('async function confirmFarmerFunding');
  const end = appJs.indexOf('function showFarmerReportForm');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const actionResult = jest.fn();
  const showDeal = jest.fn().mockResolvedValue(undefined);
  const source = `
    const fetchFarmerJson = fetchImpl;
    const showFarmerActionResult = actionResult;
    const showFarmerDeal = showDeal;
    ${appJs.slice(start, end)}
    module.exports = { confirmFarmerFunding };
  `;
  const module = { exports: {} };
  Function('module', 'fetchImpl', 'actionResult', 'showDeal', source)(module, fetchImpl, actionResult, showDeal);
  return { ...module.exports, actionResult, showDeal };
}

function loadSubmitFarmerReport(fetchImpl, title = 'Cycle report', body = 'Live report body') {
  const start = appJs.indexOf('async function submitFarmerReport');
  const end = appJs.indexOf('// --- Investor Portal ---');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const actionResult = jest.fn();
  const showDeal = jest.fn().mockResolvedValue(undefined);
  const documentMock = {
    getElementById: id => ({ value: id === 'farmer-report-title' ? title : body }),
  };
  const source = `
    const document = documentMock;
    const fetchFarmerJson = fetchImpl;
    const showFarmerActionResult = actionResult;
    const showFarmerDeal = showDeal;
    ${appJs.slice(start, end)}
    module.exports = { submitFarmerReport };
  `;
  const module = { exports: {} };
  Function('module', 'documentMock', 'fetchImpl', 'actionResult', 'showDeal', source)(
    module, documentMock, fetchImpl, actionResult, showDeal
  );
  return { ...module.exports, actionResult, showDeal };
}

test('farmer report submission refreshes cycle state', () => {
  const submitStart = appJs.indexOf('async function submitFarmerReport');
  expect(submitStart).toBeGreaterThan(-1);
  const submitBody = appJs.slice(submitStart, submitStart + 1000);

  expect(submitBody).toContain("fetchFarmerJson(`/api/farmer/deals/${dealId}/cycles/${cycleId}/report`");
  expect(submitBody).toContain('report_title');
  expect(submitBody).toContain('report_body');
  expect(submitBody).toContain('showFarmerActionResult');
  expect(submitBody).toContain("await showFarmerDeal(dealId, { type: 'success', message: 'Cycle report submitted' })");
});

test('submitted farmer reports render summary and disable repeat submission', () => {
  expect(appJs).toContain('function renderFarmerReportSummary');
  expect(appJs).toContain('Project Report submitted');
  expect(appJs).toContain('const canSubmitReport = cycle.fundingReceived && !reportSubmitted');
  expect(appJs).toContain("${canSubmitReport ? '' : 'disabled'}");
  expect(appJs).toContain('Confirm Funding first');
});

test('farmer confirmation posts to cycle endpoint', () => {
  const confirmStart = appJs.indexOf('async function confirmFarmerFunding');
  expect(confirmStart).toBeGreaterThan(-1);
  const confirmBody = appJs.slice(confirmStart, confirmStart + 700);

  expect(confirmBody).toContain('fetchFarmerJson(`/api/farmer/deals/${dealId}/cycles/${cycleId}/confirm-funding`');
  expect(appJs).toContain('const canConfirmFunding = fundingSent && !cycle.fundingReceived');
  expect(appJs).toContain("${canConfirmFunding ? '' : 'disabled'}");
});

test('funding confirmation success refreshes detail with preserved success state', async () => {
  const fetchImpl = jest.fn().mockResolvedValue({ ok: true });
  const { confirmFarmerFunding, showDeal, actionResult } = loadConfirmFarmerFunding(fetchImpl);

  await confirmFarmerFunding(9, 1);

  expect(fetchImpl).toHaveBeenCalledWith('/api/farmer/deals/9/cycles/1/confirm-funding', expect.objectContaining({ method: 'POST' }));
  expect(showDeal).toHaveBeenCalledWith(9, { type: 'success', message: 'Funding receipt confirmed' });
  expect(actionResult).not.toHaveBeenCalledWith('error', expect.anything());
});

test.each([
  ['generic error', 'confirmation failed'],
  ['duplicate confirmation', 'Funding already confirmed'],
])('funding confirmation exposes %s', async (_name, message) => {
  const fetchImpl = jest.fn().mockRejectedValue(new Error(message));
  const { confirmFarmerFunding, showDeal, actionResult } = loadConfirmFarmerFunding(fetchImpl);

  await confirmFarmerFunding(9, 1);

  expect(actionResult).toHaveBeenCalledWith('error', 'Funding confirmation is temporarily unavailable. Please try again.');
  expect(showDeal).not.toHaveBeenCalled();
});

test('report submission success refreshes detail with preserved success state', async () => {
  const fetchImpl = jest.fn().mockResolvedValue({ ok: true });
  const { submitFarmerReport, showDeal } = loadSubmitFarmerReport(fetchImpl);

  await submitFarmerReport(9, 1);

  expect(fetchImpl).toHaveBeenCalledWith('/api/farmer/deals/9/cycles/1/report', expect.objectContaining({
    method: 'POST',
    body: JSON.stringify({ report_title: 'Cycle report', report_body: 'Live report body' }),
  }));
  expect(showDeal).toHaveBeenCalledWith(9, { type: 'success', message: 'Cycle report submitted' });
});

test.each([
  ['generic error', 'report failed', 'Live report body'],
  ['duplicate report', 'Report already submitted for this cycle', 'Live report body'],
  ['empty body', 'report_body is required', ''],
])('report submission exposes %s', async (_name, message, body) => {
  const fetchImpl = jest.fn().mockRejectedValue(new Error(message));
  const { submitFarmerReport, showDeal, actionResult } = loadSubmitFarmerReport(fetchImpl, 'Report', body);

  await submitFarmerReport(9, 1);

  expect(actionResult).toHaveBeenCalledWith('error', 'Report submission is temporarily unavailable. Please try again.');
  expect(showDeal).not.toHaveBeenCalled();
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
