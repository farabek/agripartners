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

test('unauthenticated public landing route renders before login', () => {
  expect(indexHtml).toContain('id="view-home"');
  expect(appJs).toContain('function showHome()');
  expect(appJs).toContain("hash === '#home'");
  expect(appJs).toContain("location.hash = '#home'");
  expect(appJs).toContain("showView('view-home')");
});

test('home route stays public for authenticated users', () => {
  const homeRouteStart = appJs.indexOf("if (!hash || hash === '#' || hash === '#home' || hash === '#/') {");
  expect(homeRouteStart).toBeGreaterThan(-1);
  const homeRouteSource = appJs.slice(homeRouteStart, appJs.indexOf("if (hash === '#login')", homeRouteStart));

  expect(homeRouteSource).toContain('showHome()');
  expect(homeRouteSource).not.toContain('redirectAuthenticatedUser()');
});

test('landing explains product audience and Alpha testnet context', () => {
  expect(appJs).toContain('What AgriPartners is');
  expect(appJs).toContain('Investors');
  expect(appJs).toContain('Farmers');
  expect(appJs).toContain('AgriPartners / Project Operators');
  expect(appJs).toContain('Alpha v1.2');
  expect(appJs).toContain('NEAR Testnet');
  expect(appJs).toContain('Self-guided investor demo');
  expect(appJs).toContain('no live investments are accepted');
});

test('landing describes core demonstration capabilities', () => {
  for (const phrase of [
    'Portfolio Dashboard',
    'Pilot Projects',
    'Project Reports',
    'Project Documents',
  ]) {
    expect(appJs).toContain(phrase);
  }
});

test('landing publishes bilingual investor and farmer financial models with disclaimer', () => {
  expect(appJs).toContain('Explore the 60/40 Model');
  expect(appJs).toContain('financial-model-catalog');
  expect(appJs).toContain('Livestock fattening');
  expect(appJs).toContain('Sheep breeding');
  expect(appJs).toContain('For Investors');
  expect(appJs).toContain('For Farmers');
  expect(appJs).toContain('Projected net ROI');
  expect(appJs).toContain('Projected cash received');
  expect(appJs.match(/class="financial-language notranslate" translate="no"/g)).toHaveLength(8);
  expect(appJs).toContain('do not guarantee returns');
  expect(appJs).toContain('Agri-Investor-Fidlot-v5.9-6040-EN.pdf');
  expect(appJs).toContain('Agri-Investor-VariantB-v2.1-6040-RU.pdf');
  expect(appJs).toContain('Agri-Farmer-Fidlot-v5.9-6040-RU.pdf');
  expect(appJs).toContain('Agri-Farmer-VariantB-v2.1-6040-EN.pdf');
});

test('landing explains model-specific investor protection immediately after financial models', () => {
  const homeStart = appJs.indexOf('function showHome()');
  const homeEnd = appJs.indexOf('function renderPublicFooter()', homeStart);
  const homeSource = appJs.slice(homeStart, homeEnd);

  expect(homeSource.indexOf('landing-financial-models')).toBeGreaterThanOrEqual(0);
  expect(homeSource.indexOf('renderHomeInvestorProtection()')).toBeGreaterThan(homeSource.indexOf('landing-financial-models'));
  expect(appJs).toContain('Review the Protection Framework');
  expect(appJs).toContain('not active in Pilot 1.0');
  expect(appJs).toContain('Protection reserve 44%');
  expect(appJs).toContain('Protection reserve 53%');
  expect(appJs).toContain('Required reserve = max($10,000; $50,000');
  expect(appJs).toContain('View the full staged-release schedules');
  expect(appJs).toContain('Полное объяснение на русском');
  expect(appJs).toContain('It is not insurance');
});

test('landing CTAs route to explicit demo and login destinations', () => {
  const homeStart = appJs.indexOf('function showHome()');
  const homeEnd = appJs.indexOf('function renderPublicFooter()', homeStart);
  const homeSource = appJs.slice(homeStart, homeEnd);

  expect(homeSource).toContain('Explore Investor Demo');
  expect(homeSource).toContain('class="landing-btn landing-btn-primary" href="#/investor/dashboard"');
  expect(homeSource).toContain('Presentation Mode');
  expect(homeSource).toContain('href="#demo/presentation/investor"');
  expect(homeSource).toContain('No registration is required.');
  expect(homeSource).toContain('href="#login"');
  expect(homeSource).toContain('href="#login/investor"');
  expect(homeSource).toContain('href="#login/farmer"');
  expect(homeSource).toContain('href="#login/admin"');
  expect(homeSource).toContain('View Opportunity Catalog');
  expect(homeSource).toContain('href="#/marketplace"');
  expect(homeSource).toContain('Open Documentation');
  expect(homeSource).toContain('href="#/platform"');
});

test('landing preserves participant access routes while prioritizing the self-guided investor demo', () => {
  const homeStart = appJs.indexOf('function showHome()');
  const homeEnd = appJs.indexOf('function renderPublicFooter()', homeStart);
  const homeSource = appJs.slice(homeStart, homeEnd);

  expect(homeSource).toContain('<h3>Investors</h3>');
  expect(homeSource).toContain('href="#login/investor"');
  expect(homeSource).toContain('<h3>Farmers</h3>');
  expect(homeSource).toContain('href="#login/farmer"');
  expect(homeSource).toContain('<h3>AgriPartners / Project Operators</h3>');
  expect(homeSource).toContain('href="#login/admin"');
  expect(homeSource).toContain('Opportunity Catalog');
  expect(homeSource).toContain('href="#/marketplace"');
  expect(homeSource).toContain('Explore Investor Demo');
  expect(homeSource).toContain('href="#/investor/dashboard"');
  expect(homeSource).not.toContain('href="#/investor/pilots/fidlot"');
  expect(homeSource).toContain('Self-guided investor demo');
  expect(homeSource).toContain('No registration is required.');
  expect(homeSource).toContain('Alpha v1.2 working prototype on NEAR Testnet');
  expect(homeSource).toContain('no live investments are accepted');
});

test('public page exposes English SEO and social preview metadata', () => {
  expect(indexHtml).toContain('<html lang="en">');
  expect(indexHtml).toContain('name="description"');
  expect(indexHtml).toContain('property="og:title"');
  expect(indexHtml).toContain('property="og:image"');
  expect(indexHtml).toContain('name="twitter:card" content="summary_large_image"');
  expect(indexHtml).toContain('/assets/social/agripartners-og.png');
});

test('public landing uses the canonical Operator and Farmer boundary', () => {
  expect(appJs).toContain('Uzbekistan Feedlot Operator');
  expect(appJs).toContain('Separate Operator Agreement · Fiat Only');
  expect(appJs).toContain('Farmer product role are fiat-only');
  expect(appJs).not.toContain('Farmer Project Agreement');
});

test('public landing offers a focused partner route', () => {
  expect(appJs).toContain('Partner with AgriPartners');
  expect(appJs).toContain('Start a focused conversation');
  expect(appJs).toContain('#demo/presentation/enterprise');
});

test('demo routes are public while live protected routes still require auth', () => {
  const publicRoutesStart = appJs.indexOf("if (hash === '#/investor/dashboard'");
  const authGuardIndex = appJs.indexOf('if (!auth)', publicRoutesStart);
  expect(publicRoutesStart).toBeGreaterThan(-1);
  expect(authGuardIndex).toBeGreaterThan(publicRoutesStart);

  const publicRoutesSource = appJs.slice(publicRoutesStart, authGuardIndex);
  expect(publicRoutesSource).toContain('showInvestorPortfolioDashboard()');
  expect(publicRoutesSource).toContain('showInvestorPilotSelector()');
  expect(publicRoutesSource).toContain('showInvestorPilotProfile(investorPilot[1])');
  expect(publicRoutesSource).toContain('showPublicProtectionModel(protectionModel[1])');
  expect(publicRoutesSource).toContain('showFarmerPilotSelector()');
  expect(publicRoutesSource).toContain('showFarmerPilotProfile(farmerPilot[1])');
  expect(publicRoutesSource).toContain('showAdminPilotDetail(adminPilot[1])');
  expect(publicRoutesSource).toContain('showAdminDemoPortal()');
  expect(publicRoutesSource).toContain('showMarketplace()');

  const protectedSource = appJs.slice(authGuardIndex, appJs.indexOf("if (hash === '#farmer')"));
  expect(protectedSource).toContain("location.hash = '#home'");
});

test('public protection schedules are linked across primary product surfaces', () => {
  expect(appJs).toContain('function showPublicProtectionModel');
  expect(appJs).toContain('Public protection schedule');
  expect(appJs).toContain('canonical USD no-loss projection');
  expect(appJs).toContain('#/protection/fidlot');
  expect(appJs).toContain('#/protection/hissar');
  expect(appJs).toContain('Full cycle table');
  expect(appJs).toContain('Protection table');
  expect(appJs).toContain('Full cycle protection table');
  expect(appJs).toContain('View public protection schedule');
  expect(appJs).toContain('Investor view');
  expect(appJs).toContain('Farmer view');
  expect(appJs).toContain('Admin view');
  expect(appJs).toContain('class="protection-cta"');
  expect(appJs).toContain('financial-protection-badge protection-cta');
});

test('existing login form and wallet login behavior remain available', () => {
  expect(appJs).toContain('function showLogin()');
  expect(appJs).toContain('id="login-form"');
  expect(appJs).toContain('id="login-near-wallet"');
  expect(appJs).toContain('document.getElementById(\'login-near-wallet\')?.addEventListener(\'click\', handleWalletLogin)');
  expect(appJs).toContain('async function handleLogin(username, password)');
  expect(appJs).toContain("fetch(`${API_BASE}/api/auth/login`");
});
