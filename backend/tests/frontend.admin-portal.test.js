const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'app.js'),
  'utf8'
);

test('admin deal creation resets captured form after successful response', () => {
  const createAdminDealStart = appJs.indexOf('async function createAdminDeal');
  expect(createAdminDealStart).toBeGreaterThan(-1);
  const createAdminDealBody = appJs.slice(createAdminDealStart, createAdminDealStart + 1800);

  const formCaptureIndex = createAdminDealBody.indexOf('const form = event.currentTarget');
  const postIndex = createAdminDealBody.indexOf("fetchAdminJson('/api/admin/deals'");
  const resetIndex = createAdminDealBody.indexOf('form.reset()');

  expect(formCaptureIndex).toBeGreaterThan(-1);
  expect(postIndex).toBeGreaterThan(formCaptureIndex);
  expect(resetIndex).toBeGreaterThan(postIndex);
  expect(createAdminDealBody).not.toContain('event.currentTarget.reset()');
});

test('admin actions are gated by contract status and refreshed after funding', () => {
  expect(appJs).toContain("if (action === 'fund') return normalizedStatus === 'Initialized'");
  expect(appJs).toContain("if (action === 'start-cycle') return normalizedStatus === 'Funded'");
  expect(appJs).toContain("if (action === 'report-profit') return normalizedStatus === 'CycleActive'");
  expect(appJs).toContain('renderAdminActions(deal, status?.status)');
  expect(appJs).toContain('updateAdminActionState(status.status)');
  expect(appJs).toContain('btn.disabled = !isAdminActionEnabled(btn.dataset.action, normalizedStatus)');
});

test('deal list cards show visible deal number with title', () => {
  const renderDealCardStart = appJs.indexOf('function renderDealCard');
  expect(renderDealCardStart).toBeGreaterThan(-1);
  const renderDealCardBody = appJs.slice(renderDealCardStart, renderDealCardStart + 900);

  expect(renderDealCardBody).toContain('Deal #${escapeHtml(d.id)} &mdash; ${escapeHtml(dealTitle)}');
  expect(renderDealCardBody).toContain('${d.description ?');
  expect(renderDealCardBody).toContain('href="#deals/${d.id}"');
});

test('admin demo dashboard renders clean pilot projects and summary', () => {
  expect(appJs).toContain('const ADMIN_DEMO_DATASET_ENABLED = true');
  expect(appJs).toContain('function buildAdminDemoDataset');
  expect(appJs).toContain('function renderAdminDemoDashboard');
  expect(appJs).toContain('Fidlot Livestock Project');
  expect(appJs).toContain('Hissar Sheep Breeding Project');
  expect(appJs).toContain('Total Pilot Funding');
  expect(appJs).toContain("totalPilotFunding: '$100,000'");
  expect(appJs).toContain("activeDeals: deals.filter((deal) => deal.status === 'Active').length");
  expect(appJs).toContain("completedDeals: deals.filter((deal) => deal.status === 'Completed').length");
  expect(appJs).toContain("reportsSubmitted: deals.filter((deal) => deal.reportStatus === 'Report Submitted').length");
  expect(appJs).toContain("reportsPending: deals.filter((deal) => deal.reportStatus === 'Next Report Due').length");
  expect(appJs).toContain("returnsRecorded: '$82,000'");
  expect(appJs).toContain("outstanding: '$81,650'");
  expect(appJs).toContain('$100,000');
  expect(appJs).toContain('AgriPartners Pilot Farm');
  expect(appJs).toContain('Pilot Investor');
  expect(appJs).toContain('Pilot Deal');
});

test('admin demo view hides raw test records and raw pilot titles', () => {
  expect(appJs).not.toContain('QA Admin Deal');
  expect(appJs).not.toContain('test_farmer_dashboard');
  expect(appJs).not.toContain('withdraw_signer_test');
  expect(appJs).not.toContain('fidlot_v5');
  expect(appJs).not.toContain('fidlot_v5_pilot_v2');
});

test('admin demo detail renders investor-ready operational sections', () => {
  expect(appJs).toContain('showAdminPilotDetail(adminPilot[1])');
  expect(appJs).toContain('function renderAdminDemoDealDetail');
  expect(appJs).toContain('Project Profile');
  expect(appJs).toContain('Funding Status');
  expect(appJs).toContain('Cycle Status');
  expect(appJs).toContain('Farmer Report');
  expect(appJs).toContain('Returns');
  expect(appJs).toContain('Event History');
  expect(appJs).toContain('Funding Confirmed');
  expect(appJs).toContain('Cycle Active');
  expect(appJs).toContain('Report Submitted');
  expect(appJs).toContain('Next Report Due');
  expect(appJs).toContain('Return Recorded');
  expect(appJs).toContain('Pending');
});

test('admin deal detail fetches and renders farmer cycle status', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/admin/deals/${id}/cycles`, { headers })");
  expect(appJs).toContain('id="admin-cycles-list"');
  expect(appJs).toContain('Farmer Cycle Status');
  expect(appJs).toContain('renderCycleStatusCards(cycles)');
});

test('admin deal detail renders repayment recording form', () => {
  expect(appJs).toContain('Record Return');
  expect(appJs).toContain('id="admin-return-form"');
  expect(appJs).toContain('id="admin-return-amount"');
  expect(appJs).toContain('id="admin-return-note"');
  expect(appJs).toContain('Recording a return updates the admin ledger only. It does not execute a smart contract transfer.');
  expect(appJs).toContain('async function recordAdminReturn');
  expect(appJs).toContain("fetch(`${API_BASE}/api/admin/deals/${deal.id}/returns`");
});

test('admin deal detail fetches and renders return summary and ledger', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/admin/deals/${id}/return-summary`, { headers })");
  expect(appJs).toContain("fetch(`${API_BASE}/api/admin/deals/${id}/returns`, { headers })");
  expect(appJs).toContain('id="admin-return-summary"');
  expect(appJs).toContain('id="admin-returns-ledger"');
  expect(appJs).toContain('Return Summary');
  expect(appJs).toContain('Returns Ledger');
  expect(appJs).toContain('function renderAdminReturnSummary');
  expect(appJs).toContain('function renderReturnsLedgerRows');
  expect(appJs).toContain('Projected returns are estimates and are not guaranteed.');
});
