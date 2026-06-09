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

test('admin deal detail fetches and renders farmer cycle status', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/admin/deals/${id}/cycles`, { headers })");
  expect(appJs).toContain('id="admin-cycles-list"');
  expect(appJs).toContain('Farmer Cycle Status');
  expect(appJs).toContain('renderCycleStatusCards(cycles)');
});
