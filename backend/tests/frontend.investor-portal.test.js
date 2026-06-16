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
  expect(appJs).toContain('Returned / Projected Return');
  expect(appJs).toContain('Completion Percent');
  expect(appJs).toContain('Actual vs Projected ROI');
  expect(appJs).toContain('id="investor-actual-vs-projected-roi"');
  expect(appJs).toContain('Actual ROI Received');
  expect(appJs).toContain('Remaining ROI');
  expect(appJs).toContain('Returns Ledger');
  expect(appJs).toContain('Status / Notes');
  expect(appJs).toContain('No returns recorded yet.');
  expect(appJs).toContain('Projected returns are estimates and are not guaranteed.');
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

test('investor home dashboard renders MVP metrics and pilot deals', () => {
  expect(appJs).toContain('function investorMetrics');
  expect(appJs).toContain('Investor Analytics Dashboard');
  expect(appJs).toContain('Portfolio performance, pilot deals, returns, and reporting visibility.');
  expect(appJs).toContain('Portfolio Summary');
  expect(appJs).toContain('Projected Returns');
  expect(appJs).toContain('Returned');
  expect(appJs).toContain('Outstanding');
  expect(appJs).toContain('Average ROI');
  expect(appJs).toContain('Active Deals');
  expect(appJs).toContain('Completed Deals');
  expect(appJs).toContain('Featured Pilot Deals');
  expect(appJs).toContain('Active Investments');
  expect(appJs).toContain('Completed Investments');
  expect(appJs).toContain('Fidlot Livestock Project');
  expect(appJs).toContain('Hissar Sheep Breeding Project');
  expect(appJs).toContain('21.9%');
  expect(appJs).toContain('21.1%');
  expect(appJs).toContain("const roiLabel = deal.status === 'Completed' ? 'ROI' : 'Projected ROI'");
  expect(appJs).not.toContain('Greenhouse Project');
  expect(appJs).not.toContain('Poultry Farm');
  expect(appJs).not.toContain('Cotton Farm');
  expect(appJs).not.toContain('Demo Portfolio');
  expect(appJs).toContain('INVESTOR_DEMO_DATASET_ENABLED');
  expect(appJs).toContain('buildInvestorDemoDataset(deals, connectedWalletAccount)');
  expect(appJs).toContain('Financial view in USD');
  expect(appJs).not.toContain('Demo financial view in USD');
  expect(appJs).toContain('displayTotalInvested');
  expect(appJs).toContain('displayExpectedReturns');
});

test('investor analytics dashboard renders Phase 9 analytics sections', () => {
  expect(appJs).toContain('ROI & Returns Overview');
  expect(appJs).toContain('Projected Portfolio Return');
  expect(appJs).toContain('Capital Returned');
  expect(appJs).toContain('Outstanding Returns');
  expect(appJs).toContain('Return Completion Rate');
  expect(appJs).toContain('Average Projected ROI');
  expect(appJs).toContain('Deal Performance');
  expect(appJs).toContain('Return Status');
  expect(appJs).toContain('Reporting Signals');
  expect(appJs).toContain('Reports visible in deal detail');
  expect(appJs).toContain('Cycle status visible');
  expect(appJs).toContain('Event history available');
  expect(appJs).toContain('Farmer reports available');
  expect(appJs).toContain('Available in deal detail');
  expect(appJs).toContain('Risk / Attention Panel');
  expect(appJs).toContain('Active deals with outstanding returns');
  expect(appJs).toContain('Deals with no returns yet');
  expect(appJs).toContain('Projected returns are not guaranteed');
  expect(appJs).toContain('View Deal');
});

test('investor detail fetches and renders repayment history', () => {
  expect(appJs).toContain("fetch(`${API_BASE}/api/investor/deals/${id}/returns`, { headers })");
  expect(appJs).toContain('id="investor-returns-list"');
  expect(appJs).toContain('function renderRepaymentHistory');
  expect(appJs).toContain('amount_near');
  expect(appJs).toContain('renderReturnsLedgerRows(returns)');
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
  expect(appJs).toContain('displayTotalInvested: allUsd ? formatUsdAmount(totals.totalInvested) : null');
  expect(appJs).toContain('displayExpectedReturns: allUsd ? formatUsdAmount(totals.expectedReturns) : null');
  expect(appJs).toContain('displayReturned: allUsd ? formatUsdAmount(totals.returned) : null');
  expect(appJs).toContain('displayOutstanding: allUsd ? formatUsdAmount(totals.outstanding) : null');
  expect(appJs).toContain('const invested = deal.display_amount || formatNearDisplay(deal.amount)');
  expect(appJs).toContain('const expected = deal.display_expected_return || formatNearDisplay(deal.expected_return)');
  expect(appJs).toContain('const returned = deal.display_returned_amount || formatNearDisplay(deal.returned_amount)');
  expect(appJs).toContain("['Invested', deal.display_amount || formatNearDisplay(deal.invested_amount || deal.amount)]");
  expect(appJs).toContain("['Projected Return', deal.display_expected_return || formatNearDisplay(deal.expected_return)]");
  expect(appJs).toContain("['Outstanding Return', deal.display_outstanding_amount || formatNearDisplay(deal.outstanding_amount)]");
  expect(appJs).toContain("['Return Status', escapeHtml(returnStatusLabel(deriveReturnStatus(deal)))]");
  expect(appJs).toContain('const projectedRoi = deal.projected_roi_pct ?? deal.roi_percent ?? 20');
  expect(appJs).toContain('[roiLabel, `${escapeHtml(projectedRoi)}%`]');
});
