const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'app.js'),
  'utf8'
);
const indexHtml = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'index.html'),
  'utf8'
);

function loadInvestorReturnMetricHelpers() {
  const start = appJs.indexOf('function numericReturnAmount');
  const end = appJs.indexOf('function renderInvestorReturnsManagement');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `${appJs.slice(start, end)}
    module.exports = { dealReturnMetrics, percentLabel };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

function loadInvestorMissingValueHelpers() {
  const start = appJs.indexOf('function formatNearDisplay');
  const end = appJs.indexOf('function renderActualVsProjectedRoi');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    function escapeHtml(value) { return String(value ?? ''); }
    ${appJs.slice(start, end)}
    module.exports = { renderInvestmentSummary, renderReturnsSummary, dealReturnMetrics };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

function loadMarketplaceHelpers() {
  const start = appJs.indexOf('const INVESTOR_DEMO_PILOTS');
  const end = appJs.indexOf('function showMarketplace');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    function numericReturnAmount(value) {
      const normalized = String(value ?? '0').replace(/[^0-9.-]/g, '');
      const amount = Number(normalized);
      return Number.isFinite(amount) ? amount : 0;
    }
    ${appJs.slice(start, end)}
    module.exports = { INVESTOR_DEMO_PILOTS, marketplaceDeals, filterMarketplaceDeals, marketplaceMetrics };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

function loadInvestorDashboardHelpers() {
  const start = appJs.indexOf('function investorMetrics');
  const end = appJs.indexOf('function investorPilotLabel');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    function escapeHtml(value) { return String(value ?? ''); }
    function parseNearAmount(value) {
      if (value == null || value === '') return null;
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    function formatNearAmount(value) {
      if (value == null || !Number.isFinite(Number(value))) return 'Unavailable';
      return \`\${value.toFixed(2)} NEAR\`;
    }
    function formatUsdAmount(value) {
      const amount = Number.parseFloat(value);
      if (!Number.isFinite(amount)) return 'Unavailable';
      return \`$\${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}\`;
    }
    function sumNearFields(deals, field) {
      if (!deals.length) return 0;
      const values = deals.map(deal => parseNearAmount(deal[field]));
      return values.some(value => value == null) ? null : values.reduce((sum, value) => sum + value, 0);
    }
    function sumInvestedAmount(deals) {
      if (!deals.length) return 0;
      const values = deals.map(deal => parseNearAmount(deal.amount ?? deal.invested_amount ?? deal.investment_amount));
      return values.some(value => value == null) ? null : values.reduce((sum, value) => sum + value, 0);
    }
    function numericReturnAmount(value) {
      const normalized = String(value ?? '0').replace(/[^0-9.-]/g, '');
      const amount = Number(normalized);
      return Number.isFinite(amount) ? amount : 0;
    }
    function deriveReturnStatus(deal) {
      if (deal.return_status) return deal.return_status;
      const rawReturned = deal.display_returned_amount ?? deal.returned_amount;
      const rawExpected = deal.display_expected_return ?? deal.expected_return;
      if (rawReturned == null || rawExpected == null) return 'unknown';
      const returned = numericReturnAmount(rawReturned);
      const expected = numericReturnAmount(rawExpected);
      if (returned <= 0) return 'no_returns';
      if (returned < expected) return 'partial';
      return 'completed';
    }
    function returnDisclaimer() { return ''; }
    function renderEmptyDashboardSection(message) { return '<div>' + message + '</div>'; }
    ${appJs.slice(start, end)}
    module.exports = {
      investorMetrics,
      renderInvestorMetrics,
      renderPortfolioPerformance,
      investorAttentionState,
      renderInvestorAttention,
      renderRecentActivity,
      returnCompletionRate,
    };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

function loadInvestorLiveDataHelpers(fetchImpl = jest.fn()) {
  const start = appJs.indexOf('async function enrichDealsForInvestor');
  const end = appJs.indexOf('function parseNearAmount');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    const API_BASE = 'https://api.example.test';
    function authHeaders() { return { Authorization: 'Bearer test' }; }
    ${appJs.slice(start, end)}
    module.exports = {
      enrichDealsForInvestor,
      normalizeInvestorDealsPayload,
      normalizeInvestorDeal,
    };
  `;
  const module = { exports: {} };
  Function('module', 'fetch', helpers)(module, fetchImpl);
  return module.exports;
}

function loadInvestorModeHelpers() {
  const start = appJs.indexOf('function normalizeInvestorDashboardMode');
  const end = appJs.indexOf('function renderNoWalletInvestorDashboard');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    const INVESTOR_DASHBOARD_MODE_LIVE = 'live';
    const INVESTOR_DASHBOARD_MODE_DEMO = 'demo';
    ${appJs.slice(start, end)}
    module.exports = { normalizeInvestorDashboardMode };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

function testResponse(status, payload, { invalidJson = false } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: invalidJson
      ? async () => { throw new Error('invalid json'); }
      : async () => payload,
  };
}

function successfulInvestorDetailPayload(url) {
  if (url.endsWith('/status')) return { status: 'CycleActive', current_cycle: 2 };
  if (url.endsWith('/balances')) return { investor: '1000' };
  if (url.endsWith('/events')) return [{ event_type: 'CycleStarted' }];
  if (url.endsWith('/cycles')) return [{ cycle_number: 2 }];
  if (url.endsWith('/reports')) return { reports: [{ title: 'Report' }] };
  if (url.endsWith('/returns')) return [{ amount_near: '1' }];
  return { id: 7, title: 'Live Deal', amount: '10' };
}

function loadInvestorDealBundleHelpers(fetchImpl, clearAuthMock = jest.fn()) {
  const start = appJs.indexOf('async function fetchInvestorDealBundle');
  const end = appJs.indexOf('function renderInvestorDealAccessMessage');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    const API_BASE = 'https://api.example.test';
    function authHeaders() { return { Authorization: 'Bearer test' }; }
    const clearAuth = clearAuthMock;
    ${appJs.slice(start, end)}
    module.exports = { fetchInvestorDealBundle };
  `;
  const module = { exports: {} };
  Function('module', 'fetch', 'clearAuthMock', helpers)(module, fetchImpl, clearAuthMock);
  return module.exports;
}

function loadInvestorProjectProfileHelper() {
  const start = appJs.indexOf('function investorProjectProfile');
  const end = appJs.indexOf('function renderProjectProfile');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    function getPilotForDeal() {
      return {
        title: 'Static Fidlot Title', investment: '$50,000', roi: '64%',
        apr: '21.9%', cycles: '7', description: 'Static pilot description'
      };
    }
    function formatNearDisplay(value) { return \`\${value} NEAR\`; }
    ${appJs.slice(start, end)}
    module.exports = { investorProjectProfile };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

function loadLiveFundingHelper() {
  const start = appJs.indexOf('function liveFundingProgressMetrics');
  const end = appJs.indexOf('function renderLiveFundingProgressPanel');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    function numericReturnAmount(value) {
      const amount = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
      return Number.isFinite(amount) ? amount : 0;
    }
    function fundingDisplayAmount(value, currency) {
      return currency === 'USD' ? \`$\${value}\` : \`\${value.toFixed(2)} NEAR\`;
    }
    ${appJs.slice(start, end)}
    module.exports = { liveFundingProgressMetrics };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

function loadRefreshInvestorDealHelper(bundle) {
  const start = appJs.indexOf('async function refreshInvestorDeal');
  const end = appJs.indexOf('// --- Deal detail ---');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const elements = new Map();
  const ids = [
    'btn-investor-refresh', 'investor-deal-title', 'investor-status-badge', 'investor-cycle-text',
    'investor-project-profile', 'investor-funding-progress', 'investor-technical-data',
    'investor-events-list', 'investor-reports-list', 'investor-cycles-list',
    'investor-investment-summary', 'investor-returns-summary', 'investor-roi-progress',
    'investor-actual-vs-projected-roi', 'investor-returns-list', 'investor-available-balance',
  ];
  ids.forEach(id => elements.set(id, { id, innerHTML: '', outerHTML: '', textContent: '', disabled: false }));
  const documentMock = { getElementById: id => elements.get(id) || null };
  const helpers = `
    const document = documentMock;
    async function fetchInvestorDealBundle() { return bundle; }
    function investorProjectProfile(deal) { return { title: deal.title }; }
    function statusBadge(value) { return \`status:\${value}\`; }
    function renderProjectProfile(deal) { return \`profile:\${deal.title}\`; }
    function renderLiveFundingProgressPanel(deal) { return \`funding:\${deal.title}\`; }
    function renderInvestorDealParams(deal) { return \`technical:\${deal.title}\`; }
    function renderInvestorResourceUnavailable(label, error) { return \`error:\${label}:\${error}\`; }
    function renderEvents(value) { return \`events:\${value.length}\`; }
    function renderInvestorReports(value) { return \`reports:\${value.length}\`; }
    function renderCycleStatusCards(value) { return \`cycles:\${value.length}\`; }
    function renderInvestmentSummary(deal) { return \`summary:\${deal.title}\`; }
    function renderReturnsSummary(deal) { return \`returns-summary:\${deal.title}\`; }
    function renderRoiProgressCard(deal) { return \`roi:\${deal.title}\`; }
    function renderActualVsProjectedRoi(deal) { return \`actual:\${deal.title}\`; }
    function renderRepaymentHistory(value) { return \`returns:\${value.length}\`; }
    function yoctoToNear(value) { return String(value); }
    function formatYoctoRaw(value) { return String(value); }
    function showInvestorActionResult() {}
    ${appJs.slice(start, end)}
    module.exports = { refreshInvestorDeal };
  `;
  const module = { exports: {} };
  Function('module', 'documentMock', 'bundle', helpers)(module, documentMock, bundle);
  return { ...module.exports, elements };
}

function loadWithdrawInvestorHelper(fetchImpl) {
  const start = appJs.indexOf('async function withdrawInvestorFromPortal');
  const end = appJs.indexOf('async function refreshInvestorDeal');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const actionResult = jest.fn();
  const refresh = jest.fn().mockResolvedValue(undefined);
  const clearAuthMock = jest.fn();
  const button = { disabled: false, textContent: '' };
  const helpers = `
    const API_BASE = 'https://agripartners-zlp2.onrender.com';
    function confirm() { return true; }
    const document = { getElementById: () => button };
    function jsonAuthHeaders() { return {}; }
    const showInvestorActionResult = actionResult;
    const refreshInvestorDeal = refresh;
    const clearAuth = clearAuthMock;
    ${appJs.slice(start, end)}
    module.exports = { withdrawInvestorFromPortal };
  `;
  const module = { exports: {} };
  Function('module', 'fetch', 'button', 'actionResult', 'refresh', 'clearAuthMock', helpers)(
    module, fetchImpl, button, actionResult, refresh, clearAuthMock
  );
  return { ...module.exports, actionResult, refresh, button };
}

function loadFundingProgressHelpers() {
  const start = appJs.indexOf('function dealStatusName');
  const end = appJs.indexOf('const INVESTOR_DEMO_PILOTS');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    function escapeHtml(value) { return String(value ?? ''); }
    function formatNearAmount(value) {
      return \`\${value.toFixed(2)} NEAR\`;
    }
    function formatUsdAmount(value) {
      const amount = Number.parseFloat(value);
      if (!Number.isFinite(amount)) return '$0';
      return \`$\${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}\`;
    }
    function numericReturnAmount(value) {
      const normalized = String(value ?? '0').replace(/[^0-9.-]/g, '');
      const amount = Number(normalized);
      return Number.isFinite(amount) ? amount : 0;
    }
    ${appJs.slice(start, end)}
    module.exports = {
      fundingProgressMetrics,
      renderFundingProgressCompact,
      renderFundingProgressPanel,
    };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

test('marketplace route and navigation are rendered', () => {
  expect(indexHtml).toContain('id="view-marketplace"');
  expect(appJs).toContain("'view-marketplace'");
  expect(appJs).toContain("hash === '#/marketplace'");
  expect(appJs).toContain('showMarketplace();');
  expect(appJs).toContain('href="#/marketplace"');
  expect(appJs).toContain('Investor Portal');
  expect(appJs).toContain('Marketplace');
  expect(appJs).toContain('Farmer Portal');
  expect(appJs).toContain('Admin Portal');
});

test('marketplace filters pilot deals on the frontend', () => {
  const { marketplaceDeals, filterMarketplaceDeals, marketplaceMetrics } = loadMarketplaceHelpers();
  const deals = marketplaceDeals();

  expect(deals.map((deal) => deal.title)).toEqual([
    'Fidlot Livestock Project',
    'Hissar Sheep Breeding Project',
  ]);
  expect(filterMarketplaceDeals(deals, 'all')).toHaveLength(2);
  expect(filterMarketplaceDeals(deals, 'active').map((deal) => deal.title)).toEqual(['Hissar Sheep Breeding Project']);
  expect(filterMarketplaceDeals(deals, 'completed').map((deal) => deal.title)).toEqual(['Fidlot Livestock Project']);
  expect(filterMarketplaceDeals(deals, 'pilot')).toHaveLength(2);
  expect(marketplaceMetrics(deals)).toEqual(expect.objectContaining({
    totalDeals: 2,
    activeDeals: 1,
    completedDeals: 1,
  }));
});

test('marketplace deal cards navigate to investor pilot detail pages', () => {
  expect(appJs).toContain('function renderMarketplaceDealCard');
  expect(appJs).toContain('href="#/investor/pilots/${deal.key}"');
  expect(appJs).toContain("hash.match(/^#\\/?investor\\/pilots\\/([a-z0-9-]+)$/)");
});

test('marketplace deal cards render compact funding progress', () => {
  expect(appJs).toContain('function renderFundingProgressCompact');
  expect(appJs).toContain('function renderFundingProgressBar');
  expect(appJs).toContain('function fundingProgressMetrics');
  expect(appJs).toContain('Funding Progress');
  expect(appJs).toContain('Funding Goal');
  expect(appJs).toContain('Amount Raised');
  expect(appJs).toContain('Remaining Amount');
  expect(appJs).toContain('Funding Percentage');
  expect(appJs).toContain('Investor Count');
  expect(appJs).toContain('Days Remaining');
  expect(appJs).toContain('${renderFundingProgressCompact(deal)}');
  expect(appJs).toContain('funding-progress-track');
  expect(appJs).toContain('funding-progress-fill');
});

test('investor detail fetches farmer cycle reporting endpoint', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${id}/cycles`, { headers })");
  expect(appJs).toContain("readOptionalInvestorResource(cyclesRes, 'Cycle status', normalizeInvestorCyclesPayload, [])");
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
  expect(appJs).toContain('Projected Return');
  expect(appJs).toContain('Returned Amount');
  expect(appJs).toContain('Outstanding Return');
  expect(appJs).toContain('Return Status');
  expect(appJs).toContain('function deriveReturnStatus');
  expect(appJs).toContain("if (returned <= 0) return 'no_returns'");
  expect(appJs).toContain("if (returned < expected) return 'partial'");
  expect(appJs).toContain("return 'completed'");
  expect(appJs).toContain("partial: 'Partial return'");
  expect(appJs).toContain("completed: 'Completed'");
  expect(appJs).toContain('ROI');
  expect(appJs).toContain('Projected ROI');
  expect(appJs).toContain('Projected returns are estimates and are not guaranteed.');
});

test('investor detail renders ROI and returns management sections', () => {
  expect(appJs).toContain('Returns Summary');
  expect(appJs).toContain('id="investor-returns-summary"');
  expect(appJs).toContain('function renderReturnsSummary');
  expect(appJs).toContain('ROI Progress');
  expect(appJs).toContain('id="investor-roi-progress"');
  expect(appJs).toContain('Total Cash Returned / Projected Total Payout');
  expect(appJs).toContain('Completion Percent');
  expect(appJs).toContain('Actual vs Projected ROI');
  expect(appJs).toContain('id="investor-actual-vs-projected-roi"');
  expect(appJs).toContain('Realized ROI');
  expect(appJs).toContain('Remaining ROI');
  expect(appJs).toContain('Returns Ledger');
  expect(appJs).toContain('<th class="text-left py-2 pr-3">Note</th>');
  expect(appJs).toContain('No returns recorded yet.');
  expect(appJs).toContain('Projected returns are estimates and are not guaranteed.');
});

test('investor deal bundle loads all live resources successfully', async () => {
  const fetchImpl = jest.fn(url => Promise.resolve(testResponse(200, successfulInvestorDetailPayload(url))));
  const { fetchInvestorDealBundle } = loadInvestorDealBundleHelpers(fetchImpl);

  const bundle = await fetchInvestorDealBundle(7);

  expect(fetchImpl).toHaveBeenCalledTimes(7);
  expect(bundle.deal).toEqual(expect.objectContaining({ id: 7, title: 'Live Deal' }));
  expect(bundle.status).toEqual({ status: 'CycleActive', current_cycle: 2 });
  expect(bundle.balances).toEqual({ investor: '1000' });
  expect(bundle.events).toHaveLength(1);
  expect(bundle.cycles).toHaveLength(1);
  expect(bundle.reports).toHaveLength(1);
  expect(bundle.returns).toHaveLength(1);
  expect(bundle.resourceErrors).toEqual({
    status: null, balances: null, events: null, cycles: null,
    reports: null, returns: null,
  });
});

test.each([
  ['401', () => Promise.resolve(testResponse(401, {})), 'wallet session expired'],
  ['404', () => Promise.resolve(testResponse(404, {})), 'Investor deal not found'],
  ['500', () => Promise.resolve(testResponse(500, {})), 'Investor deal unavailable (HTTP 500)'],
  ['network failure', () => Promise.reject(new Error('offline')), 'network unavailable'],
  ['invalid JSON', () => Promise.resolve(testResponse(200, null, { invalidJson: true })), 'invalid JSON'],
])('mandatory investor deal request exposes %s errors', async (_name, mainResponse, expected) => {
  const fetchImpl = jest.fn(url => url.endsWith('/deals/7')
    ? mainResponse()
    : Promise.resolve(testResponse(200, successfulInvestorDetailPayload(url))));
  const clearAuthMock = jest.fn();
  const { fetchInvestorDealBundle } = loadInvestorDealBundleHelpers(fetchImpl, clearAuthMock);

  await expect(fetchInvestorDealBundle(7)).rejects.toThrow(expected);
  if (_name === '401') expect(clearAuthMock).toHaveBeenCalledTimes(1);
});

test.each([
  ['/status', 'status', 'Contract status unavailable (HTTP 500)'],
  ['/balances', 'balances', 'Contract balances unavailable (HTTP 500)'],
  ['/events', 'events', 'Event history unavailable (HTTP 500)'],
  ['/cycles', 'cycles', 'Cycle status unavailable (HTTP 500)'],
  ['/reports', 'reports', 'Farmer reports unavailable (HTTP 500)'],
  ['/returns', 'returns', 'Returns ledger unavailable (HTTP 500)'],
])('optional investor resource %s fails independently', async (suffix, errorKey, expectedError) => {
  const fetchImpl = jest.fn(url => Promise.resolve(
    url.endsWith(suffix)
      ? testResponse(500, {})
      : testResponse(200, successfulInvestorDetailPayload(url))
  ));
  const { fetchInvestorDealBundle } = loadInvestorDealBundleHelpers(fetchImpl);

  const bundle = await fetchInvestorDealBundle(7);

  expect(bundle.deal.id).toBe(7);
  expect(bundle.resourceErrors[errorKey]).toBe(expectedError);
  expect(bundle[errorKey]).toEqual(['events', 'cycles', 'reports', 'returns'].includes(errorKey) ? [] : null);
});

test('optional auth failure is retained as a visible section error', async () => {
  const fetchImpl = jest.fn(url => Promise.resolve(
    url.endsWith('/status')
      ? testResponse(401, {})
      : testResponse(200, successfulInvestorDetailPayload(url))
  ));
  const clearAuthMock = jest.fn();
  const { fetchInvestorDealBundle } = loadInvestorDealBundleHelpers(fetchImpl, clearAuthMock);

  const bundle = await fetchInvestorDealBundle(7);

  expect(bundle.resourceErrors.status).toContain('authorization failed');
  expect(clearAuthMock).toHaveBeenCalledTimes(1);
});

test('empty optional data and optional request errors remain distinct', async () => {
  const emptyFetch = jest.fn(url => Promise.resolve(testResponse(200,
    url.endsWith('/reports') ? { reports: [] } : (url.endsWith('/deals/7') || url.endsWith('/status') || url.endsWith('/balances')
      ? successfulInvestorDetailPayload(url) : []))));
  const failedFetch = jest.fn(url => Promise.resolve(
    url.endsWith('/events') ? testResponse(503, {}) : testResponse(200, successfulInvestorDetailPayload(url))
  ));

  const emptyBundle = await loadInvestorDealBundleHelpers(emptyFetch).fetchInvestorDealBundle(7);
  const failedBundle = await loadInvestorDealBundleHelpers(failedFetch).fetchInvestorDealBundle(7);

  expect(emptyBundle.events).toEqual([]);
  expect(emptyBundle.resourceErrors.events).toBeNull();
  expect(failedBundle.events).toEqual([]);
  expect(failedBundle.resourceErrors.events).toContain('HTTP 503');
});

test('malformed optional responses do not crash the live detail bundle', async () => {
  const fetchImpl = jest.fn(url => Promise.resolve(
    url.endsWith('/reports')
      ? testResponse(200, { reports: [null] })
      : testResponse(200, successfulInvestorDetailPayload(url))
  ));
  const { fetchInvestorDealBundle } = loadInvestorDealBundleHelpers(fetchImpl);

  const bundle = await fetchInvestorDealBundle(7);

  expect(bundle.reports).toEqual([]);
  expect(bundle.resourceErrors.reports).toBe('Farmer reports returned malformed data');
});

test('invalid optional JSON becomes a section error without blocking the deal', async () => {
  const fetchImpl = jest.fn(url => Promise.resolve(
    url.endsWith('/returns')
      ? testResponse(200, null, { invalidJson: true })
      : testResponse(200, successfulInvestorDetailPayload(url))
  ));
  const { fetchInvestorDealBundle } = loadInvestorDealBundleHelpers(fetchImpl);

  const bundle = await fetchInvestorDealBundle(7);

  expect(bundle.deal.id).toBe(7);
  expect(bundle.returns).toEqual([]);
  expect(bundle.resourceErrors.returns).toBe('Returns ledger returned invalid JSON');
});

test('live Fidlot-like deal never receives static pilot profile values', () => {
  const { investorProjectProfile } = loadInvestorProjectProfileHelper();
  const live = investorProjectProfile({
    id: 7,
    title: 'Fidlot Livestock Project',
    amount: '12',
    description: null,
    projected_roi_pct: null,
    total_cycles: null,
  }, null);

  expect(live).toEqual(expect.objectContaining({
    title: 'Fidlot Livestock Project',
    investment: '12 NEAR',
    roi: 'Unavailable',
    apr: 'Unavailable',
    cycles: 'Unavailable',
    description: 'Unavailable',
    status: 'Unknown',
  }));
  expect(live.title).not.toBe('Static Fidlot Title');
  expect(live.investment).not.toBe('$50,000');
});

test('explicit demo pilot profile still uses the preserved pilot mapping', () => {
  const { investorProjectProfile } = loadInvestorProjectProfileHelper();
  const demo = investorProjectProfile({ isDemoPilot: true }, { status: 'Completed' });

  expect(demo).toEqual(expect.objectContaining({
    title: 'Static Fidlot Title',
    investment: '$50,000',
    roi: '64%',
    apr: '21.9%',
    status: 'Completed',
  }));
  expect(appJs).toContain('showInvestorPilotProfile(investorPilot[1])');
});

test('live funding metrics never invent percentages or deadlines', () => {
  const { liveFundingProgressMetrics } = loadLiveFundingHelper();
  const missing = liveFundingProgressMetrics({ amount: '50' });

  expect(missing).toEqual(expect.objectContaining({
    displayGoal: '50.00 NEAR',
    displayRaised: 'Unavailable',
    displayRemaining: 'Unavailable',
    displayPercentage: 'Unavailable',
    percentage: null,
    investorCount: 'Unavailable',
    daysRemaining: 'Unavailable',
  }));
});

test('missing live financial DTO fields render Unknown or Unavailable', () => {
  const { renderInvestmentSummary, renderReturnsSummary, dealReturnMetrics } = loadInvestorMissingValueHelpers();
  const deal = { id: 7, projected_roi_pct: null, expected_return: null, returned_amount: null };

  const investment = renderInvestmentSummary(deal);
  const returns = renderReturnsSummary(deal);
  const metrics = dealReturnMetrics(deal);

  expect(investment).toContain('Unavailable');
  expect(investment).toContain('Unknown');
  expect(investment).not.toContain('20%');
  expect(returns).toContain('Unavailable');
  expect(metrics.projectedRoi).toBeNull();
  expect(metrics.completionPercent).toBeNull();
});

test('live route has no automatic demo fallback', () => {
  const liveStart = appJs.indexOf('async function showInvestorDeal');
  const bundleStart = appJs.indexOf('async function fetchInvestorDealBundle');
  const liveSource = appJs.slice(liveStart, bundleStart);

  expect(liveSource).not.toContain('getPilotForDeal');
  expect(liveSource).not.toContain('INVESTOR_DEMO_PILOTS');
  expect(liveSource).not.toContain('renderInvestorDemoDealDetail');
});

test('investor return metrics use profit-based actual ROI for completed Fidlot-like case', () => {
  const { dealReturnMetrics, percentLabel } = loadInvestorReturnMetricHelpers();

  const metrics = dealReturnMetrics({
    display_amount: '$50,000',
    display_expected_return: '$82,000',
    display_returned_amount: '$82,000',
    projected_roi_pct: 64,
  });

  expect(percentLabel(metrics.actualRoi)).toBe('64.0%');
  expect(percentLabel(metrics.remainingRoi)).toBe('0.0%');
  expect(percentLabel(metrics.completionPercent)).toBe('100.0%');
});

test('investor return metrics show zero actual ROI for no-return Hissar-like case', () => {
  const { dealReturnMetrics, percentLabel } = loadInvestorReturnMetricHelpers();

  const metrics = dealReturnMetrics({
    display_amount: '$50,000',
    display_expected_return: '$81,650',
    display_returned_amount: '$0',
    projected_roi_pct: 63.3,
  });

  expect(percentLabel(metrics.actualRoi)).toBe('0.0%');
  expect(percentLabel(metrics.remainingRoi)).toBe('63.3%');
  expect(percentLabel(metrics.completionPercent)).toBe('0.0%');
});

test('investor return metrics keep progress based on returned over projected return', () => {
  const { dealReturnMetrics, percentLabel } = loadInvestorReturnMetricHelpers();

  const metrics = dealReturnMetrics({
    display_amount: '$50,000',
    display_expected_return: '$82,000',
    display_returned_amount: '$60,000',
    projected_roi_pct: 64,
  });

  expect(percentLabel(metrics.actualRoi)).toBe('20.0%');
  expect(percentLabel(metrics.remainingRoi)).toBe('44.0%');
  expect(percentLabel(metrics.completionPercent)).toBe('73.2%');
});

test('investor return metrics floor remaining ROI at zero when actual reaches projected ROI', () => {
  const { dealReturnMetrics, percentLabel } = loadInvestorReturnMetricHelpers();

  const metrics = dealReturnMetrics({
    display_amount: '$50,000',
    display_expected_return: '$82,000',
    display_returned_amount: '$90,000',
    projected_roi_pct: 64,
  });

  expect(percentLabel(metrics.actualRoi)).toBe('80.0%');
  expect(percentLabel(metrics.remainingRoi)).toBe('0.0%');
  expect(percentLabel(metrics.completionPercent)).toBe('100.0%');
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
  expect(appJs).toContain("roiLabel: projectStatus === 'Completed' ? 'ROI' : 'Projected ROI'");
  expect(appJs).toContain('Livestock fattening operation based on a real pilot agricultural agreement');
  expect(appJs).toContain('Sheep breeding operation based on a real pilot agricultural agreement');
  expect(appJs).toContain('Technical Deal Data');
  expect(appJs).toContain('Deal #${escapeHtml(deal.id)}');
  expect(appJs).toContain('function getPilotForDeal');
  expect(appJs).toContain('function pilotKeyFromText');
  expect(appJs).not.toContain('[1, 7].includes');
  expect(appJs).not.toContain('[2, 8].includes');
});

test('investor home dashboard renders MVP metrics and preserves its sections', () => {
  expect(appJs).toContain('function investorMetrics');
  expect(appJs).toContain('Investor Analytics Dashboard');
  expect(appJs).toContain('Portfolio performance, pilot deals, returns, and reporting visibility.');
  expect(appJs).toContain('Portfolio Summary');
  expect(appJs).toContain('Projected Total Payout');
  expect(appJs).toContain('Total Cash Returned');
  expect(appJs).toContain('Outstanding Payout');
  expect(appJs).toContain('Calculated Realized Profit');
  expect(appJs).toContain('Capital Returned %');
  expect(appJs).toContain('Average ROI');
  expect(appJs).toContain('Active Deals');
  expect(appJs).toContain('Completed Deals');
  expect(appJs).toContain('Active Investments');
  expect(appJs).toContain('Completed Investments');
  expect(appJs).toContain('Fidlot Livestock Project');
  expect(appJs).toContain('Hissar Sheep Breeding Project');
  expect(appJs).toContain('21.9%');
  expect(appJs).toContain('21.1%');
  expect(appJs).toContain("const roiLabel = status === 'Completed' ? 'ROI' : 'Projected ROI'");
  expect(appJs).not.toContain('Greenhouse Project');
  expect(appJs).not.toContain('Poultry Farm');
  expect(appJs).not.toContain('Cotton Farm');
  expect(appJs).not.toContain('Demo Portfolio');
  expect(appJs).not.toContain('INVESTOR_DEMO_DATASET_ENABLED');
  const livePortalSource = appJs.slice(appJs.indexOf('async function showInvestorPortal'), appJs.indexOf('function renderNoWalletInvestorDashboard'));
  expect(livePortalSource).not.toContain('buildInvestorDemoDataset');
  expect(livePortalSource).not.toContain('Demo Mode');
  expect(appJs).toContain('Financial view in USD');
  expect(appJs).not.toContain('Demo financial view in USD');
  expect(appJs).toContain('displayTotalInvested');
  expect(appJs).toContain('displayExpectedReturns');
});

test('live investor dashboard has no demo controls or static dataset entry', () => {
  const liveStart = appJs.indexOf('async function showInvestorPortal');
  const liveEnd = appJs.indexOf('function renderNoWalletInvestorDashboard');
  const liveSource = appJs.slice(liveStart, liveEnd);

  expect(liveSource).toContain('fetch(`${API_BASE}/api/investor/deals`');
  expect(liveSource).not.toContain('buildInvestorDemoDataset');
  expect(appJs).not.toContain('data-investor-dashboard-mode');
  expect(appJs).not.toContain('investor-dashboard-mode');
  expect(appJs).toContain('showInvestorPilotProfile(investorPilot[1])');
});

test('live mode has explicit error and empty portfolio states without demo fallback', () => {
  expect(appJs).toContain('Investor Portal unavailable: ${e.message}');
  expect(appJs).toContain('No active investments found for connected wallet account:');
  expect(appJs).not.toContain('Featured pilot profiles are available in explicit Demo Mode.');
  expect(appJs).not.toContain('INVESTOR_DEMO_DATASET_ENABLED');
});

test('live deal payload normalization handles missing and null fields safely', () => {
  const { normalizeInvestorDealsPayload } = loadInvestorLiveDataHelpers();
  const deals = normalizeInvestorDealsPayload([{
    id: 7,
    status: null,
    amount: null,
    projected_roi_pct: null,
  }]);

  expect(deals).toEqual([expect.objectContaining({
    id: 7,
    amount: null,
    expected_return: null,
    returned_amount: null,
    outstanding_amount: null,
    projected_roi_pct: null,
    status: { status: 'Unknown' },
    balances: null,
  })]);
  expect(() => normalizeInvestorDealsPayload({ deals: [] })).toThrow('Investor deals response is not a list');
});

test('per-deal enrichment keeps the live deal when optional requests partially fail', async () => {
  const fetchImpl = jest.fn(url => {
    if (url.endsWith('/7')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => ({ title: 'Live Deal', amount: null }) });
    }
    if (url.endsWith('/status')) return Promise.reject(new Error('RPC unavailable'));
    return Promise.resolve({ ok: false, status: 503, json: async () => ({}) });
  });
  const { enrichDealsForInvestor } = loadInvestorLiveDataHelpers(fetchImpl);

  const deals = await enrichDealsForInvestor([{ id: 7, status: 'Active', amount: '10' }]);

  expect(deals).toHaveLength(1);
  expect(deals[0]).toEqual(expect.objectContaining({
    id: 7,
    title: 'Live Deal',
    amount: '10',
    status: { status: 'Active' },
    enrichment_warnings: [
      'contract status unavailable',
      'contract balances unavailable (HTTP 503)',
    ],
  }));
});

test('per-deal authorization failure remains an explicit live mode error', async () => {
  const fetchImpl = jest.fn(url => Promise.resolve({
    ok: !url.endsWith('/7'),
    status: url.endsWith('/7') ? 401 : 200,
    json: async () => ({}),
  }));
  const { enrichDealsForInvestor } = loadInvestorLiveDataHelpers(fetchImpl);

  await expect(enrichDealsForInvestor([{ id: 7 }]))
    .rejects.toThrow('Investor authorization failed while loading deal details');
});

test('investor analytics dashboard renders Phase 9 analytics sections', () => {
  const dashboardSource = appJs.slice(appJs.indexOf('function renderInvestorDashboard'), appJs.indexOf('function renderDashboardSection'));
  expect(appJs).toContain('Portfolio Performance');
  expect(appJs).toContain('Recent Activity');
  expect(dashboardSource).not.toContain('ROI & Returns Overview');
  expect(dashboardSource).not.toContain('Deal Performance');
  expect(appJs).toContain('Projected Total Payout');
  expect(appJs).toContain('Total Cash Returned');
  expect(appJs).toContain('Outstanding Payout');
  expect(appJs).toContain('Return Completion Rate');
  expect(appJs).toContain('Average Projected ROI');
  expect(appJs).toContain('Return Status');
  expect(appJs).toContain('Reporting Information');
  expect(appJs).toContain('Reports visible in deal detail');
  expect(appJs).toContain('Cycle status visible');
  expect(appJs).toContain('Event history available');
  expect(appJs).toContain('Farmer reports available');
  expect(appJs).toContain('Available in deal detail');
  expect(appJs).toContain('Attention Required');
  expect(appJs).toContain('No authoritative attention signals are available');
  expect(dashboardSource).not.toContain('Portfolio Health');
  expect(dashboardSource).not.toContain('Risk / Attention Panel');
  expect(appJs).toContain('View Deal');
});

test('funding progress metrics derive demo-safe marketplace values', () => {
  const { fundingProgressMetrics } = loadFundingProgressHelpers();

  const activeFunding = fundingProgressMetrics({
    key: 'hissar',
    status: 'Active',
    investment: '$50,000',
  });

  expect(activeFunding.displayGoal).toBe('$50,000');
  expect(activeFunding.displayRaised).toBe('$32,000');
  expect(activeFunding.displayRemaining).toBe('$18,000');
  expect(activeFunding.fundingPercentage).toBe(64);
  expect(activeFunding.investorCount).toBe(1);
  expect(activeFunding.daysRemaining).toBe(14);

  const completedFunding = fundingProgressMetrics({
    key: 'fidlot',
    status: 'Completed',
    investment: '$50,000',
  });

  expect(completedFunding.displayRaised).toBe('$50,000');
  expect(completedFunding.fundingPercentage).toBe(100);
  expect(completedFunding.daysRemaining).toBe(0);
});

test('investor deal detail renders full funding progress panel', () => {
  const { renderFundingProgressCompact, renderFundingProgressPanel } = loadFundingProgressHelpers();

  const compact = renderFundingProgressCompact({
    isDemoPilot: true,
    status: 'Active',
    display_amount: '$50,000',
  });
  expect(compact).toContain('$32,000 / $50,000');
  expect(compact).toContain('64% Funded');
  expect(compact).toContain('funding-progress-track');

  const panel = renderFundingProgressPanel({
    isDemoPilot: true,
    status: 'Active',
    display_amount: '$50,000',
  });
  expect(panel).toContain('Funding Progress');
  expect(panel).toContain('Funding Goal');
  expect(panel).toContain('Amount Raised');
  expect(panel).toContain('Remaining Amount');
  expect(panel).toContain('Funding Percentage');
  expect(panel).toContain('Investor Count');
  expect(panel).toContain('Days Remaining');
});

test('investor portfolio metrics calculate profit and percentages safely', () => {
  const { investorMetrics, returnCompletionRate } = loadInvestorDashboardHelpers();
  const metrics = investorMetrics([
    {
      amount: '50000.00',
      expected_return: '82000.00',
      returned_amount: '82000.00',
      outstanding_amount: '0.00',
      display_currency: 'USD',
      roi_percent: 64,
      return_status: 'completed',
      status: { status: 'Completed', current_cycle: 7 },
    },
    {
      amount: '50000.00',
      expected_return: '81650.00',
      returned_amount: '0.00',
      outstanding_amount: '81650.00',
      display_currency: 'USD',
      roi_percent: 63.3,
      return_status: 'no_returns',
      status: { status: 'Active', current_cycle: 1 },
    },
  ]);

  expect(metrics.profitRealized).toBe(0);
  expect(metrics.capitalReturnedPercent).toBe(82);
  expect(metrics.returnCompletionPercent).toBeCloseTo(50.107, 3);
  expect(returnCompletionRate(metrics)).toBeCloseTo(50.107, 3);
  expect(metrics.dealsWithNoReturns).toBe(1);
  expect(metrics.dealsRequiringAttention).toBe(1);
  expect(metrics.displayProfitRealized).toBe('$0');
});

test('investor portfolio metrics handle zero invested and projected returns', () => {
  const { investorMetrics } = loadInvestorDashboardHelpers();
  const metrics = investorMetrics([]);

  expect(metrics.profitRealized).toBe(0);
  expect(metrics.capitalReturnedPercent).toBe(0);
  expect(metrics.returnCompletionPercent).toBe(0);
  expect(metrics.dealsWithNoReturns).toBe(0);
  expect(metrics.dealsRequiringAttention).toBe(0);
});

test('investor portfolio sections render compact summary, attention, performance and recent activity', () => {
  const {
    renderInvestorMetrics,
    renderPortfolioPerformance,
    investorAttentionState,
    renderInvestorAttention,
    renderRecentActivity,
  } = loadInvestorDashboardHelpers();
  const metrics = {
    totalInvested: 100000,
    expectedReturns: 163650,
    returned: 82000,
    outstanding: 81650,
    profitRealized: 32000,
    capitalReturnedPercent: 82,
    returnCompletionPercent: 50.1,
    displayCurrency: 'USD',
    displayTotalInvested: '$100,000',
    displayExpectedReturns: '$163,650',
    displayReturned: '$82,000',
    displayOutstanding: '$81,650',
    displayProfitRealized: '$32,000',
    averageRoi: 63.65,
    activeDeals: 1,
    completedDeals: 1,
    dealsWithNoReturns: 1,
    dealsRequiringAttention: 1,
  };

  const unavailableAttention = investorAttentionState([{ id: 1 }]);
  const summary = renderInvestorMetrics(metrics, unavailableAttention);
  expect(summary).toContain('Total Invested');
  expect(summary).toContain('Total Cash Returned');
  expect(summary).toContain('Outstanding Payout');
  expect(summary).toContain('Investments Requiring Attention');
  expect(summary).toContain('Unavailable');
  expect(summary).not.toContain('Projected Total Payout');
  expect(summary).not.toContain('Capital Returned %');
  expect(summary).not.toContain('Average ROI');
  expect(renderPortfolioPerformance(metrics)).toContain('Return Completion Rate');
  expect(renderPortfolioPerformance(metrics)).toContain('$32,000');
  expect(renderPortfolioPerformance(metrics)).toContain('Calculated Realized Profit');
  expect(renderInvestorAttention(unavailableAttention)).toContain('No authoritative attention signals are available');
  expect(renderRecentActivity([{ returned_amount: '82000.00', status: { current_cycle: 7 } }]))
    .toContain('Authoritative recent activity is not available');
  expect(renderRecentActivity([])).not.toContain('Latest return recorded');
});

test('missing portfolio financial values remain unavailable instead of becoming zero', () => {
  const { investorMetrics, renderInvestorMetrics, renderPortfolioPerformance } = loadInvestorDashboardHelpers();
  const metrics = investorMetrics([{
    amount: null,
    expected_return: null,
    returned_amount: null,
    outstanding_amount: null,
    projected_roi_pct: null,
    status: { status: 'Unknown' },
  }]);

  expect(metrics.totalInvested).toBeNull();
  expect(metrics.expectedReturns).toBeNull();
  expect(metrics.returned).toBeNull();
  expect(metrics.outstanding).toBeNull();
  expect(metrics.profitRealized).toBeNull();
  expect(metrics.averageRoi).toBeNull();
  expect(renderInvestorMetrics(metrics)).toContain('Unavailable');
  expect(renderPortfolioPerformance(metrics)).toContain('Not yet calculated');
});

test('dashboard sections follow the investor-first hierarchy', () => {
  const dashboardStart = appJs.indexOf('function renderInvestorDashboard');
  const dashboardEnd = appJs.indexOf('function renderDashboardSection');
  const source = appJs.slice(dashboardStart, dashboardEnd);
  const titles = [
    'Portfolio Summary',
    'Attention Required',
    'Active Investments',
    'Completed Investments',
    'Portfolio Performance',
    'Recent Activity',
    'Reporting Information',
  ];
  const positions = titles.map(title => source.indexOf(`'${title}'`));

  expect(positions.every(position => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
});

test('attention state uses only explicit backend flags', () => {
  const { investorAttentionState, renderInvestorAttention } = loadInvestorDashboardHelpers();

  expect(investorAttentionState([{ id: 1, outstanding_amount: '100' }])).toEqual({
    available: false,
    count: null,
    items: [],
  });
  expect(investorAttentionState([
    { id: 1, attention_required: false },
    { id: 2, title: 'Needs review', attention_required: true, attention_reason: 'Backend review required' },
  ])).toEqual(expect.objectContaining({ available: true, count: 1 }));
  expect(renderInvestorAttention({ available: true, count: 0, items: [] }))
    .toContain('No investments require attention based on available backend signals');
});

test('returns ledger renders only authoritative return fields', () => {
  const ledgerStart = appJs.indexOf('function renderReturnsLedgerRows');
  const ledgerEnd = appJs.indexOf('function renderParams');
  const ledgerSource = appJs.slice(ledgerStart, ledgerEnd);

  expect(ledgerSource).toContain('Date');
  expect(ledgerSource).toContain('Amount');
  expect(ledgerSource).toContain('Note');
  expect(ledgerSource).not.toContain('Cycle');
  expect(ledgerSource).not.toContain('Status / Notes');
  expect(ledgerSource).not.toContain('entry.cycle_num');
  expect(ledgerSource).not.toContain("entry.status ||");
});

test('investor detail fetches and renders repayment history', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${id}/returns`, { headers })");
  expect(appJs).toContain('id="investor-returns-list"');
  expect(appJs).toContain('function renderRepaymentHistory');
  expect(appJs).toContain('amount_near');
  expect(appJs).toContain('renderReturnsLedgerRows(returns)');
});

test('investor detail refresh updates every bundle-dependent live section', async () => {
  const bundle = {
    deal: { id: 7, title: 'Refreshed Live Deal' },
    status: { status: 'CycleActive', current_cycle: 3 },
    balances: { investor: '1000' },
    events: [{}], reports: [{}], cycles: [{}], returns: [{}],
    resourceErrors: {},
  };
  const { refreshInvestorDeal, elements } = loadRefreshInvestorDealHelper(bundle);

  await refreshInvestorDeal(7);

  expect(elements.get('investor-deal-title').textContent).toBe('Refreshed Live Deal');
  expect(elements.get('investor-project-profile').outerHTML).toContain('profile:Refreshed Live Deal');
  expect(elements.get('investor-funding-progress').outerHTML).toContain('funding:Refreshed Live Deal');
  expect(elements.get('investor-technical-data').innerHTML).toContain('technical:Refreshed Live Deal');
  expect(elements.get('investor-events-list').innerHTML).toBe('events:1');
  expect(elements.get('investor-reports-list').innerHTML).toBe('reports:1');
  expect(elements.get('investor-cycles-list').innerHTML).toBe('cycles:1');
  expect(elements.get('investor-returns-list').innerHTML).toBe('returns:1');
  expect(elements.get('investor-investment-summary').innerHTML).toContain('summary:Refreshed Live Deal');
});

test('investor withdrawal success still refreshes the live bundle', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(testResponse(200, { tx_hash: 'tx-123' }));
  const { withdrawInvestorFromPortal, actionResult, refresh } = loadWithdrawInvestorHelper(fetchImpl);

  await withdrawInvestorFromPortal({ id: 7, investor: 'investor.testnet' });

  expect(fetchImpl).toHaveBeenCalledWith(
    'https://agripartners-zlp2.onrender.com/api/investor/deals/7/withdraw',
    expect.objectContaining({ method: 'POST' })
  );
  expect(actionResult).toHaveBeenCalledWith('success', 'Investor withdrawal completed successfully', 'tx-123');
  expect(refresh).toHaveBeenCalledWith(7);
});

test('investor withdrawal error remains visible and does not refresh', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(testResponse(500, { error: 'withdraw failed' }));
  const { withdrawInvestorFromPortal, actionResult, refresh } = loadWithdrawInvestorHelper(fetchImpl);

  await withdrawInvestorFromPortal({ id: 7, investor: 'investor.testnet' });

  expect(actionResult).toHaveBeenCalledWith('error', 'Investor withdrawal failed: withdraw failed');
  expect(refresh).not.toHaveBeenCalled();
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
  expect(appJs).toContain("const dealBadge = deal.isDemoPilot ? 'Pilot Deal' : `Deal #${deal.id}`");
  expect(appJs).not.toContain("const dealBadge = deal.isDemoPilot ? 'Demo Pilot' : `Deal #${deal.id}`");
  expect(appJs).not.toContain('Demo Pilot');
  expect(appJs).not.toContain('QA Admin Deal');
  expect(appJs).not.toContain('Deal #4 Unknown');
  expect(appJs).not.toContain('withdraw_signer_test');
  expect(appJs).not.toContain('test_farmer_dashboard');
});

test('investor demo financial metrics render in USD instead of NEAR', () => {
  expect(appJs).toContain("displayAmount: '$50,000'");
  expect(appJs).toContain("displayExpectedReturn: '$82,000'");
  expect(appJs).toContain("displayReturnedAmount: '$82,000'");
  expect(appJs).toContain("displayExpectedReturn: '$81,650'");
  expect(appJs).toContain("displayReturnedAmount: '$0'");
  expect(appJs).toContain("displayOutstandingAmount: '$81,650'");
  expect(appJs).toContain('displayTotalInvested: allUsd && totals.totalInvested != null ? formatUsdAmount(totals.totalInvested) : null');
  expect(appJs).toContain('displayExpectedReturns: allUsd && totals.expectedReturns != null ? formatUsdAmount(totals.expectedReturns) : null');
  expect(appJs).toContain('displayReturned: allUsd && totals.returned != null ? formatUsdAmount(totals.returned) : null');
  expect(appJs).toContain('displayOutstanding: allUsd && totals.outstanding != null ? formatUsdAmount(totals.outstanding) : null');
  expect(appJs).toContain('const invested = deal.display_amount || formatNearDisplay(deal.amount)');
  expect(appJs).toContain('const expected = deal.display_expected_return || formatNearDisplay(deal.expected_return)');
  expect(appJs).toContain('const returned = deal.display_returned_amount || formatNearDisplay(deal.returned_amount)');
  expect(appJs).toContain("['Invested', deal.display_amount || formatOptionalNearDisplay(deal.invested_amount ?? deal.amount)]");
  expect(appJs).toContain("['Projected Total Payout', deal.display_expected_return || formatOptionalNearDisplay(deal.expected_return)]");
  expect(appJs).toContain("['Outstanding Payout', deal.display_outstanding_amount || formatOptionalNearDisplay(deal.outstanding_amount)]");
  expect(appJs).toContain("['Return Status', escapeHtml(returnStatusLabel(deriveReturnStatus(deal)))]");
  expect(appJs).toContain('const projectedRoi = deal.projected_roi_pct ?? deal.roi_percent;');
  expect(appJs).toContain("[roiLabel, projectedRoi != null ? `${escapeHtml(projectedRoi)}%` : 'Unavailable']");
});
