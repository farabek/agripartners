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
  expect(appJs).toContain('Alpha Demo / Pilot entry separation');
});

test('landing describes core demonstration capabilities', () => {
  for (const phrase of [
    'NEAR infrastructure',
    'Farmer reporting',
    'Investor visibility',
    'Typed returns',
    'Treasury foundation',
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
  expect(appJs).toContain('Explore the Future Protection Concept by Investment Model');
  expect(appJs).toContain('not active in Pilot 1.0');
  expect(appJs).toContain('Protection reserve 44%');
  expect(appJs).toContain('Protection reserve 53%');
  expect(appJs).toContain('Required reserve = max($10,000; $50,000');
  expect(appJs).toContain('View the full staged-release schedules');
  expect(appJs).toContain('Полное объяснение на русском');
  expect(appJs).toContain('It is not insurance');
});

test('landing CTAs route to explicit demo and login destinations', () => {
  expect(appJs).toContain('Explore Investor Demo');
  expect(appJs).toContain('href="#/investor/pilots/fidlot"');
  expect(appJs).toContain('Explore Farmer Demo');
  expect(appJs).toContain('href="#farmer/pilots"');
  expect(appJs).toContain('Explore Operator Demo');
  expect(appJs).toContain('href="#demo/admin"');
  expect(appJs).toContain('id="home-login-wallet"');
  expect(appJs).toContain('href="#login"');
  expect(appJs).toContain('href="#login/investor"');
  expect(appJs).toContain('href="#login/farmer"');
  expect(appJs).toContain('href="#login/admin"');
  expect(appJs).toContain('Opportunity Catalog');
  expect(appJs).toContain('Investor Testnet Login');
  expect(appJs).toContain('TODO: In Beta / Pilot stage, rename "Investor Testnet Login"');
});

test('landing renders Operator demo entry without changing Investor and Farmer entries', () => {
  const homeStart = appJs.indexOf('function showHome()');
  const homeEnd = appJs.indexOf('function renderPublicFooter()', homeStart);
  const homeSource = appJs.slice(homeStart, homeEnd);

  expect(homeSource).toContain('Investor Portal');
  expect(homeSource).toContain('href="#login/investor"');
  expect(homeSource).toContain('Farmer Portal');
  expect(homeSource).toContain('href="#login/farmer"');
  expect(homeSource).toContain('Operator Portal');
  expect(homeSource).toContain('href="#login/admin"');
  expect(homeSource).toContain('Opportunity Catalog');
  expect(homeSource).toContain('href="#/marketplace"');
  expect(homeSource).toContain('Explore Investor Demo');
  expect(homeSource).toContain('href="#/investor/pilots/fidlot"');
  expect(homeSource).toContain('Explore Farmer Demo');
  expect(homeSource).toContain('href="#farmer/pilots"');
  expect(homeSource).toContain('Explore Operator Demo');
  expect(homeSource).toContain('href="#demo/admin"');
  expect(homeSource).toContain('Investor Testnet Login');
});

test('demo routes are public while live protected routes still require auth', () => {
  const publicRoutesStart = appJs.indexOf('const investorPilot');
  const authGuardIndex = appJs.indexOf('if (!auth)', publicRoutesStart);
  expect(publicRoutesStart).toBeGreaterThan(-1);
  expect(authGuardIndex).toBeGreaterThan(publicRoutesStart);

  const publicRoutesSource = appJs.slice(publicRoutesStart, authGuardIndex);
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
