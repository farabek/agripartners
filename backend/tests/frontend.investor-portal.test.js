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
  const end = appJs.indexOf('function renderRepaymentHistory');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    function escapeHtml(value) { return String(value ?? ''); }
    ${appJs.slice(start, end)}
    module.exports = {
      renderInvestmentSummary,
      renderReturnsSummary,
      renderInvestorReturnsManagement,
      renderActualVsProjectedRoi,
      dealReturnMetrics,
    };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

function loadInvestorTypedReturnLedgerHelpers() {
  const start = appJs.indexOf('function investorReturnTypeLabel');
  const end = appJs.indexOf('function renderInvestorReports');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    function escapeHtml(value) { return String(value ?? ''); }
    function formatAddress(value) { return String(value ?? ''); }
    function formatOptionalNearDisplay(value) { return value == null || value === '' ? 'Unavailable' : value + ' NEAR'; }
    function renderReturnsLedgerRows() { return 'Demo ledger'; }
    ${appJs.slice(start, end)}
    module.exports = {
      investorReturnTypeLabel,
      investorReturnPaymentStatusLabel,
      renderInvestorReturnEvidence,
      renderInvestorTypedReturnLedger,
    };
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
    function formatOptionalNearDisplay(value) { return value == null || value === '' ? 'Unavailable' : value + ' NEAR'; }
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
    function renderInvestorDealCard(deal) { return '<article>' + (deal.title || deal.id) + '</article>'; }
    const document = { createElement: () => ({ innerHTML: '' }) };
    ${appJs.slice(start, end)}
    module.exports = {
      investorMetrics,
      isInvestorPresentationProject,
      renderInvestorDashboard,
      renderInvestorMetrics,
      renderPortfolioPerformance,
      investorAttentionState,
      renderInvestorAttention,
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
      fetchInvestorPortfolioSummary,
      enrichDealsForInvestor,
      normalizeInvestorDealsPayload,
      normalizeInvestorDeal,
      normalizeInvestorPortfolioSummary,
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
    function normalizeInvestorDeal(deal) { return deal; }
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
        simpleAnnualizedRoi: '21.9%', cycles: '7', description: 'Static pilot description'
      };
    }
    function formatNearDisplay(value) { return \`\${value} NEAR\`; }
    function formatOptionalNearDisplay(value) { return value == null ? 'Unavailable' : value + ' NEAR'; }
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
    function escapeHtml(value) { return String(value ?? ''); }
    function renderFundingProgressBar(value) { return '<progress>' + value + '</progress>'; }
    function numericReturnAmount(value) {
      const amount = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
      return Number.isFinite(amount) ? amount : 0;
    }
    function fundingDisplayAmount(value, currency) {
      return currency === 'USD' ? \`$\${value}\` : \`\${value.toFixed(2)} NEAR\`;
    }
    ${appJs.slice(start, end)}
    module.exports = { liveFundingProgressMetrics, renderLiveFundingProgressCompact };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

function loadInvestorDealCardHelpers() {
  const stateStart = appJs.indexOf('function investorDealPerformanceState');
  const stateEnd = appJs.indexOf('function renderProjectProfile');
  const cardStart = appJs.indexOf('function renderInvestorDealCard');
  const cardEnd = appJs.indexOf('function investorDemoCycles');
  expect(stateStart).toBeGreaterThanOrEqual(0);
  expect(stateEnd).toBeGreaterThan(stateStart);
  expect(cardStart).toBeGreaterThan(stateEnd);
  expect(cardEnd).toBeGreaterThan(cardStart);
  const helpers = `
    function escapeHtml(value) { return String(value ?? ''); }
    function investorPilotLabel(deal) { return deal.title || ('Deal #' + deal.id); }
    function formatNearDisplay(value) { return value == null ? 'Unavailable' : value + ' NEAR'; }
    function formatAddress(value) { return value || 'Unknown'; }
    function renderLiveFundingProgressCompact(deal) {
      return deal.funding_percentage == null ? '' : 'Funding progress: ' + deal.funding_percentage + '%';
    }
    ${appJs.slice(stateStart, stateEnd)}
    ${appJs.slice(cardStart, cardEnd)}
    module.exports = { investorDealPerformanceState, investorDealReportsState, renderInvestorDealCard };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports;
}

function loadInvestorDetailRenderer() {
  const start = appJs.indexOf('function renderInvestorDealDetail');
  const end = appJs.indexOf('function formatNearDisplay');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const listeners = [];
  const elements = new Map();
  const documentMock = {
    getElementById(id) {
      if (!elements.has(id)) {
        elements.set(id, {
          addEventListener: (event, handler) => listeners.push({ id, event, handler }),
          scrollIntoView: jest.fn(),
        });
      }
      return elements.get(id);
    },
  };
  const helpers = `
    const document = documentMock;
    function renderNav() { return '<nav>Global navigation</nav>'; }
    function escapeHtml(value) { return String(value ?? ''); }
    function investorProjectProfile(deal) { return { title: deal.title || 'Deal' }; }
    function statusBadge(value) { return '<span>Status:' + value + '</span>'; }
    function renderProjectWorkspaceHeader({ resourceErrors = {} } = {}) {
      return '<section>Project Workspace Header'
        + Object.entries(resourceErrors).filter(([, value]) => value)
          .map(([key, value]) => '|error:' + key + ':' + value).join('')
        + '</section>';
    }
    function bindInvestorWorkspaceTabs() {}
    function renderProjectProfile(deal, status, error) { return '<section>Deal Overview' + (error ? '|error:Contract status:' + error : '') + '</section>'; }
    function renderLiveFundingProgressPanel() { return '<section>Funding Progress</section>'; }
    function renderInvestorReturnsManagement() { return '<section>Investment Summary|Returns Summary|ROI Progress|Actual vs Projected ROI</section>'; }
    function renderInvestorDealParams(deal, status, balance, errors) { return 'Technical fields' + (errors.balances ? '|error:Contract balances:' + errors.balances : ''); }
    function renderInvestorResourceUnavailable(label, error) { return 'error:' + label + ':' + error; }
    function renderCycleStatusCards() { return 'Cycle cards'; }
    function renderInvestorReports() { return 'Report cards'; }
    function renderInvestorTypedReturnLedger() { return 'Return entries'; }
    function renderEvents() { return 'Event entries'; }
    function refreshInvestorDeal() {}
    function withdrawInvestorFromPortal() {}
    ${appJs.slice(start, end)}
    module.exports = { renderInvestorDealDetail };
  `;
  const module = { exports: {} };
  Function('module', 'documentMock', 'listeners', helpers)(module, documentMock, listeners);
  return { ...module.exports, listeners, elements };
}

function loadRefreshInvestorDealHelper(bundle) {
  const start = appJs.indexOf('async function refreshInvestorDeal');
  const end = appJs.indexOf('// --- Deal detail ---');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const elements = new Map();
  const ids = [
    'btn-investor-refresh', 'investor-deal-title', 'investor-status-badge', 'investor-cycle-text',
    'project-workspace-header', 'investor-project-profile', 'investor-funding-progress', 'investor-technical-data',
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
    function renderProjectWorkspaceHeader({ deal }) { return \`workspace:\${deal.title}\`; }
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
    function renderInvestorTypedReturnLedger(value) { return \`returns:\${value.length}\`; }
    function yoctoToNear(value) { return String(value); }
    function formatYoctoRaw(value) { return String(value); }
    function showInvestorActionResult() {}
    function bindInvestorWorkspaceTabs() {}
    function withdrawInvestorFromPortal() {}
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

test('opportunity catalog route and navigation are rendered', () => {
  const marketplaceStart = appJs.indexOf('function showMarketplace');
  expect(marketplaceStart).toBeGreaterThan(-1);
  const marketplaceBody = appJs.slice(marketplaceStart, marketplaceStart + 1200);

  expect(indexHtml).toContain('id="view-marketplace"');
  expect(appJs).toContain("'view-marketplace'");
  expect(appJs).toContain("hash === '#/marketplace'");
  expect(appJs).toContain('showMarketplace();');
  expect(marketplaceBody).toContain('href="/"');
  expect(marketplaceBody).toContain('text-lg leading-none');
  expect(marketplaceBody).toContain('Back home');
  expect(appJs).toContain('href="#/marketplace"');
  expect(appJs).toContain('Investor Portal');
  expect(appJs).toContain('Opportunity Catalog');
  expect(appJs).toContain('Farmer Portal');
  expect(appJs).toContain('Admin Portal');
});

test('marketplace filters pilot deals on the frontend', () => {
  const { INVESTOR_DEMO_PILOTS, marketplaceDeals, filterMarketplaceDeals, marketplaceMetrics } = loadMarketplaceHelpers();
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
  expect(INVESTOR_DEMO_PILOTS.find(pilot => pilot.key === 'fidlot')).toEqual(expect.objectContaining({
    expectedReturn: '82000.00',
    cycleDurationDays: 150,
  }));
  expect(INVESTOR_DEMO_PILOTS.find(pilot => pilot.key === 'hissar')).toEqual(expect.objectContaining({
    expectedReturn: '81672.00',
    outstandingAmount: '81672.00',
    cycleDurationDays: 180,
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
  expect(appJs).toContain('Projected Profit');
  expect(appJs).toContain('Projected Total Payout');
  expect(appJs).toContain('Recorded Off-chain Returns');
  expect(appJs).toContain('Projected Outstanding');
  expect(appJs).toContain('Recorded Return Status');
  expect(appJs).toContain('function deriveReturnStatus');
  expect(appJs).toContain("if (!deal.isDemoPilot) return 'unknown'");
  expect(appJs).toContain("partial: 'Partially recorded'");
  expect(appJs).toContain("completed: 'Projected payout recorded'");
  expect(appJs).toContain('Projected ROI');
  expect(appJs).toContain('Projected returns are estimates and are not guaranteed.');
});

test('investor workspace consolidates financial and return metrics', () => {
  const start = appJs.indexOf('function renderInvestorFinancialDashboard');
  const end = appJs.indexOf('function investorCycleReports', start);
  const dashboard = appJs.slice(start, end);

  for (const label of [
    'Investment', 'Projected Payout', 'Returned', 'Outstanding', 'ROI', 'APR',
    'Current Cycle', 'Settlement Status', 'Project Status',
  ]) {
    expect(dashboard).toContain(`['${label}'`);
  }
  expect(appJs).toContain('Financial Dashboard');
  expect(appJs).toContain('Investment Summary');
  expect(appJs).toContain('ROI Progress');
  expect(appJs).toContain('Payout History');
  expect(appJs).toContain('Returns Ledger');
  expect(appJs).toContain('Projected returns are estimates and are not guaranteed.');
});

test('live investor detail follows the investor-first reading order', () => {
  const { renderInvestorDealDetail } = loadInvestorDetailRenderer();
  const el = { innerHTML: '' };

  renderInvestorDealDetail(el, {
    deal: { id: 7, title: 'Live Deal' },
    status: { status: 'CycleActive', current_cycle: 2 },
    balances: { investor: '1000' },
    reports: [], cycles: [], returns: [], events: [], resourceErrors: {},
  });

  const orderedSections = ['Project Workspace Header'];
  const positions = orderedSections.map(section => el.innerHTML.indexOf(section));
  expect(positions.every(position => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(el.innerHTML).not.toContain('renderInvestorProtectionPanel');
  expect(el.innerHTML).not.toContain('Settlement Infrastructure');
  expect(el.innerHTML).not.toContain('NEAR Testnet Infrastructure');
});

test('workspace navigation exposes six same-page keyboard-accessible tabs', () => {
  const start = appJs.indexOf('function renderInvestorWorkspaceTabs');
  const end = appJs.indexOf('function bindInvestorWorkspaceTabs', start);
  const tabs = appJs.slice(start, end);
  const bindingEnd = appJs.indexOf('function renderInvestorCanonicalWorkspace', end);
  const binding = appJs.slice(end, bindingEnd);

  expect(tabs).toContain('role="tablist"');
  for (const label of ['Overview', 'Production', 'Project Reports', 'Returns', 'Project Documents', 'History']) {
    expect(tabs).toContain(`'${label}'`);
  }
  expect(tabs).toContain('aria-selected="${index === 0}"');
  expect(binding).toContain("event.key === 'ArrowRight'");
  expect(binding).toContain("event.key === 'ArrowLeft'");
  expect(binding).toContain("event.key === 'Home'");
  expect(binding).toContain("event.key === 'End'");
  expect(binding).not.toContain('location.');
});

test('reordered live detail keeps optional resource failures visible in their own sections', () => {
  const { renderInvestorDealDetail } = loadInvestorDetailRenderer();
  const el = { innerHTML: '' };

  renderInvestorDealDetail(el, {
    deal: { id: 9, title: 'Partial Deal' }, status: null, balances: null,
    reports: [], cycles: [], returns: [], events: [],
    resourceErrors: {
      status: 'status failed', balances: 'balances failed', reports: 'reports failed',
      cycles: 'cycles failed', returns: 'returns failed', events: 'events failed',
    },
  });

  expect(el.innerHTML).toContain('error:status:status failed');
  expect(el.innerHTML).toContain('error:balances:balances failed');
  expect(el.innerHTML).toContain('error:reports:reports failed');
  expect(el.innerHTML).toContain('error:cycles:cycles failed');
  expect(el.innerHTML).toContain('error:returns:returns failed');
  expect(el.innerHTML).toContain('error:events:events failed');
});

test('live detail navigation changes remain isolated from explicit demo pilot detail', () => {
  const demoStart = appJs.indexOf('function renderInvestorDemoDealDetail');
  const demoEnd = appJs.indexOf('async function showInvestorDeal');
  const demoSource = appJs.slice(demoStart, demoEnd);

  expect(demoSource).toContain('renderProjectWorkspaceHeader({ deal, status, cycles, reports, returns, events');
  expect(demoSource).toContain('bindInvestorWorkspaceTabs(el)');
  expect(demoSource).not.toContain('presentation and screenshot readiness');
  expect(demoSource).not.toContain('renderInvestorReturnsManagement(deal, returns)');
  expect(demoSource).not.toContain('investor-detail-overview');
  expect(demoSource).not.toContain('aria-label="Deal sections"');
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
  ['404', () => Promise.resolve(testResponse(404, {})), 'Investor Project not found'],
  ['500', () => Promise.resolve(testResponse(500, {})), 'Investor Project unavailable (HTTP 500)'],
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
  ['/status', 'status', 'NEAR Testnet status unavailable (HTTP 500)'],
  ['/balances', 'balances', 'NEAR Testnet balances unavailable (HTTP 500)'],
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
    investmentAmount: '12',
    description: null,
    projected_roi_pct: null,
    total_cycles: null,
  }, null);

  expect(live).toEqual(expect.objectContaining({
    title: 'Fidlot Livestock Project',
    investment: '12 NEAR',
    roi: 'Not yet available',
    simpleAnnualizedRoi: 'Not yet available',
    cycles: 'Schedule pending',
    description: 'Project summary not yet provided',
    status: 'Pending update',
  }));
  expect(live.title).not.toBe('Static Fidlot Title');
  expect(live.investment).not.toBe('$50,000');

  const completedLive = investorProjectProfile({
    id: 8,
    investmentAmount: '10.00',
    projectedRoi: 20,
  }, { status: 'Completed' });
  expect(completedLive.roiLabel).toBe('Projected ROI');
  expect(completedLive.roi).toBe('20%');
});

test('explicit demo pilot profile still uses the preserved pilot mapping', () => {
  const { investorProjectProfile } = loadInvestorProjectProfileHelper();
  const demo = investorProjectProfile({ isDemoPilot: true }, { status: 'Completed' });

  expect(demo).toEqual(expect.objectContaining({
    title: 'Static Fidlot Title',
    investment: '$50,000',
    roi: '64%',
    simpleAnnualizedRoi: '21.9%',
    status: 'Completed',
  }));
  expect(appJs).toContain('showInvestorPilotProfile(investorPilot[1])');
});

test('live funding metrics never invent percentages or deadlines', () => {
  const { liveFundingProgressMetrics } = loadLiveFundingHelper();
  const missing = liveFundingProgressMetrics({ amount: '50' });

  expect(missing).toEqual(expect.objectContaining({
    displayGoal: '50.00 NEAR',
    displayRaised: 'Not yet available',
    displayRemaining: 'Not yet available',
    displayPercentage: 'Pending update',
    percentage: null,
    investorCount: 'Pending update',
    daysRemaining: 'Schedule pending',
  }));
});

test('missing live financial DTO fields render contextual business states', () => {
  const { renderInvestmentSummary, renderReturnsSummary, dealReturnMetrics } = loadInvestorMissingValueHelpers();
  const deal = { id: 7, projected_roi_pct: null, expected_return: null, returned_amount: null };

  const investment = renderInvestmentSummary(deal);
  const returns = renderReturnsSummary(deal);
  const metrics = dealReturnMetrics(deal);

  expect(investment).toContain('Not yet available');
  expect(investment).toContain('Pending');
  expect(investment).not.toContain('20%');
  expect(returns).toContain('Not yet available');
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

test('live investor return metrics keep realized values unavailable', () => {
  const { dealReturnMetrics, percentLabel } = loadInvestorReturnMetricHelpers();

  const metrics = dealReturnMetrics({
    display_amount: '$50,000',
    display_expected_return: '$82,000',
    display_returned_amount: '$82,000',
    projectedRoi: 64,
  });

  expect(metrics.actualRoi).toBeNull();
  expect(metrics.remainingRoi).toBeNull();
  expect(percentLabel(metrics.completionPercent)).toBe('100.0%');
});

test('live financial authority panel removes Remaining ROI and keeps realized values non-authoritative', () => {
  const { renderActualVsProjectedRoi } = loadInvestorMissingValueHelpers();
  const html = renderActualVsProjectedRoi({ projectedRoi: 20 });

  expect(html).toContain('Projected ROI');
  expect(html).toContain('Realized Profit');
  expect(html).toContain('Realized ROI');
  expect(html).toContain('Not yet authoritative');
  expect(html).not.toContain('Remaining ROI');
});

test('demo investor return metrics remain isolated and unchanged', () => {
  const { dealReturnMetrics, percentLabel } = loadInvestorReturnMetricHelpers();

  const metrics = dealReturnMetrics({
    isDemoPilot: true,
    display_amount: '$50,000',
    display_expected_return: '$82,000',
    display_returned_amount: '$82,000',
    projected_roi_pct: 64,
  });

  expect(percentLabel(metrics.actualRoi)).toBe('64.0%');
  expect(percentLabel(metrics.remainingRoi)).toBe('0.0%');
  expect(percentLabel(metrics.completionPercent)).toBe('100.0%');

  const { renderInvestorReturnsManagement } = loadInvestorMissingValueHelpers();
  const html = renderInvestorReturnsManagement({
    isDemoPilot: true,
    status: { status: 'Completed' },
    display_amount: '$50,000',
    display_expected_return: '$82,000',
    display_returned_amount: '$82,000',
    display_outstanding_amount: '$0',
    projected_roi_pct: 64,
  });
  expect(html).toContain('ROI Progress');
  expect(html).toContain('Actual vs Projected ROI');
  expect(html).not.toContain('Financial Authority Status');
});

test('live recorded return progress remains presentation-only', () => {
  const { dealReturnMetrics, percentLabel } = loadInvestorReturnMetricHelpers();

  const metrics = dealReturnMetrics({
    display_amount: '$50,000',
    display_expected_return: '$82,000',
    display_returned_amount: '$60,000',
    projectedRoi: 64,
  });

  expect(metrics.actualRoi).toBeNull();
  expect(metrics.remainingRoi).toBeNull();
  expect(percentLabel(metrics.completionPercent)).toBe('73.2%');
});

test('investor detail uses the canonical workspace without primary technical data', () => {
  expect(appJs).toContain('function renderProjectWorkspaceHeader');
  expect(appJs).toContain('data-project-header-fields');
  expect(appJs).toContain('data-header-field="${escapeHtml(label)}"');
  expect(appJs).toContain('Fidlot Livestock Project');
  expect(appJs).toContain('Hissar Sheep Breeding Project');
  expect(appJs).toContain('$50,000');
  expect(appJs).toContain('64%');
  expect(appJs).toContain('63.3%');
  expect(appJs).toContain('21.9%');
  expect(appJs).toContain('21.1%');
  expect(appJs).toContain('Livestock fattening operation based on a real pilot agricultural agreement');
  expect(appJs).toContain('Sheep breeding operation based on a real pilot agricultural agreement');
  const detailStart = appJs.indexOf('function renderInvestorDealDetail');
  const detailEnd = appJs.indexOf('function renderInvestorProtectionPanel', detailStart);
  const detail = appJs.slice(detailStart, detailEnd);
  expect(detail).toContain('renderProjectWorkspaceHeader');
  expect(detail).not.toContain('NEAR Testnet Infrastructure');
  expect(detail).not.toContain('Settlement Infrastructure');
  expect(appJs).not.toContain('${renderProjectProfile(deal, status)}');
  expect(appJs).not.toContain('${renderProjectProfile(deal, status, resourceErrors.status)}');
  expect(appJs).toContain('function getPilotForDeal');
  expect(appJs).toContain('function pilotKeyFromText');
  expect(appJs).not.toContain('[1, 7].includes');
  expect(appJs).not.toContain('[2, 8].includes');
});

test('investor home dashboard renders MVP metrics and preserves its sections', () => {
  const portalStart = appJs.indexOf('async function showInvestorPortal');
  const portalEnd = appJs.indexOf('function renderNearWalletSection', portalStart);
  const portalSource = appJs.slice(portalStart, portalEnd);

  expect(appJs).toContain('function investorMetrics');
  expect(portalSource).not.toContain("renderEnvironmentBanner('pilot', 'Investor')");
  expect(portalSource).not.toContain("renderRoleEntrySummary('investor')");
  expect(portalSource).not.toContain('Pilot 1.0 Preparation');
  expect(portalSource).not.toContain('Investor path');
  expect(portalSource).toContain('Investor Portfolio');
  expect(portalSource).toContain('id="near-wallet-section"');
  expect(portalSource).toContain('renderNearWalletSection()');
  expect(appJs).toContain('Review your AgriPartners-managed Projects, Investment Models, approved Project progress, Reports, and Settlement / Returns visibility.');
  expect(appJs).toContain('Portfolio Summary');
  expect(appJs).toContain('Projected Total Payout');
  expect(appJs).toContain('Recorded Off-chain Returns');
  expect(appJs).toContain('Projected Outstanding');
  expect(appJs).toContain('Weighted Projected ROI');
  expect(appJs).toContain("['Realized Profit', 'Not yet authoritative']");
  expect(appJs).not.toContain('Calculated Realized Profit');
  expect(appJs).not.toContain('Capital Returned %');
  expect(appJs).toContain('Active Projects');
  expect(appJs).toContain('Completed Projects');
  expect(appJs).toContain('Fidlot Livestock Project');
  expect(appJs).toContain('Hissar Sheep Breeding Project');
  expect(appJs).toContain('21.9%');
  expect(appJs).toContain('21.1%');
  expect(appJs).toContain('function investorDealPerformanceState');
  expect(appJs).not.toContain('Greenhouse Project');
  expect(appJs).not.toContain('Poultry Farm');
  expect(appJs).not.toContain('Cotton Farm');
  expect(appJs).not.toContain('Demo Portfolio');
  expect(appJs).not.toContain('INVESTOR_DEMO_DATASET_ENABLED');
  const livePortalSource = appJs.slice(appJs.indexOf('async function showInvestorPortal'), appJs.indexOf('function renderNoWalletInvestorDashboard'));
  expect(livePortalSource).not.toContain('buildInvestorDemoDataset');
  expect(livePortalSource).not.toContain('Demo Mode');
  expect(livePortalSource).toContain('fetchInvestorPortfolioSummary(headers)');
});

test('live investor dashboard has no demo controls or static dataset entry', () => {
  const liveStart = appJs.indexOf('async function showInvestorPortal');
  const liveEnd = appJs.indexOf('function renderNoWalletInvestorDashboard');
  const liveSource = appJs.slice(liveStart, liveEnd);

  expect(liveSource).toContain('fetch(`${API_BASE}/api/investor/deals`');
  expect(liveSource).toContain('fetchInvestorPortfolioSummary(headers)');
  expect(liveSource).not.toContain('buildInvestorDemoDataset');
  expect(appJs).not.toContain('data-investor-dashboard-mode');
  expect(appJs).not.toContain('investor-dashboard-mode');
  expect(appJs).toContain('showInvestorPilotProfile(investorPilot[1])');
});

test('live mode has explicit error and empty portfolio states without demo fallback', () => {
  expect(appJs).toContain("friendlyUiErrorMessage(e, 'Investor Portal')");
  expect(appJs).toContain('No active Projects found for the connected Investor account:');
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
    investmentAmount: null,
  }]);

  expect(deals).toEqual([expect.objectContaining({
    id: 7,
    amount: null,
    expected_return: null,
    returned_amount: null,
    outstanding_amount: null,
    projected_roi_pct: null,
    projectedRoi: null,
    projectedProfit: null,
    projectedTotalPayout: null,
    recordedReturns: null,
    projectedOutstanding: null,
    returnStatus: null,
    status: { status: 'Unknown' },
    balances: null,
  })]);
  expect(() => normalizeInvestorDealsPayload({ deals: [] })).toThrow('Investor Projects response is not a list');
});

test('camelCase deal financial DTO fields take priority over legacy aliases', () => {
  const { normalizeInvestorDeal } = loadInvestorLiveDataHelpers();
  const deal = normalizeInvestorDeal({
    investmentAmount: '100.00', amount: '999.00',
    projectedRoi: 20, projected_roi_pct: 99,
    projectedProfit: '20.00',
    projectedTotalPayout: '120.00', expected_return: '999.00',
    recordedReturns: '25.00', returned_amount: '999.00',
    projectedOutstanding: '95.00', outstanding_amount: '0.00',
    returnStatus: 'partial', return_status: 'completed',
  });

  expect(deal).toEqual(expect.objectContaining({
    investmentAmount: '100.00', projectedRoi: 20, projectedProfit: '20.00',
    projectedTotalPayout: '120.00', recordedReturns: '25.00',
    projectedOutstanding: '95.00', returnStatus: 'partial',
    amount: '100.00', expected_return: '120.00', returned_amount: '25.00',
    outstanding_amount: '95.00', return_status: 'partial',
  }));
});

test('live return status uses the backend DTO and is not recomputed from amounts', () => {
  const { renderReturnsSummary } = loadInvestorMissingValueHelpers();
  const html = renderReturnsSummary({
    returnStatus: 'partial',
    recordedReturns: '120.00',
    projectedTotalPayout: '120.00',
  });

  expect(html).toContain('Partially recorded');
  expect(html).not.toContain('Projected payout recorded');
});

test('legacy snake_case financial fields remain a compatibility fallback', () => {
  const { normalizeInvestorDeal } = loadInvestorLiveDataHelpers();
  expect(normalizeInvestorDeal({
    invested_amount: '50.00', projected_roi_pct: 10,
    expected_return: '55.00', returned_amount: '5.00',
    outstanding_amount: '50.00', return_status: 'partial',
  })).toEqual(expect.objectContaining({
    investmentAmount: '50.00', projectedRoi: 10,
    projectedTotalPayout: '55.00', recordedReturns: '5.00',
    projectedOutstanding: '50.00', returnStatus: 'partial',
  }));
});

test('portfolio summary endpoint is fetched once and normalized without browser aggregation', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(testResponse(200, {
    totalInvested: '400.00', totalProjectedProfit: '100.00',
    totalProjectedPayout: '500.00', totalRecordedReturns: '120.00',
    totalOutstanding: '380.00', weightedProjectedRoi: 25,
  }));
  const { fetchInvestorPortfolioSummary } = loadInvestorLiveDataHelpers(fetchImpl);

  await expect(fetchInvestorPortfolioSummary()).resolves.toEqual({
    data: {
      totalInvested: '400.00', totalProjectedProfit: '100.00',
      totalProjectedPayout: '500.00', totalRecordedReturns: '120.00',
      totalOutstanding: '380.00', weightedProjectedRoi: 25,
    },
    error: null,
    authStatus: null,
  });
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  expect(fetchImpl).toHaveBeenCalledWith(
    'https://api.example.test/api/investor/portfolio-summary',
    expect.objectContaining({ headers: expect.any(Object) })
  );
});

test('portfolio summary failure remains explicit and does not reconstruct totals', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(testResponse(503, {}));
  const { fetchInvestorPortfolioSummary } = loadInvestorLiveDataHelpers(fetchImpl);
  const result = await fetchInvestorPortfolioSummary();

  expect(result.data).toBeNull();
  expect(result.error).toContain('HTTP 503');
  expect(result.authStatus).toBeNull();
});

test.each([401, 403])('portfolio summary preserves %s authorization handling', async (status) => {
  const fetchImpl = jest.fn().mockResolvedValue(testResponse(status, {}));
  const { fetchInvestorPortfolioSummary } = loadInvestorLiveDataHelpers(fetchImpl);
  await expect(fetchInvestorPortfolioSummary()).resolves.toEqual(expect.objectContaining({
    data: null,
    authStatus: status,
  }));
});

test('per-deal enrichment keeps the live deal when optional requests partially fail', async () => {
  const fetchImpl = jest.fn(url => {
    if (url.endsWith('/7')) {
      return Promise.resolve({ ok: true, status: 200, json: async () => ({
        title: 'Live Deal', investmentAmount: null, recordedReturns: null,
      }) });
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
    amount: null,
    investmentAmount: null,
    recordedReturns: null,
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
    .rejects.toThrow('Investor authorization failed while loading Project details');
});

test('investor analytics dashboard keeps presentation-ready portfolio sections', () => {
  const dashboardSource = appJs.slice(appJs.indexOf('function renderInvestorDashboard'), appJs.indexOf('function renderDashboardSection'));
  expect(appJs).toContain('Portfolio Performance');
  expect(dashboardSource).not.toContain('ROI & Returns Overview');
  expect(dashboardSource).not.toContain('Deal Performance');
  expect(appJs).toContain('Projected Total Payout');
  expect(appJs).toContain('Recorded Off-chain Returns');
  expect(appJs).toContain('Projected Outstanding');
  expect(appJs).toContain('Weighted Projected ROI');
  expect(appJs).toContain('Recorded Return Status');
  expect(dashboardSource).not.toContain('Recent Activity');
  expect(dashboardSource).not.toContain('Reporting Information');
  expect(dashboardSource).toContain("attention.available && attention.count > 0 ? renderDashboardSection('Attention Required'");
  expect(dashboardSource).not.toContain('Portfolio Health');
  expect(dashboardSource).not.toContain('Risk / Attention Panel');
  expect(appJs).toContain('View Project');
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

test('live deal card prioritizes title, performance, three financial KPIs and View Deal', () => {
  const { renderInvestorDealCard } = loadInvestorDealCardHelpers();
  const html = renderInvestorDealCard({
    id: 7,
    title: 'Live Orchard',
    investmentAmount: '100',
    recordedReturns: '25',
    projectedOutstanding: '95',
    status: { status: 'CycleActive', current_cycle: 2 },
    farmer: 'farmer.testnet',
    contract_address: 'deal.testnet',
  });

  const orderedLabels = ['Live Orchard', 'Active', 'Total Invested', 'Recorded Off-chain Returns', 'Projected Outstanding', 'View Project'];
  const positions = orderedLabels.map(label => html.indexOf(label));
  expect(positions.every(position => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(html).toContain('href="#investor/deals/7"');
  expect(html).not.toContain('Projected Total Payout');
  expect(html).not.toContain('Projected ROI');
  expect(html).not.toContain('Return Status');
});

test('investor deal cards disclose the model-specific protection reserve rate', () => {
  const { renderInvestorDealCard } = loadInvestorDealCardHelpers();
  const explicit = renderInvestorDealCard({
    id: 12,
    title: 'Custom Deal',
    escrow_pct: 47,
    status: { status: 'Funded' },
  });
  const inferred = renderInvestorDealCard({
    id: 'demo-hissar',
    pilot_key: 'hissar',
    title: 'Hissar Sheep Breeding Project',
    status: { status: 'CycleActive' },
  });

  expect(explicit).toContain('Protection reserve: 47%');
  expect(inferred).toContain('Protection reserve: 53%');
  expect(explicit).toContain('data-protection-rate-badge');
  expect(appJs).toContain('function renderInvestorProtectionPanel');
  expect(appJs).toContain('Current reserve reference');
  expect(appJs).toContain('A future model-specific reserve may support defined loss-mitigation procedures.');
  expect(appJs).toContain('This concept is not insurance or a guarantee.');
});

test('deal card hides secondary fields without presentation value', () => {
  const { renderInvestorDealCard } = loadInvestorDealCardHelpers();
  const html = renderInvestorDealCard({
    id: 8,
    title: 'Sparse Deal',
    display_amount: 'Unavailable',
    display_returned_amount: 'Not available',
    display_outstanding_amount: 'Unknown',
    farmer: 'Unknown',
    report_status: 'Not yet authoritative',
    status: { status: 'Unknown', current_cycle: 'Unknown' },
  });
  const secondaryStart = html.indexOf('border-t border-slate-700 text-xs text-slate-500');

  expect(secondaryStart).toBeGreaterThan(-1);
  expect(html.indexOf('Project Operator:', secondaryStart)).toBeGreaterThan(secondaryStart);
  expect(html).not.toContain('Farmer Assignment:');
  expect(html).not.toContain('Production Cycle:');
  expect(html).not.toContain('Project Reports:');
  expect(html).toContain('Pending project update');
  expect(html).not.toContain('Unavailable');
  expect(html).not.toContain('Unknown');
  expect(html).not.toContain('Not available');
});

test('performance state is neutral and never infers attention from outstanding payout', () => {
  const { investorDealPerformanceState } = loadInvestorDealCardHelpers();

  expect(investorDealPerformanceState({ status: { status: 'Completed' } }).label).toBe('Completed');
  expect(investorDealPerformanceState({ status: { status: 'CycleActive' } }).label).toBe('Active');
  expect(investorDealPerformanceState({ status: null }).label).toBe('Pending project update');
  expect(investorDealPerformanceState({ status: { status: 'CycleActive' }, outstanding_amount: '999' }).label).toBe('Active');
  expect(investorDealPerformanceState({ status: { status: 'CycleActive' }, attention_required: true }).label).toBe('Attention required');
  expect(investorDealPerformanceState({ status: { status: 'Terminated' } }).label).toBe('Attention required');
});

test('live compact funding progress requires an authoritative percentage', () => {
  const { renderLiveFundingProgressCompact } = loadLiveFundingHelper();

  const unavailable = renderLiveFundingProgressCompact({ amount: '50' });
  expect(unavailable).toBe('');

  const available = renderLiveFundingProgressCompact({ amount: '50', funding_percentage: 40 });
  expect(available).toContain('40.0%');
  expect(available).toContain('<progress>40</progress>');
});

test('active and completed cards preserve useful financial and secondary structure', () => {
  const { renderInvestorDealCard } = loadInvestorDealCardHelpers();
  const base = {
    id: 9,
    title: 'Deal',
    investmentAmount: '100',
    recordedReturns: '20',
    projectedOutstanding: '100',
    farmer: 'farmer.testnet',
    report_status: 'Report submitted',
  };
  const active = renderInvestorDealCard({ ...base, status: { status: 'Funded', current_cycle: 0 } });
  const completed = renderInvestorDealCard({ ...base, status: { status: 'Completed', current_cycle: 3 } });

  for (const label of ['Total Invested', 'Recorded Off-chain Returns', 'Projected Outstanding', 'Farmer Assignment:', 'Project Operator:', 'Production Cycle:', 'Project Reports:', 'View Project']) {
    expect(active).toContain(label);
    expect(completed).toContain(label);
  }
  expect(active).toContain('Active');
  expect(completed).toContain('Completed');
});

test('investor portfolio metrics use backend totals and weighted ROI verbatim', () => {
  const { investorMetrics } = loadInvestorDashboardHelpers();
  const metrics = investorMetrics([
    { status: { status: 'Completed' } },
    { status: { status: 'Active' } },
  ], {
    totalInvested: '400.00',
    totalProjectedProfit: '100.00',
    totalProjectedPayout: '500.00',
    totalRecordedReturns: '120.00',
    totalOutstanding: '380.00',
    weightedProjectedRoi: 25,
  });

  expect(metrics).toEqual({
    totalInvested: '400.00',
    totalProjectedProfit: '100.00',
    totalProjectedPayout: '500.00',
    totalRecordedReturns: '120.00',
    totalOutstanding: '380.00',
    weightedProjectedRoi: 25,
    activeDeals: 1,
    completedDeals: 1,
  });
  expect(metrics).not.toHaveProperty('averageRoi');
  expect(metrics).not.toHaveProperty('profitRealized');
  expect(metrics).not.toHaveProperty('capitalReturnedPercent');
});

test('investor dashboard filters QA and test projects from cards and project counts', () => {
  const { isInvestorPresentationProject, renderInvestorDashboard } = loadInvestorDashboardHelpers();
  const appended = [];
  const el = {
    querySelector: () => null,
    appendChild: child => appended.push(child),
  };
  const deals = [
    { id: 1, title: 'QA Funding Check', status: { status: 'Active' } },
    { id: 2, name: 'Test Project', status: { status: 'Completed' } },
    { id: 3, title: 'Demo QA Cycle', status: { status: 'Active' } },
    { id: 4, title: 'Orchard Expansion', status: { status: 'Active' } },
    { id: 5, title: 'Visible title', name: 'QA Internal Alias', status: { status: 'Active' } },
  ];

  expect(deals.map(isInvestorPresentationProject)).toEqual([false, false, false, true, false]);
  renderInvestorDashboard(el, deals, 'investor.testnet', { data: {} });

  expect(appended[0].innerHTML).toContain('<article>Orchard Expansion</article>');
  expect(appended[0].innerHTML).not.toContain('QA Funding Check');
  expect(appended[0].innerHTML).not.toContain('Test Project');
  expect(appended[0].innerHTML).not.toContain('Demo QA Cycle');
  expect(appended[0].innerHTML).not.toContain('Visible title');
  expect(appended[0].innerHTML).toContain('<span class="metric-value">1</span>');
});

test('investor portfolio summary and performance omit presentation-hostile placeholders', () => {
  const {
    renderInvestorMetrics,
    renderPortfolioPerformance,
    investorAttentionState,
    renderInvestorAttention,
  } = loadInvestorDashboardHelpers();
  const metrics = {
    totalInvested: '100000.00',
    totalProjectedProfit: '63672.00',
    totalProjectedPayout: '163672.00',
    totalRecordedReturns: '82000.00',
    totalOutstanding: '81672.00',
    weightedProjectedRoi: 63.672,
    activeDeals: 1,
    completedDeals: 1,
  };

  const unavailableAttention = investorAttentionState([{ id: 1 }]);
  const summary = renderInvestorMetrics(metrics, unavailableAttention);
  expect(summary).toContain('Total Invested');
  expect(summary).toContain('Recorded Off-chain Returns');
  expect(summary).toContain('Projected Outstanding');
  expect(summary).toContain('Investments Requiring Attention');
  expect(summary).toContain('No Action Required');
  expect(summary).not.toContain('Unavailable');
  expect(summary).not.toContain('Projected Total Payout');
  expect(summary).not.toContain('Capital Returned %');
  expect(summary).not.toContain('Average ROI');
  expect(renderPortfolioPerformance(metrics)).toContain('Weighted Projected ROI');
  expect(renderPortfolioPerformance(metrics)).toContain('63.7%');
  expect(renderPortfolioPerformance(metrics)).not.toContain('Realized Profit');
  expect(renderPortfolioPerformance(metrics)).not.toContain('Realized ROI');
  expect(renderPortfolioPerformance(metrics)).not.toContain('Not yet authoritative');
  expect(renderPortfolioPerformance(metrics)).not.toContain('Capital Returned %');
  expect(renderPortfolioPerformance(metrics)).not.toContain('Calculated Realized Profit');
  expect(renderInvestorAttention(unavailableAttention)).toContain('No authoritative attention signals are available');
});

test('financial summary failure hides missing metrics while deal cards remain visible', () => {
  const { renderInvestorDashboard } = loadInvestorDashboardHelpers();
  const appended = [];
  const el = {
    querySelector: () => null,
    appendChild: child => appended.push(child),
  };

  renderInvestorDashboard(el, [{ id: 7, title: 'Live Deal', status: { status: 'Active' } }], 'investor.testnet', {
    data: null,
    error: 'Portfolio financial summary unavailable (HTTP 503)',
  });

  expect(appended).toHaveLength(1);
  expect(appended[0].innerHTML).not.toContain('Unavailable');
  expect(appended[0].innerHTML).not.toContain('HTTP 503');
  expect(appended[0].innerHTML).toContain('No Action Required');
  expect(appended[0].innerHTML).toContain('<article>Live Deal</article>');
  expect(appended[0].innerHTML).not.toContain('0.00 NEAR');
});

test('dashboard sections follow the investor-first hierarchy', () => {
  const dashboardStart = appJs.indexOf('function renderInvestorDashboard');
  const dashboardEnd = appJs.indexOf('function renderDashboardSection');
  const source = appJs.slice(dashboardStart, dashboardEnd);
  const titles = [
    'Portfolio Summary',
    'Active Projects',
    'Completed Projects',
    'Portfolio Performance',
  ];
  const positions = titles.map(title => source.indexOf(`'${title}'`));

  expect(positions.every(position => position >= 0)).toBe(true);
  expect(positions).toEqual([...positions].sort((a, b) => a - b));
  expect(source).toContain("attention.available && attention.count > 0 ? renderDashboardSection('Attention Required'");
  expect(source).not.toContain('Recent Activity');
  expect(source).not.toContain('Reporting Information');
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

test('returns ledger renders typed return fields without realized metrics', () => {
  const ledgerStart = appJs.indexOf('function renderInvestorTypedReturnLedger');
  const ledgerEnd = appJs.indexOf('function renderRepaymentHistory');
  const ledgerSource = appJs.slice(ledgerStart, ledgerEnd);

  expect(ledgerSource).toContain('Date');
  expect(ledgerSource).toContain('Type');
  expect(ledgerSource).toContain('Amount');
  expect(ledgerSource).toContain('Status');
  expect(ledgerSource).toContain('Evidence / Tx Hash');
  expect(ledgerSource).toContain('Note');
  expect(ledgerSource).not.toContain('Cycle');
  expect(ledgerSource).not.toContain('Realized Profit');
  expect(ledgerSource).not.toContain('Realized ROI');
  expect(ledgerSource).not.toContain('Verified');
  expect(ledgerSource).not.toContain('Earned');
  expect(ledgerSource).not.toContain('Guaranteed');
});

test('investor typed return ledger renders types, legacy rows, and correction safely', () => {
  const { investorReturnTypeLabel, renderInvestorTypedReturnLedger } = loadInvestorTypedReturnLedgerHelpers();

  expect(investorReturnTypeLabel({ entry_type: 'principal' })).toBe('Principal Return');
  expect(investorReturnTypeLabel({ entry_type: 'profit' })).toBe('Investment Profit');
  expect(investorReturnTypeLabel({ entry_type: 'fee' })).toBe('Project Fee');
  expect(investorReturnTypeLabel({ entry_type: 'correction' })).toBe('Return Adjustment');
  expect(investorReturnTypeLabel({ entry_type: null })).toBe('Investment Return');
  expect(investorReturnTypeLabel({ entry_type: 'profit', legacyUntyped: true })).toBe('Investment Return');

  const html = renderInvestorTypedReturnLedger([
    { amount_near: '10', entry_type: 'principal', payment_status: 'recorded', note: 'Principal row' },
    { amount_near: '2', entry_type: null, legacyUntyped: true, note: 'Historical row' },
  ]);
  expect(html).toContain('Principal');
  expect(html).toContain('Investment Return');
  expect(html).toContain('Recorded');
});

test('investor typed return ledger renders payment lifecycle labels with a safe missing fallback', () => {
  const { investorReturnPaymentStatusLabel } = loadInvestorTypedReturnLedgerHelpers();

  expect(investorReturnPaymentStatusLabel('recorded')).toBe('Recorded');
  expect(investorReturnPaymentStatusLabel('approved')).toBe('Approved');
  expect(investorReturnPaymentStatusLabel('paid')).toBe('Paid');
  expect(investorReturnPaymentStatusLabel('reconciled')).toBe('Reconciled');
  expect(investorReturnPaymentStatusLabel(null)).toBe('Recorded off-chain');
  expect(investorReturnPaymentStatusLabel(undefined)).toBe('Recorded off-chain');
});

test('investor typed return evidence is a reference and missing evidence stays explicit', () => {
  const { renderInvestorReturnEvidence } = loadInvestorTypedReturnLedgerHelpers();

  expect(renderInvestorReturnEvidence(null)).toContain('No evidence');
  const evidence = renderInvestorReturnEvidence('tx-hash-123');
  expect(evidence).toContain('testnet.nearblocks.io/txns/tx-hash-123');
  expect(evidence).toContain('Reference only; not proof of payment or reconciliation');
  expect(evidence).not.toContain('Verified');
});

test('investor typed return ledger preserves its empty state', () => {
  const { renderInvestorTypedReturnLedger } = loadInvestorTypedReturnLedgerHelpers();
  expect(renderInvestorTypedReturnLedger([])).toContain('No returns recorded yet.');
});

test('investor detail fetches and renders repayment history', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${id}/returns`, { headers })");
  expect(appJs).toContain('id="investor-returns-list"');
  expect(appJs).toContain('function renderRepaymentHistory');
  expect(appJs).toContain('function renderInvestorTypedReturnLedger');
  expect(appJs).toContain('amount_near');
  expect(appJs).toContain('renderInvestorTypedReturnLedger(returns)');
  const ledgerStart = appJs.indexOf('function renderInvestorTypedReturnLedger');
  const ledgerEnd = appJs.indexOf('function renderRepaymentHistory');
  expect(appJs.slice(ledgerStart, ledgerEnd)).not.toContain('admin-return-transition-btn');
  expect(appJs).not.toContain('/api/investor/returns/${returnId}');
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

  expect(elements.get('project-workspace-header').outerHTML).toContain('workspace:Refreshed Live Deal');
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
  expect(actionResult).toHaveBeenCalledWith('success', 'Settlement request completed successfully', 'tx-123');
  expect(refresh).toHaveBeenCalledWith(7);
});

test('investor withdrawal error remains visible and does not refresh', async () => {
  const fetchImpl = jest.fn().mockResolvedValue(testResponse(500, { error: 'withdraw failed' }));
  const { withdrawInvestorFromPortal, actionResult, refresh } = loadWithdrawInvestorHelper(fetchImpl);

  await withdrawInvestorFromPortal({ id: 7, investor: 'investor.testnet' });

  expect(actionResult).toHaveBeenCalledWith('error', 'Settlement request is temporarily unavailable. Please try again.');
  expect(refresh).not.toHaveBeenCalled();
});

test('investor demo dataset hides test records and renders clean pilot routes', () => {
  expect(appJs).toContain('const INVESTOR_DEMO_PILOTS');
  expect(appJs).toContain("key: 'fidlot'");
  expect(appJs).toContain("key: 'hissar'");
  expect(appJs).toContain("status: 'Completed'");
  expect(appJs).toContain("status: 'Active'");
  expect(appJs).toContain("settlementStatus: pilot.key === 'fidlot' ? 'Settlement Completed' : 'Pending'");
  expect(appJs).toContain('activeDeals: deals.filter');
  expect(appJs).toContain('completedDeals: deals.filter');
  expect(appJs).toContain('showInvestorPortfolioDashboard()');
  expect(appJs).toContain('showInvestorPilotSelector()');
  expect(appJs).toContain('showInvestorPilotProfile(investorPilot[1])');
  expect(appJs).toContain('#investor/pilots/${deal.pilot_key}');
  expect(appJs).toContain('renderInvestorDemoDealDetail');
  expect(appJs).not.toContain('Investor demo profile: this screen is prepared for presentation and screenshot readiness.');
  expect(appJs).toContain("const dealBadge = deal.isDemoPilot ? 'Pilot Project' : `Project #${deal.id}`");
  expect(appJs).not.toContain("const dealBadge = deal.isDemoPilot ? 'Demo Pilot' : `Project #${deal.id}`");
  expect(appJs).not.toContain('Demo Pilot');
  expect(appJs).not.toContain('QA Admin Deal');
  expect(appJs).not.toContain('Deal #4 Unknown');
  expect(appJs).not.toContain('withdraw_signer_test');
  expect(appJs).not.toContain('test_farmer_dashboard');
});

test('investor portfolio dashboard summarizes demo portfolio and links to project workspaces', () => {
  const dashboardStart = appJs.indexOf('function showInvestorPortfolioDashboard');
  const dashboardEnd = appJs.indexOf('function showInvestorPilotSelector', dashboardStart);
  expect(dashboardStart).toBeGreaterThan(-1);
  expect(dashboardEnd).toBeGreaterThan(dashboardStart);
  const dashboardSource = appJs.slice(dashboardStart, dashboardEnd);

  expect(dashboardSource).toContain('Portfolio Dashboard');
  expect(dashboardSource).toContain('Projected values are demonstration estimates');
  expect(dashboardSource).toContain('Total Capital');
  expect(dashboardSource).toContain('Projected Total Payout');
  expect(dashboardSource).toContain('Projected Profit');
  expect(dashboardSource).toContain('Average ROI');
  expect(dashboardSource).toContain('Average APR');
  expect(dashboardSource).toContain('Projects');
  expect(dashboardSource).toContain('formatUsdAmount(metrics.totalCapital)');
  expect(dashboardSource).toContain('formatUsdAmount(metrics.totalPayout)');
  expect(dashboardSource).toContain('formatUsdAmount(metrics.projectedProfit)');
  expect(appJs).toContain('Number(pilot.amount || 0) * (1 + Number(pilot.roiPercent || 0) / 100)');
  expect(dashboardSource).toContain('Open Fidlot Project');
  expect(dashboardSource).toContain('Open Hissar Project');
  expect(dashboardSource).toContain('Settlement Completed');
  expect(dashboardSource).toContain('Current Cycle');
  expect(dashboardSource).toContain('href="#/investor/pilots/${escapeHtml(pilot.key)}"');
});

test('investor portfolio dashboard renders allocation, events, activity, and quick actions', () => {
  const dashboardStart = appJs.indexOf('function showInvestorPortfolioDashboard');
  const dashboardEnd = appJs.indexOf('function showInvestorPilotSelector', dashboardStart);
  const dashboardSource = appJs.slice(dashboardStart, dashboardEnd);

  for (const label of ['Uzbekistan', 'Livestock', 'Fidlot', 'Hissar Sheep']) {
    expect(dashboardSource).toContain(label);
  }
  for (const event of ['Hissar Next Production Update', 'Hissar Cycle Review', 'Hissar Settlement Review', 'Portfolio Document Update']) {
    expect(dashboardSource).toContain(event);
  }
  for (const activity of ['Fidlot funding confirmed', 'Fidlot reports completed', 'Fidlot settlement completed', 'Hissar funding confirmed', 'Hissar cycle active', 'Hissar next production update']) {
    expect(dashboardSource).toContain(activity);
  }
  expect(dashboardSource).toContain('href="#/investor/pilots"');
  expect(dashboardSource).toContain('href="#/investor/pilots/fidlot"');
  expect(dashboardSource).toContain('href="#/investor/pilots/hissar"');
  expect(dashboardSource).toContain('href="#home"');
});

test('investor pilot selector lets users choose Fidlot or Hissar before opening details', () => {
  const selectorStart = appJs.indexOf('function showInvestorPilotSelector');
  const selectorEnd = appJs.indexOf('function showInvestorPilotProfile', selectorStart);
  expect(selectorStart).toBeGreaterThan(-1);
  expect(selectorEnd).toBeGreaterThan(selectorStart);
  const selectorSource = appJs.slice(selectorStart, selectorEnd);

  expect(selectorSource).toContain('Choose an Investor Pilot Project');
  expect(selectorSource).toContain('Compare the two flagship AgriPartners pilot workflows');
  expect(selectorSource).toContain('Fidlot represents a completed workflow');
  expect(selectorSource).toContain('Hissar represents an active workflow');
  expect(selectorSource).toContain('Open Fidlot Project');
  expect(selectorSource).toContain('Open Hissar Project');
  expect(selectorSource).toContain('href="#/investor/pilots/${escapeHtml(pilot.key)}"');
  expect(selectorSource).toContain('Back Home');
  expect(selectorSource).toContain('Opportunity Catalog');
});

test('investor direct pilot routes remain available and detail pages link back to selector', () => {
  const demoStart = appJs.indexOf('function renderInvestorDemoDealDetail');
  const demoEnd = appJs.indexOf('async function showInvestorDeal');
  const routesStart = appJs.indexOf("if (hash === '#/investor/dashboard'");
  const routesEnd = appJs.indexOf('const protectionModel', routesStart);
  expect(routesStart).toBeGreaterThan(-1);
  expect(routesEnd).toBeGreaterThan(routesStart);
  const routeSource = appJs.slice(routesStart, routesEnd);

  expect(routeSource).toContain('showInvestorPortfolioDashboard()');
  expect(routeSource).toContain('showInvestorPilotSelector()');
  expect(routeSource).toContain('showInvestorPilotProfile(investorPilot[1])');
  expect(demoStart).toBeGreaterThan(-1);
  expect(demoEnd).toBeGreaterThan(demoStart);
  const demoSource = appJs.slice(demoStart, demoEnd);

  expect(demoSource).toContain('href="#/investor/dashboard"');
  expect(demoSource).toContain('Back to Portfolio');
  expect(demoSource).toContain('href="#/investor/pilots"');
  expect(demoSource).toContain('text-lg leading-none');
  expect(demoSource).toContain('Back to Investor Pilots');
  expect(demoSource).toContain('Back Home');
  expect(demoSource).not.toContain('Back to Investor Portal');
});

test('investor pilot selector uses shared pilot financial data and preserves Project Documents route surface', () => {
  expect(appJs).toContain("title: 'Fidlot Livestock Project'");
  expect(appJs).toContain("title: 'Hissar Sheep Breeding Project'");
  expect(appJs).toContain("investment: '$50,000'");
  expect(appJs).toContain("cycles: '7'");
  expect(appJs).toContain("cycles: '6'");
  expect(appJs).toContain("roi: '64%'");
  expect(appJs).toContain("roi: '63.3%'");
  expect(appJs).toContain("simpleAnnualizedRoi: '21.9%'");
  expect(appJs).toContain("simpleAnnualizedRoi: '21.1%'");
  expect(appJs).toContain("['documents', 'Project Documents']");
  expect(appJs).toContain("renderProjectDocuments({ deal, cycles, reports, role: 'investor' })");
});

test('demo investor workspaces expose the permanent Commercial Operations Alpha module', () => {
  for (const heading of [
    'Commercial Operations',
    'Commercial Reporting',
    'Project Gallery',
    'Commercial Evidence Library',
    'Illustrative Commercial Reporting Workflow',
  ]) {
    expect(appJs).toContain(heading);
  }
  expect(appJs).toContain("alpha: { label: 'Alpha v1.2', badge: 'Current prototype'");
  expect(appJs).toContain("beta: { label: 'Beta', badge: 'Preparing'");
  expect(appJs).toContain("production: { label: 'Production', badge: 'Active'");
  expect(appJs).toContain('Available as a Testnet demonstration');
  expect(appJs).toContain('No commercial evidence is recorded in this Alpha stage.');
  expect(appJs).not.toContain('Commercial Placeholders');
});

test('Commercial Operations preserves demo distinctions and avoids false activity claims', () => {
  const start = appJs.indexOf('const COMMERCIAL_OPERATIONS_STAGES');
  const end = appJs.indexOf('function renderInvestorWorkspaceCycles', start);
  const commercialOperations = appJs.slice(start, end);

  expect(commercialOperations).toContain('Verified commercial evidence will be added only after a funded pilot begins.');
  expect(commercialOperations).toContain('Illustrative future workflow');
  for (const unsafePhrase of [
    'active commercial pilot',
    'completed commercial pilot',
    'live commercial reporting',
    'real deployed capital',
    'realized return',
    'verified report submitted',
    'upload evidence',
  ]) {
    expect(commercialOperations.toLowerCase()).not.toContain(unsafePhrase);
  }
  expect(appJs).toContain('Fidlot represents a completed workflow');
  expect(appJs).toContain('Hissar represents an active workflow');
});

test('both investor demo pilots render Commercial Operations after the core workspace and Settlement', () => {
  const demoStart = appJs.indexOf('function renderInvestorDemoDealDetail');
  const demoEnd = appJs.indexOf('async function showInvestorDeal', demoStart);
  const demoSource = appJs.slice(demoStart, demoEnd);
  const workspaceIndex = demoSource.indexOf('renderProjectWorkspaceHeader');
  const settlementIndex = demoSource.indexOf('renderSettlementPanel');
  const commercialIndex = demoSource.indexOf("renderCommercialOperationsSection('alpha')");

  expect(workspaceIndex).toBeGreaterThan(-1);
  expect(settlementIndex).toBeGreaterThan(workspaceIndex);
  expect(commercialIndex).toBeGreaterThan(settlementIndex);
  expect(appJs).toContain('showInvestorPilotProfile(investorPilot[1])');
  expect(appJs).toContain("if (pilot.key !== 'fidlot') return []");
  for (const existingSurface of ['Project Reports', 'Project Documents', 'Returns', 'Settlement', 'Project Timeline']) {
    expect(appJs).toContain(existingSurface);
  }
});

test('investor demo financial metrics render in USD instead of NEAR', () => {
  expect(appJs).toContain("displayAmount: '$50,000'");
  expect(appJs).toContain("displayExpectedReturn: '$82,000'");
  expect(appJs).toContain("displayReturnedAmount: '$82,000'");
  expect(appJs).toContain("displayExpectedReturn: '$81,672'");
  expect(appJs).toContain("displayReturnedAmount: '$0'");
  expect(appJs).toContain("displayOutstandingAmount: '$81,672'");
  const demoStart = appJs.indexOf('function renderInvestorDemoDealDetail');
  const demoEnd = appJs.indexOf('async function showInvestorDeal');
  const demoSource = appJs.slice(demoStart, demoEnd);
  expect(demoSource).toContain('renderProjectWorkspaceHeader({ deal, status, cycles, reports, returns, events');
  expect(appJs).toContain('Financial Dashboard');
  expect(appJs).toContain('Returns Ledger');
  expect(demoSource).not.toContain('Recorded Off-chain Returns Ledger');
  expect(demoSource).not.toContain('renderInvestorReturnsManagement(deal, returns)');
});
