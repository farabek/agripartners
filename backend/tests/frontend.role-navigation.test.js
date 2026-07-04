const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, '..', '..', 'frontend', 'app.js'), 'utf8');

function loadRenderNav(role, authType = 'password') {
  const start = appJs.indexOf('function renderNav()');
  const end = appJs.indexOf('// --- Admin Portal ---', start);
  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  const helpers = `
    function getAuth() {
      return { user: { role: '${role}', auth_type: '${authType}', username: '${role}-user', account_id: '${role}.testnet' } };
    }
    function isWalletAuth() { return '${authType}' === 'wallet'; }
    function escapeHtml(value) { return String(value ?? ''); }
    ${appJs.slice(start, end)}
    module.exports = { renderNav };
  `;
  const module = { exports: {} };
  Function('module', helpers)(module);
  return module.exports.renderNav();
}

test('authenticated header has canonical brand, account and logout controls', () => {
  const html = loadRenderNav('investor', 'wallet');

  expect(html).toContain('data-authenticated-header');
  expect(html).toContain('href="#home"');
  expect(html).toContain('class="app-header-brand"');
  expect(html).toContain('Profile');
  expect(html).toContain('Connected wallet');
  expect(html).toContain('investor.testnet');
  expect(html).toContain('onclick="logout()"');
  expect(html).toContain('>Logout</button>');
  expect(html).not.toContain('Home</a>');
  expect(html).not.toContain('Dashboard');
});

test('Investor navigation exposes only Marketplace and Portfolio', () => {
  const html = loadRenderNav('investor', 'wallet');

  expect(html).toContain('href="#/marketplace"');
  expect(html).toContain('>Marketplace</a>');
  expect(html).toContain('href="#investor"');
  expect(html).toContain('>Portfolio</a>');
  expect(html).not.toContain('Investment Models');
  expect(html).not.toContain('Projects / Portfolio');
  expect(html).not.toContain('Farmer Assignment');
  expect(html).not.toContain('Farmer Portal');
});

test('Farmer navigation exposes only My Projects', () => {
  const html = loadRenderNav('farmer');

  expect(html).toContain('href="#farmer"');
  expect(html).toContain('My Projects');
  expect(html).not.toContain('Funding Confirmation');
  expect(html).not.toContain('>Reports</a>');
  expect(html).not.toContain('Investment Models');
  expect(html).not.toContain('NEAR');
  expect(html).not.toContain('Testnet');
  expect(html).not.toContain('Investor');
});

test('Farmer funding and demo payout displays do not expose crypto amounts', () => {
  const summaryStart = appJs.indexOf('function renderFarmerSummaryCards');
  const summaryEnd = appJs.indexOf('function renderFarmerEmptyState', summaryStart);
  const detailStart = appJs.indexOf('function renderFarmerDealDetail');
  const detailEnd = appJs.indexOf('function hasPositiveYoctoSafe', detailStart);
  const formatStart = appJs.indexOf('function formatFarmerFundingAmount');
  const formatEnd = appJs.indexOf('async function showFarmerDeal', formatStart);
  const farmerUi = [
    appJs.slice(summaryStart, summaryEnd),
    appJs.slice(detailStart, detailEnd),
    appJs.slice(formatStart, formatEnd),
  ].join('\n');

  expect(farmerUi).toContain('AgriPartners-managed fiat workflow');
  expect(farmerUi).toContain('Available in Project terms');
  expect(farmerUi).not.toContain('yoctoToNear(farmerBalance)');
  expect(farmerUi).not.toContain('formatYoctoRaw(metrics.totalFunding)');
  expect(farmerUi).not.toContain(' NEAR');
});

test('Operator navigation exposes only Operations', () => {
  const html = loadRenderNav('admin');

  expect(html).toContain('href="#admin"');
  expect(html).toContain('>Operations</a>');
  expect(html).not.toContain('Manage Projects');
  expect(html).not.toContain('Farmer Assignment');
  expect(html).not.toContain('>Reports</a>');
  expect(html).not.toContain('Settlement');
  expect(html).not.toContain('Treasury');
});

test('landing route renders without clearing the authenticated session', () => {
  const start = appJs.indexOf('function route()');
  const end = appJs.indexOf('async function initializeApp()', start);
  const routeBody = appJs.slice(start, end);
  const homeBranch = routeBody.slice(
    routeBody.indexOf("if (!hash || hash === '#' || hash === '#home'"),
    routeBody.indexOf("if (hash === '#login')")
  );

  expect(homeBranch).toContain('showHome()');
  expect(homeBranch).not.toContain('clearAuth()');
});

test('logout keeps existing session cleanup and redirects to Landing', () => {
  const start = appJs.indexOf('async function logout()');
  const end = appJs.indexOf('window.logout = logout;', start);
  const logoutBody = appJs.slice(start, end);

  expect(logoutBody).toContain('clearAuth()');
  expect(logoutBody).toContain("location.hash = '#home'");
});

test('Demo and Pilot preparation banners are distinct and keep Opportunity Catalog terminology', () => {
  expect(appJs).toContain("renderEnvironmentBanner('demo', 'Opportunity Catalog')");
  expect(appJs).toContain('Alpha Demo / NEAR Testnet');
  expect(appJs).toContain('This is not a live Pilot 1.0 or production operation.');
  expect(appJs).toContain('Pilot 1.0 Preparation');
  expect(appJs).toContain('This workspace prepares future Pilot operations; it does not claim live production activity.');
  expect(appJs).toContain('Opportunity Catalog');
  expect(appJs).not.toContain('>Marketplace<');
});
