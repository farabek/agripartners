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
  expect(appJs).toContain('Admin / Platform Operators');
  expect(appJs).toContain('Alpha v1.2');
  expect(appJs).toContain('NEAR Testnet');
  expect(appJs).toContain('Demo / Live separation');
});

test('landing describes core demonstration capabilities', () => {
  for (const phrase of [
    'Live testnet workflows',
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

test('landing CTAs route to explicit demo and login destinations', () => {
  expect(appJs).toContain('Explore Investor Demo');
  expect(appJs).toContain('href="#/investor/pilots/fidlot"');
  expect(appJs).toContain('Explore Farmer Demo');
  expect(appJs).toContain('href="#farmer/pilots/hissar"');
  expect(appJs).toContain('Explore Admin Demo');
  expect(appJs).toContain('href="#demo/admin"');
  expect(appJs).toContain('id="home-login-wallet"');
  expect(appJs).toContain('href="#login"');
});

test('demo routes are public while live protected routes still require auth', () => {
  const publicRoutesStart = appJs.indexOf('const investorPilot');
  const authGuardIndex = appJs.indexOf('if (!auth)', publicRoutesStart);
  expect(publicRoutesStart).toBeGreaterThan(-1);
  expect(authGuardIndex).toBeGreaterThan(publicRoutesStart);

  const publicRoutesSource = appJs.slice(publicRoutesStart, authGuardIndex);
  expect(publicRoutesSource).toContain('showInvestorPilotProfile(investorPilot[1])');
  expect(publicRoutesSource).toContain('showFarmerPilotProfile(farmerPilot[1])');
  expect(publicRoutesSource).toContain('showAdminPilotDetail(adminPilot[1])');
  expect(publicRoutesSource).toContain('showAdminDemoPortal()');
  expect(publicRoutesSource).toContain('showMarketplace()');

  const protectedSource = appJs.slice(authGuardIndex, appJs.indexOf("if (hash === '#farmer')"));
  expect(protectedSource).toContain("location.hash = '#home'");
});

test('existing login form and wallet login behavior remain available', () => {
  expect(appJs).toContain('function showLogin()');
  expect(appJs).toContain('id="login-form"');
  expect(appJs).toContain('id="login-near-wallet"');
  expect(appJs).toContain('document.getElementById(\'login-near-wallet\').addEventListener(\'click\', handleWalletLogin)');
  expect(appJs).toContain('async function handleLogin(username, password)');
  expect(appJs).toContain("fetch(`${API_BASE}/api/auth/login`");
});
