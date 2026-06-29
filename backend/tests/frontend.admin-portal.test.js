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

test('admin demo dashboard CTA stays inside public demo flow', () => {
  const body = functionBody('showAdminDemoPortal', 1800);
  expect(body).not.toContain('href="#deals"');
  expect(body).toContain('id="admin-demo-pilot-deals-btn"');
  expect(body).toContain('View Pilot Deals');
  expect(body).toContain('scrollIntoView');
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
  expect(appJs).toContain('Model-specific reserve rate (%)');
  expect(create).toContain("document.getElementById('admin-reserve-rate').value");
  expect(create).toContain("fetchAdminJson('/api/admin/deals'");
  expect(create).toContain('form.reset()');
  expect(create).toContain('Create deal failed:');
});

test('admin users screen creates pre-created platform accounts', () => {
  const route = appJs.slice(appJs.indexOf("if (hash === '#admin/users')"), appJs.indexOf("if (hash === '#admin/treasury')"));
  const screen = functionBody('showAdminUsersPortal', 5200);
  const create = functionBody('createPlatformUser', 2200);
  expect(route).toContain('showAdminUsersPortal()');
  expect(appJs).toContain('href="#admin/users"');
  expect(appJs).toContain('Create User');
  expect(screen).toContain('id="admin-user-form"');
  expect(screen).toContain('Create Platform User');
  expect(screen).toContain('These credentials are for pre-created platform accounts');
  expect(create).toContain("fetchAdminJson('/api/auth/register'");
  expect(create).toContain('near_account');
  expect(create).toContain('form.reset()');
  expect(create).toContain('Create user failed:');
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

test('admin return form offers optional Alpha-safe typed return choices', () => {
  const form = functionBody('renderAdminActions', 6500);
  expect(form).toContain('id="admin-return-type"');
  expect(form).toContain('<option value="principal">Principal</option>');
  expect(form).toContain('<option value="profit">Profit</option>');
  expect(form).toContain('<option value="fee">Fee</option>');
  expect(form).not.toContain('<option value="correction"');
  expect(form).toContain('Select type (optional)');
  expect(form).toContain('Type classifies the recorded off-chain return. It does not prove payment or reconciliation.');
});

test('admin return submit includes a selected type and preserves untyped payload compatibility', () => {
  const submit = functionBody('recordAdminReturn', 2400);
  expect(submit).toContain("document.getElementById('admin-return-type')?.value");
  expect(submit).toContain('const payload = { amount_near: amountNear, note }');
  expect(submit).toContain('if (entryType) payload.entry_type = entryType');
  expect(submit).toContain('body: JSON.stringify(payload)');
  expect(submit).not.toContain('payment_status');
  expect(submit).not.toContain('recorded_by');
  expect(submit).not.toContain('correction');
  expect(submit).toContain("showAdminActionResult('success', 'Return recorded successfully')");
  expect(submit).toContain('Record return failed:');
});

test('admin return ledger renders typed metadata and safe legacy labels', () => {
  const ledger = functionBody('renderReturnsLedgerRows', 6000);
  const typeLabels = functionBody('adminReturnTypeLabel', 700);
  const statusLabels = functionBody('adminReturnStatusLabel', 700);
  const evidence = functionBody('renderAdminReturnEvidence', 900);
  expect(ledger).toContain('Type');
  expect(ledger).toContain('Status');
  expect(ledger).toContain('Recorded By');
  expect(ledger).toContain('Evidence / Transaction Hash');
  expect(ledger).toContain('Actions');
  expect(ledger).toContain('Status History');
  expect(ledger).toContain('entry.entry_type');
  expect(ledger).toContain('entry.payment_status');
  expect(ledger).toContain('entry.recorded_by');
  expect(ledger).toContain('entry.transaction_hash');
  expect(typeLabels).toContain("'Legacy / Untyped'");
  expect(statusLabels).toContain("recorded: 'Recorded off-chain'");
  expect(evidence).toContain('testnet.nearblocks.io/txns/');
  expect(evidence).toContain('Reference only; not proof of payment or reconciliation');
});

test('admin return ledger exposes only contextual status transition actions', () => {
  const action = functionBody('adminReturnTransitionAction', 900);
  const controls = functionBody('renderAdminReturnTransitionControls', 1800);
  expect(action).toContain("recorded: { action: 'approve', label: 'Approve', endpoint: 'approve' }");
  expect(action).toContain("approved: { action: 'mark-paid', label: 'Mark Paid', endpoint: 'mark-paid' }");
  expect(action).toContain("paid: { action: 'reconcile', label: 'Reconcile', endpoint: 'reconcile' }");
  expect(action).not.toContain('reconciled:');
  expect(controls).toContain('No action');
  expect(controls).toContain('data-return-endpoint');
  expect(controls).toContain('Optional note');
  expect(controls).toContain('Evidence / Reference');
});

test('admin return transition posts note and evidence metadata to backend endpoints', () => {
  const payload = functionBody('getAdminReturnTransitionPayload', 1200);
  const run = functionBody('runAdminReturnTransition', 2200);
  expect(payload).toContain('payload.note = note');
  expect(payload).toContain('payload.evidence_metadata');
  expect(payload).toContain('transaction_hash: evidenceReference');
  expect(run).toContain('fetch(`${API_BASE}/api/admin/returns/${returnId}/${endpoint}`');
  expect(run).toContain("method: 'POST'");
  expect(run).toContain('jsonAuthHeaders()');
  expect(run).toContain('await refreshDeal(deal.id)');
  expect(run).toContain('Evidence / Reference remains unverified metadata');
  expect(run).toContain('failed: ${err.message}');
});

test('admin return status history fetches and renders explicit unavailable states', () => {
  const render = functionBody('renderAdminReturnStatusHistory', 1800);
  const load = functionBody('loadAdminReturnStatusHistory', 1800);
  expect(render).toContain('Status History unavailable until loaded.');
  expect(render).toContain('Status History unavailable.');
  expect(render).toContain('event.from_status');
  expect(render).toContain('event.to_status');
  expect(render).toContain('event.changed_by');
  expect(render).toContain('event.changed_at');
  expect(render).toContain('event.note');
  expect(load).toContain('fetch(`${API_BASE}/api/admin/returns/${returnId}/status-events`');
  expect(load).toContain('Malformed status history payload');
  expect(load).toContain('Status History unavailable:');
});

test('admin action binding includes return transitions and status history without breaking typed form', () => {
  const bind = functionBody('bindAdminActions', 1100);
  const form = functionBody('renderAdminActions', 6500);
  expect(bind).toContain('admin-return-transition-btn');
  expect(bind).toContain('runAdminReturnTransition(deal, btn)');
  expect(bind).toContain('admin-return-history-btn');
  expect(bind).toContain('loadAdminReturnStatusHistory');
  expect(bind).toContain('recordAdminReturn(event, deal)');
  expect(form).toContain('id="admin-return-type"');
});

test('typed return UI does not alter explicit admin demo detail', () => {
  const demo = functionBody('renderAdminDemoDealDetail', 5000);
  expect(demo).not.toContain('admin-return-type');
  expect(demo).not.toContain('entry_type');
  expect(demo).not.toContain('admin-return-transition-btn');
  expect(demo).toContain('Returns History');
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
