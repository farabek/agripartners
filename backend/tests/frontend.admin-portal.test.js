const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'app.js'), 'utf8');

function functionBody(name, length = 5000) {
  const start = appJs.indexOf(`function ${name}`);
  expect(start).toBeGreaterThan(-1);
  return appJs.slice(start, start + length);
}

test('admin portal and admin deals list are live-first', () => {
  expect(functionBody('showAdminPortal', 300)).toContain('showLiveAdminDashboard');
  expect(functionBody('showDeals', 500)).toContain('if (isAdmin())');
  expect(functionBody('showDeals', 500)).toContain('await showLiveAdminDashboard(el)');
  expect(functionBody('showLiveAdminDashboard')).toContain("fetch(`${API_BASE}/api/deals`");
  expect(appJs).not.toContain('ADMIN_DEMO_DATASET_ENABLED');
});

test('explicit admin pilot route remains available without becoming a live default', () => {
  expect(appJs).toContain("const adminPilot = hash.match(/^#deals\\/pilots\\/([a-z0-9-]+)$/)");
  expect(appJs).toContain('showAdminPilotDetail(adminPilot[1])');
  expect(appJs).toContain('function renderAdminDemoDealDetail');
  expect(functionBody('showLiveAdminDashboard', 1300)).not.toContain('buildAdminDemoDataset');
});

test('live dashboard has loading, zero-deal, auth, server, network and malformed JSON states', () => {
  const body = functionBody('showLiveAdminDashboard');
  expect(appJs).toContain('Loading live deals...');
  expect(body).toContain('data.length === 0');
  expect(body).toContain('No live deals yet');
  expect(body).toContain('Malformed deal list payload');
  expect(appJs).toContain("status === 401");
  expect(appJs).toContain("status === 403");
  expect(appJs).toContain('Invalid JSON from');
  expect(appJs).toContain("data-admin-dashboard-error");
});

test('admin create handles success, request errors, partial profile failures and empty lists', () => {
  const portal = functionBody('showAdminCreatePortal');
  const create = functionBody('createAdminDeal');
  expect(portal).toContain('Promise.allSettled');
  expect(portal).toContain("index === 0 ? 'Farmer' : 'Investor'");
  expect(portal).toContain('profiles unavailable:');
  expect(appJs).toContain('No farmer or investor profiles are available.');
  expect(create).toContain("fetchAdminJson('/api/admin/deals'");
  expect(create).toContain('form.reset()');
  expect(create).toContain('Create deal failed:');
});

test('deal detail bundle treats main deal as mandatory and optional resources independently', () => {
  const body = functionBody('fetchDealBundle', 6500);
  expect(body).toContain("if (settled[0].status === 'rejected') throw settled[0].reason");
  for (const resource of ['Status', 'Balances', 'Events', 'Cycles', 'Return summary', 'Returns']) {
    expect(body).toContain(`optionalResourceResult(settled[`);
    expect(appJs).toContain(`'${resource}'`);
  }
  expect(body).toContain('resourceErrors:');
  expect(appJs).toContain('Authentication required (HTTP 401).');
  expect(appJs).toContain('Admin access denied (HTTP 403).');
  expect(appJs).toContain('Malformed main deal payload');
});

test('optional failures render as unavailable and remain distinct from empty data', () => {
  expect(appJs).toContain('data-admin-resource-error');
  expect(appJs).toContain('No cycle updates yet');
  expect(appJs).toContain('No events');
  expect(appJs).toContain('No return summary data yet');
  expect(appJs).toContain('No returns recorded yet');
  expect(appJs).toContain("resourceErrors.events ? renderAdminResourceUnavailable('Events'");
  expect(appJs).toContain("resourceErrors.cycles ? renderAdminResourceUnavailable('Cycles'");
});

test('missing live DTO values render Unknown or Unavailable with no fabricated defaults', () => {
  const params = functionBody('renderParams', 2500);
  const summary = functionBody('renderAdminReturnSummary', 1800);
  expect(params).toContain("value == null ? 'Unknown'");
  expect(params).toContain("deal.total_cycles ?? 'Unknown'");
  expect(params).toContain('formatOptionalYoctoDisplay');
  expect(summary).toContain("projectedRoi == null ? 'Unknown'");
  expect(summary).not.toContain('?? 20');
  expect(appJs).not.toContain("status || 'Initialized'");
  expect(params).not.toContain('undefined%');
});

test('refresh reloads the mandatory deal and every dependent section', () => {
  const bundle = functionBody('fetchDealBundle', 3500);
  expect(bundle).toContain('fetchDealJson(base, headers)');
  for (const endpoint of ['/status', '/balances', '/events', '/cycles', '/return-summary', '/returns']) {
    expect(bundle).toContain(endpoint);
  }
  expect(functionBody('refreshDeal', 700)).toContain('await fetchDealBundle(id)');
});

test('cycle, report and return actions keep real backend success/error handling', () => {
  expect(appJs).toContain("url: `${base}/start-cycle`");
  expect(appJs).toContain("url: `${base}/report-cycle`");
  expect(appJs).toContain("fetch(`${API_BASE}/api/admin/deals/${deal.id}/returns`");
  expect(appJs).toContain('completed successfully');
  expect(appJs).toContain('Record return failed:');
  expect(appJs).toContain('failed: ${err.message}');
});

test('production disables fund-as and withdraw-as controls with a clear explanation', () => {
  expect(appJs).toContain('const IS_PRODUCTION_BUILD = import.meta.env.PROD');
  const body = functionBody('isProductionDisabledAdminAction', 700);
  expect(body).toContain("action === 'fund'");
  expect(body).toContain("action === 'withdraw-farmer'");
  expect(body).toContain("action === 'withdraw-investor'");
  expect(appJs).toContain('Fund-as and withdraw-as controls are disabled in production');
  expect(appJs).toContain("btn.dataset.productionDisabled === 'true'");
});
