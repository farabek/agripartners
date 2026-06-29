const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'app.js'),
  'utf8'
);

function response(status, payload, { invalidJson = false } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: invalidJson ? async () => { throw new Error('invalid'); } : async () => payload,
  };
}

function loadFetchFarmerJson(fetchImpl, clearAuthMock = jest.fn()) {
  const start = appJs.indexOf('async function fetchFarmerJson');
  const end = appJs.indexOf('async function showFarmerPortal');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const source = `
    const API_BASE = 'https://api.example.test';
    function authHeaders() { return {}; }
    function jsonAuthHeaders() { return {}; }
    const clearAuth = clearAuthMock;
    ${appJs.slice(start, end)}
    module.exports = { fetchFarmerJson };
  `;
  const module = { exports: {} };
  Function('module', 'fetch', 'clearAuthMock', source)(module, fetchImpl, clearAuthMock);
  return module.exports;
}

function loadFarmerDashboardDataHelpers() {
  const start = appJs.indexOf('function normalizeFarmerDashboardPayload');
  const end = appJs.indexOf('function farmerProfileValue');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const source = `
    function getNearWalletAccount() { return 'wallet-fallback.testnet'; }
    ${appJs.slice(start, end)}
    module.exports = { normalizeFarmerDashboardPayload, normalizeFarmerProfilePayload, normalizeLiveFarmerDeal };
  `;
  const module = { exports: {} };
  Function('module', source)(module);
  return module.exports;
}

function loadFarmerProfileDisplay() {
  const start = appJs.indexOf('function farmerProfileDisplay');
  const end = appJs.indexOf('function renderFarmerProfilePanel');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const module = { exports: {} };
  Function('module', `${appJs.slice(start, end)}\nmodule.exports = { farmerProfileDisplay };`)(module);
  return module.exports;
}

function loadFarmerEmptyState() {
  const start = appJs.indexOf('function renderFarmerEmptyState');
  const end = appJs.indexOf('function bindFarmerDashboardActions');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const source = `
    function escapeHtml(value) { return String(value ?? ''); }
    ${appJs.slice(start, end)}
    module.exports = { renderFarmerEmptyState };
  `;
  const module = { exports: {} };
  Function('module', source)(module);
  return module.exports;
}

function loadFarmerDealBundle(fetchFarmerJsonImpl) {
  const normalizeStart = appJs.indexOf('function normalizeLiveFarmerDeal');
  const normalizeEnd = appJs.indexOf('function farmerProfileValue');
  const start = appJs.indexOf('async function fetchFarmerDealBundle');
  const end = appJs.indexOf('function showFarmerPilotProfile');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const source = `
    const fetchFarmerJson = fetchFarmerJsonImpl;
    ${appJs.slice(normalizeStart, normalizeEnd)}
    ${appJs.slice(start, end)}
    module.exports = { fetchFarmerDealBundle };
  `;
  const module = { exports: {} };
  Function('module', 'fetchFarmerJsonImpl', source)(module, fetchFarmerJsonImpl);
  return module.exports;
}

function loadFarmerProjectProfileRenderer() {
  const start = appJs.indexOf('function renderFarmerProjectProfile');
  const end = appJs.indexOf('function renderFarmerFundingStatus');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const source = `
    function escapeHtml(value) { return String(value ?? ''); }
    function formatFarmerFundingAmount(value) { return value == null ? 'Unavailable' : String(value); }
    ${appJs.slice(start, end)}
    module.exports = { renderFarmerProjectProfile };
  `;
  const module = { exports: {} };
  Function('module', source)(module);
  return module.exports;
}

function loadWithdrawFarmer(fetchImpl) {
  const start = appJs.indexOf('async function withdrawFarmerWithWallet');
  const end = appJs.indexOf('async function confirmFarmerFunding');
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const actionResult = jest.fn();
  const showDeal = jest.fn().mockResolvedValue(undefined);
  const button = { disabled: false, textContent: '' };
  const source = `
    function getNearWalletAccount() { return 'farmer.testnet'; }
    function confirm() { return true; }
    const document = { getElementById: () => button };
    const fetchFarmerJson = fetchImpl;
    const showFarmerActionResult = actionResult;
    const showFarmerDeal = showDeal;
    ${appJs.slice(start, end)}
    module.exports = { withdrawFarmerWithWallet };
  `;
  const module = { exports: {} };
  Function('module', 'fetchImpl', 'actionResult', 'showDeal', 'button', source)(
    module, fetchImpl, actionResult, showDeal, button
  );
  return { ...module.exports, actionResult, showDeal, button };
}

test('farmer dashboard loads profile and deals together', () => {
  const showFarmerPortalStart = appJs.indexOf('async function showFarmerPortal');
  expect(showFarmerPortalStart).toBeGreaterThan(-1);
  const showFarmerPortalBody = appJs.slice(showFarmerPortalStart, showFarmerPortalStart + 1800);

  expect(showFarmerPortalBody).toContain("fetchFarmerJson('/api/profile/me')");
  expect(showFarmerPortalBody).toContain("fetchFarmerJson('/api/farmer/deals')");
  expect(showFarmerPortalBody).not.toContain('buildFarmerDemoDataset');
  expect(showFarmerPortalBody).toContain('renderFarmerDashboard(contentEl, farmerData.deals, farmerData.farmer, profile)');
});

test('new farmer empty state is friendly and actionable', () => {
  expect(appJs).toContain('No active deals yet');
  expect(appJs).toContain('Your farmer profile is ready');
  expect(appJs).toContain('Share your wallet account with AgriPartners admin');
  expect(appJs).toContain('Copy Wallet Account');
});

test('farmer dashboard renders profile fields and summary cards', () => {
  expect(appJs).toContain('renderFarmerProfilePanel');
  expect(appJs).toContain('Farmer Operations Dashboard');
  expect(appJs).toContain('Operational view for agricultural deals.');
  expect(appJs).toContain('Farm Profile');
  expect(appJs).toContain('Farm Name');
  expect(appJs).toContain('Region');
  expect(appJs).toContain('Activity / Livestock Type');
  expect(appJs).toContain('Farmer Account');
  expect(appJs).toContain('Deal Funding');
  expect(appJs).toContain('Active Deals');
  expect(appJs).toContain('Current Cycle');
  expect(appJs).toContain('Reports Submitted');
  expect(appJs).toContain('Next Report Due');
  expect(appJs).not.toContain('Farhod Investor');
});

test('farmer deal cards remain linked to the detail page', () => {
  expect(appJs).toContain('function renderFarmerDealCard');
  expect(appJs).toContain('const dealHref = deal.isDemoPilot ? `#farmer/pilots/${deal.pilot_key}` : `#farmer/deals/${deal.id}`');
  expect(appJs).toContain("const dealBadge = deal.isDemoPilot ? 'Pilot Deal' : `Deal #${deal.id}`");
  expect(appJs).not.toContain("const dealBadge = deal.isDemoPilot ? 'Demo Pilot' : `Deal #${deal.id}`");
  expect(appJs).toContain('Open Deal');
  expect(appJs).toContain('Funding Status');
  expect(appJs).toContain('Report Status');
  expect(appJs).toContain('Projected ROI');
  expect(appJs).toContain('Next action:');
});

test('farmer demo dataset shows only clean pilot deals', () => {
  expect(appJs).not.toContain('FARMER_DEMO_DATASET_ENABLED');
  expect(appJs).toContain('function buildFarmerDemoDataset');
  expect(appJs).toContain('function farmerDemoDealFromPilot');
  expect(appJs).toContain('Fidlot Livestock Project');
  expect(appJs).toContain('Hissar Sheep Breeding Project');
  expect(appJs).toContain("fundingStatus: 'Funding Confirmed'");
  expect(appJs).toContain("cycleStatus: isFidlot ? 'Completed' : 'Cycle Active'");
  expect(appJs).toContain("reportLabel: isFidlot ? 'Report Submitted' : 'Next Report Due'");
  expect(appJs).not.toContain('QA Admin Deal');
  expect(appJs).not.toContain('Deal #4 Unknown');
  expect(appJs).not.toContain('withdraw_signer_test');
});

test('farmer summary metrics use known live states safely', () => {
  expect(appJs).toContain('activeDeals = deals.filter((deal) => activeStatuses.includes(deal.status)).length');
  expect(appJs).toContain('reportsSubmitted = deals.filter((deal) => deal.reportStatus === \'submitted\').length');
  expect(appJs).toContain('nextReportDue = deals.filter((deal) => deal.reportStatus === \'pending\' || deal.reportStatus === \'due\').length');
  expect(appJs).toContain('displayTotalFunding');
  expect(appJs).toContain("displayAmount: '$50,000'");
  expect(appJs).toContain('Financial view in USD');
  expect(appJs).not.toContain('Demo financial view in USD');
  expect(appJs).toContain('Deal Funding');
});

test('farmer demo deal detail renders project profile and report cycle status', () => {
  expect(appJs).toContain('showFarmerPilotProfile(farmerPilot[1])');
  expect(appJs).toContain('function renderFarmerDemoDealDetail');
  expect(appJs).toContain('Project Profile');
  expect(appJs).toContain('Deal Operations Summary');
  expect(appJs).toContain('Deal Summary');
  expect(appJs).toContain('Funding Status');
  expect(appJs).toContain('Current Cycle Status');
  expect(appJs).toContain('Report Status');
  expect(appJs).toContain('Cycle Timeline');
  expect(appJs).toContain('Reports History');
  expect(appJs).toContain('Farmer Report');
  expect(appJs).toContain('Event History');
  expect(appJs).toContain('Funding Confirmed');
  expect(appJs).toContain('Report Submitted');
  expect(appJs).toContain('Next Report Due');
  expect(appJs).toContain('Return Recorded');
});

test('farmer deal detail explains reserve and payment for every model cycle', () => {
  expect(appJs).toContain('function renderFarmerReserveBreakdown');
  expect(appJs).toContain('Reserve and Farmer Payment by Cycle');
  expect(appJs).toContain('Before reserve · after expenses');
  expect(appJs).toContain('Added to reserve');
  expect(appJs).toContain('Released to farmer');
  expect(appJs).toContain('Farmer receives');
  expect(appJs).toContain('Ending reserve');
  expect(appJs).toContain('Program total');
  expect(appJs).toContain('No-loss model');
  expect(appJs).toContain('scheduleTotals.contribution');
  expect(appJs).toContain('scheduleTotals.release');
  expect(appJs).toContain('scheduleTotals.farmerCash');
  expect(appJs).toContain('farmer’s gross 60% profit share × reserve rate = reserve contribution');
  expect(appJs).toContain('gross farmer share − operating expenses − reserve contribution + reserve released = farmer receives');
  expect(appJs).toContain('the ${reserveRate == null ? \'model-specific\' : `${escapeHtml(reserveRate)}%`} rate is calculated before operating expenses');
  expect(appJs).toContain('$18,360 × 53% = $9,730.80 reserve contribution');
  expect(appJs).toContain('$18,360 − $3,100 expenses = $15,260 before reserve');
  expect(appJs).toContain('Model projection only — this pilot profile has no live contract reserve or withdrawable balance.');
  expect(appJs).toContain('Contract reserve · live');
  expect(appJs).toContain('Farmer available · live');
  expect(appJs).toContain('Swipe horizontally to compare every amount');
  expect(appJs).toContain('Hissar cycles 3–6 include a $2,500 partial capital return');
});

test('farmer reserve schedule includes canonical Fidlot and Hissar cycle examples', () => {
  expect(appJs).toContain("['Cycle 3', '$27,680', '$6,996', '$516', '$22,320', '$6,670']");
  expect(appJs).toContain("['Cycle 3', '$29,956', '$7,822.80', '$7,240.40', '$20,044', '$11,077.60']");
  expect(appJs).toContain('Minimum reserve until completion:');
  expect(appJs).toContain('A release is not automatic.');
});

test('reserve breakdown is present in demo and live farmer details', () => {
  const demoStart = appJs.indexOf('function renderFarmerDemoDealDetail');
  const demoBody = appJs.slice(demoStart, demoStart + 1900);
  const liveStart = appJs.indexOf('function renderFarmerDealDetail');
  const liveBody = appJs.slice(liveStart, liveStart + 2200);

  expect(demoBody).toContain('renderFarmerReserveBreakdown(deal, cycles)');
  expect(liveBody).toContain('renderFarmerReserveBreakdown(deal, cycles, balances, resourceErrors.balances)');
});

test('farmer operations dashboard adds timeline and reports history helpers', () => {
  expect(appJs).toContain('function renderFarmerCycleTimeline');
  expect(appJs).toContain('Funding Sent');
  expect(appJs).toContain('Cycle Started');
  expect(appJs).toContain('Cycle Completed');
  expect(appJs).toContain('function renderFarmerReportsHistory');
  expect(appJs).toContain('No submitted reports yet');
  expect(appJs).toContain('Submitted date');
});

test('farmer deal detail fetches balances for withdraw state', () => {
  const showFarmerDealStart = appJs.indexOf('async function showFarmerDeal');
  expect(showFarmerDealStart).toBeGreaterThan(-1);
  const showFarmerDealBody = appJs.slice(showFarmerDealStart, showFarmerDealStart + 1400);

  expect(showFarmerDealBody).toContain('fetchFarmerJson(`/api/deals/${id}/balances`)');
  expect(showFarmerDealBody).toContain('renderFarmerDealDetail(el, bundle)');
});

test('farmer withdraw button is hidden behind positive farmer balance', () => {
  const detailStart = appJs.indexOf('function renderFarmerDealDetail');
  expect(detailStart).toBeGreaterThan(-1);
  const detailBody = appJs.slice(detailStart, detailStart + 2500);

  expect(detailBody).toContain('const farmerBalance = resourceErrors.balances ? null : balances?.farmer');
  expect(detailBody).toContain('const canWithdrawFarmer = hasPositiveYoctoSafe(farmerBalance)');
  expect(detailBody).toContain('id="btn-farmer-withdraw"');
  expect(detailBody).toContain("${canWithdrawFarmer ? '' : 'disabled'}");
  expect(detailBody).toContain('Withdraw Farmer Balance');
  expect(detailBody).toContain('No Farmer Balance');
});

test('farmer withdraw uses authenticated backend API without browser Node modules', () => {
  const withdrawStart = appJs.indexOf('async function withdrawFarmerWithWallet');
  expect(withdrawStart).toBeGreaterThan(-1);
  const withdrawBody = appJs.slice(withdrawStart, withdrawStart + 1800);

  expect(withdrawBody).toContain('fetchFarmerJson(`/api/farmer/deals/${deal.id}/withdraw`');
  expect(withdrawBody).toContain("method: 'POST'");
  expect(withdrawBody).toContain('connectedWallet !== deal.farmer');
  expect(withdrawBody).toContain("await showFarmerDeal(deal.id, { type: 'success', message })");
  expect(withdrawBody).toContain("btn.textContent = 'Withdrawing...'");
  expect(withdrawBody).not.toContain('signAndSendWalletFunctionCall');
});

test('farmer dashboard normalization keeps live deals and supports zero-deal portfolios', () => {
  const { normalizeFarmerDashboardPayload } = loadFarmerDashboardDataHelpers();

  const live = normalizeFarmerDashboardPayload({
    farmer: 'farmer.testnet',
    deals: [{ id: 9, title: 'Live Orchard', status: 'Funded' }],
  });
  const empty = normalizeFarmerDashboardPayload({ farmer: 'farmer.testnet', deals: [] });

  expect(live.deals).toHaveLength(1);
  expect(live.deals[0]).toEqual(expect.objectContaining({ id: 9, title: 'Live Orchard', status: 'Funded' }));
  expect(live.deals[0].isDemoPilot).toBeUndefined();
  expect(empty.deals).toEqual([]);
  expect(appJs.slice(appJs.indexOf('async function showFarmerPortal'), appJs.indexOf('function normalizeFarmerDashboardPayload')))
    .not.toContain('buildFarmerDemoDataset');
});

test('farmer zero-deal empty state renders explicitly', () => {
  const { renderFarmerEmptyState } = loadFarmerEmptyState();
  const html = renderFarmerEmptyState('farmer.testnet');

  expect(html).toContain('No active deals yet');
  expect(html).toContain('farmer.testnet');
  expect(html).not.toContain('Fidlot Livestock Project');
  expect(html).not.toContain('Hissar Sheep Breeding Project');
});

test('live farmer profile uses neutral missing values instead of demo defaults', () => {
  const { farmerProfileDisplay } = loadFarmerProfileDisplay();
  const profile = farmerProfileDisplay({}, 'farmer.testnet');

  expect(profile).toEqual({
    farmName: 'Unavailable',
    region: 'Unavailable',
    activity: 'Unavailable',
    farmerAccount: 'farmer.testnet',
    status: 'Unknown',
    role: 'Unknown',
  });
  expect(Object.values(profile)).not.toContain('AgriPartners Pilot Farm');
  expect(Object.values(profile)).not.toContain('Tashkent Region');
  expect(Object.values(profile)).not.toContain('Hissar Sheep Breeding');
  expect(Object.values(profile)).not.toContain('Active');
});

test.each([
  [401, 'Wallet session expired'],
  [403, 'forbidden'],
  [404, 'missing'],
  [500, 'HTTP 500'],
])('farmer API exposes HTTP %s errors', async (status, expected) => {
  const clearAuthMock = jest.fn();
  const fetchImpl = jest.fn().mockResolvedValue(response(status, {
    error: status === 403 ? 'forbidden' : (status === 404 ? 'missing' : undefined),
  }));
  const { fetchFarmerJson } = loadFetchFarmerJson(fetchImpl, clearAuthMock);

  await expect(fetchFarmerJson('/api/farmer/deals')).rejects.toThrow(expected);
  if (status === 401) expect(clearAuthMock).toHaveBeenCalledTimes(1);
});

test('farmer API exposes network and invalid JSON failures', async () => {
  const network = loadFetchFarmerJson(jest.fn().mockRejectedValue(new Error('offline')));
  const invalid = loadFetchFarmerJson(jest.fn().mockResolvedValue(response(200, null, { invalidJson: true })));

  await expect(network.fetchFarmerJson('/api/farmer/deals')).rejects.toThrow('offline');
  await expect(invalid.fetchFarmerJson('/api/farmer/deals'))
    .rejects.toThrow('Farmer API returned invalid JSON for /api/farmer/deals');
});

function successfulFarmerBundleResponse(path) {
  if (path.endsWith('/cycles')) return { cycles: [{ id: 1, status: 'funding_sent' }] };
  if (path.endsWith('/balances')) return { farmer: '1000' };
  return {
    deal: { id: 9, farmer: 'farmer.testnet', status: 'Funded', activeCycleId: 1 },
    raw: { id: 9, title: 'Live Orchard', description: 'Live description', deal_type: 'orchard' },
  };
}

test('owned farmer detail loads successfully and merges raw live fields', async () => {
  const fetchFarmerJson = jest.fn(path => Promise.resolve(successfulFarmerBundleResponse(path)));
  const { fetchFarmerDealBundle } = loadFarmerDealBundle(fetchFarmerJson);

  const bundle = await fetchFarmerDealBundle(9);

  expect(fetchFarmerJson).toHaveBeenCalledTimes(3);
  expect(bundle.deal).toEqual(expect.objectContaining({
    id: 9,
    title: 'Live Orchard',
    description: 'Live description',
    deal_type: 'orchard',
    status: 'Funded',
    activeCycleId: 1,
  }));
  expect(bundle.cycles).toHaveLength(1);
  expect(bundle.balances).toEqual({ farmer: '1000' });
  expect(bundle.resourceErrors).toEqual({ cycles: null, balances: null });
});

test.each([
  ['401', 'Wallet session expired'],
  ['403', 'Only deal farmer can access this deal'],
  ['404', 'Farmer deal not found'],
  ['network', 'offline'],
  ['malformed', 'Farmer deal returned malformed data'],
])('mandatory farmer detail exposes %s failure', async (kind, expected) => {
  const fetchFarmerJson = jest.fn(path => {
    if (!path.endsWith('/deals/9')) return Promise.resolve(successfulFarmerBundleResponse(path));
    if (kind === 'malformed') return Promise.resolve({ deal: null });
    return Promise.reject(new Error(expected));
  });
  const { fetchFarmerDealBundle } = loadFarmerDealBundle(fetchFarmerJson);

  await expect(fetchFarmerDealBundle(9)).rejects.toThrow(expected);
});

test.each([
  ['/cycles', 'cycles', [], 'Cycle status unavailable'],
  ['/balances', 'balances', null, 'Farmer balances unavailable'],
])('optional farmer resource %s fails independently', async (suffix, key, fallback, expected) => {
  const fetchFarmerJson = jest.fn(path => path.endsWith(suffix)
    ? Promise.reject(new Error('offline'))
    : Promise.resolve(successfulFarmerBundleResponse(path)));
  const { fetchFarmerDealBundle } = loadFarmerDealBundle(fetchFarmerJson);

  const bundle = await fetchFarmerDealBundle(9);

  expect(bundle.deal.id).toBe(9);
  expect(bundle[key]).toEqual(fallback);
  expect(bundle.resourceErrors[key]).toContain(expected);
});

test('empty cycles and cycles request failure remain distinct', async () => {
  const emptyFetch = jest.fn(path => Promise.resolve(
    path.endsWith('/cycles') ? { cycles: [] } : successfulFarmerBundleResponse(path)
  ));
  const failedFetch = jest.fn(path => path.endsWith('/cycles')
    ? Promise.reject(new Error('offline'))
    : Promise.resolve(successfulFarmerBundleResponse(path)));

  const empty = await loadFarmerDealBundle(emptyFetch).fetchFarmerDealBundle(9);
  const failed = await loadFarmerDealBundle(failedFetch).fetchFarmerDealBundle(9);

  expect(empty.cycles).toEqual([]);
  expect(empty.resourceErrors.cycles).toBeNull();
  expect(failed.cycles).toEqual([]);
  expect(failed.resourceErrors.cycles).toContain('offline');
});

test('malformed optional farmer payloads become section errors', async () => {
  const fetchFarmerJson = jest.fn(path => Promise.resolve(
    path.endsWith('/cycles') ? { cycles: [null] }
      : (path.endsWith('/balances') ? [] : successfulFarmerBundleResponse(path))
  ));
  const { fetchFarmerDealBundle } = loadFarmerDealBundle(fetchFarmerJson);

  const bundle = await fetchFarmerDealBundle(9);

  expect(bundle.resourceErrors.cycles).toBe('Cycle status returned malformed data');
  expect(bundle.resourceErrors.balances).toBe('Farmer balances returned malformed data');
});

test('live farmer detail renders missing fields as Unknown or Unavailable', () => {
  const { renderFarmerProjectProfile } = loadFarmerProjectProfileRenderer();
  const html = renderFarmerProjectProfile({ id: 9, status: null });

  expect(html).toContain('Unknown');
  expect(html).toContain('Unavailable');
  expect(html).not.toContain('Funding Confirmed');
  expect(html).not.toContain('Cycle Active');
  expect(html).not.toContain('Next Report Due');
  expect(html).not.toContain('Agricultural project demonstrated');
});

test('explicit farmer demo pilot route remains available', () => {
  expect(appJs).toContain('showFarmerPilotProfile(farmerPilot[1])');
  expect(appJs).toContain('function renderFarmerDemoDealDetail');
  expect(appJs).toContain('farmerDemoDealFromPilot(pilot, getNearWalletAccount())');
  expect(appJs).toContain('const dealHref = deal.isDemoPilot ? `#farmer/pilots/${deal.pilot_key}`');
});

test('farmer demo landing lets users choose Fidlot or Hissar', () => {
  expect(appJs).toContain("if (hash === '#farmer/pilots')");
  expect(appJs).toContain('function showFarmerPilotSelector');
  expect(appJs).toContain('Choose a Pilot Model');
  expect(appJs).toContain('Open Fidlot');
  expect(appJs).toContain('Open Hissar');
  expect(appJs).toContain('href="#farmer/pilots/${escapeHtml(pilot.key)}"');
  expect(appJs).toContain('Includes the same cycle table for reserve contributions');
});

test('farmer pilot demo pages link back to public home', () => {
  const demoStart = appJs.indexOf('function renderFarmerDemoDealDetail');
  const demoEnd = appJs.indexOf('function renderFarmerProjectProfile');
  expect(demoStart).toBeGreaterThan(-1);
  expect(demoEnd).toBeGreaterThan(demoStart);
  const demoSource = appJs.slice(demoStart, demoEnd);

  expect(demoSource).toContain('href="/"');
  expect(demoSource).toContain('text-lg leading-none');
  expect(demoSource).toContain('Back home');
  expect(demoSource).not.toContain('Back to Farmer Portal');
});

test('farmer withdrawal success refreshes detail and preserves success state', async () => {
  const fetchImpl = jest.fn().mockResolvedValue({ tx_hash: 'tx-farmer-1' });
  const { withdrawFarmerWithWallet, showDeal, actionResult } = loadWithdrawFarmer(fetchImpl);

  await withdrawFarmerWithWallet({ id: 9, farmer: 'farmer.testnet' });

  expect(fetchImpl).toHaveBeenCalledWith('/api/farmer/deals/9/withdraw', expect.objectContaining({ method: 'POST' }));
  expect(showDeal).toHaveBeenCalledWith(9, {
    type: 'success',
    message: 'Farmer withdrawal completed. Tx: tx-farmer-1',
  });
  expect(actionResult).toHaveBeenCalledWith('success', 'Farmer withdrawal submitted...');
});

test('farmer withdrawal error remains visible without refresh', async () => {
  const fetchImpl = jest.fn().mockRejectedValue(new Error('signer unavailable'));
  const { withdrawFarmerWithWallet, showDeal, actionResult } = loadWithdrawFarmer(fetchImpl);

  await withdrawFarmerWithWallet({ id: 9, farmer: 'farmer.testnet' });

  expect(actionResult).toHaveBeenCalledWith('error', 'Farmer withdrawal failed: signer unavailable');
  expect(showDeal).not.toHaveBeenCalled();
});
