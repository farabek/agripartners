const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(
  path.join(__dirname, '..', '..', 'frontend', 'app.js'),
  'utf8'
);

test('frontend auth session is written to localStorage and sessionStorage', () => {
  expect(appJs).toContain("const AUTH_STORAGE_KEY = 'ap_auth'");
  expect(appJs).toContain('localStorage.setItem(AUTH_STORAGE_KEY, value)');
  expect(appJs).toContain('sessionStorage.setItem(AUTH_STORAGE_KEY, value)');
});

test('frontend auth headers can recover wallet auth from either storage', () => {
  expect(appJs).toContain('for (const storage of [localStorage, sessionStorage])');
  expect(appJs).toContain('return auth ? { Authorization: `Bearer ${auth.token}` } : {}');
});

test('onboarding profile creation sends wallet authorization header', () => {
  const submitOnboardingStart = appJs.indexOf('async function submitOnboarding');
  expect(submitOnboardingStart).toBeGreaterThan(-1);
  const submitOnboardingBody = appJs.slice(submitOnboardingStart, submitOnboardingStart + 1800);

  expect(submitOnboardingBody).toContain("fetch(`${API_BASE}/api/profile/onboarding`");
  expect(submitOnboardingBody).toContain('headers: jsonAuthHeaders()');
});

test('frontend uses browser-safe wallet redirect and the Render API', () => {
  expect(appJs).toContain("const API_BASE = 'https://agripartners-zlp2.onrender.com'");
  expect(appJs).toContain("const MY_NEAR_WALLET_URL = 'https://testnet.mynearwallet.com'");
  expect(appJs).toContain("new URL('/sign-message', MY_NEAR_WALLET_URL)");
  expect(appJs).toContain("walletUrl.searchParams.set('nonce', nonceBase64)");
  expect(appJs).not.toContain("from 'buffer'");
  expect(appJs).not.toContain('near-api-js');
  expect(appJs).not.toContain('@near-wallet-selector');
  expect(appJs).not.toContain('Buffer.');
});

test('login copy explains wallet onboarding and platform credentials', () => {
  expect(appJs).toContain('NEAR login is Alpha infrastructure for Investors and operators.');
  expect(appJs).toContain('Farmers work through AgriPartners-managed onboarding and future fiat workflows.');
  expect(appJs).toContain('For admin-provided accounts');
  expect(appJs).toContain('Sign in here only if a platform admin gave you a username and password.');
  expect(appJs).toContain('Need help? Show step-by-step guide');
});

test('login screen links back to the home page', () => {
  const loginStart = appJs.indexOf('function showLogin()');
  expect(loginStart).toBeGreaterThan(-1);
  const loginBody = appJs.slice(loginStart, loginStart + 2600);
  expect(loginBody).toContain('href="/"');
  expect(loginBody).toContain('text-lg leading-none');
  expect(loginBody).toContain('Back home');
});

test('login screen presents NEAR wallet before platform account access', () => {
  const walletIndex = appJs.indexOf('id="login-near-wallet"');
  const platformIndex = appJs.indexOf('Platform account access');
  expect(walletIndex).toBeGreaterThan(-1);
  expect(platformIndex).toBeGreaterThan(-1);
  expect(walletIndex).toBeLessThan(platformIndex);
});

test('investor login omits pilot and destination previews while retaining both login methods', () => {
  const loginStart = appJs.indexOf('function showLogin()');
  const loginBody = appJs.slice(loginStart, loginStart + 9000);
  const walletHandlerStart = appJs.indexOf('async function handleWalletLogin()');
  const walletHandlerBody = appJs.slice(walletHandlerStart, walletHandlerStart + 1800);

  expect(loginBody).toContain("entryRole && entryRole !== 'investor' ? renderEnvironmentBanner");
  expect(loginBody).toContain("entryRole && entryRole !== 'investor' ? renderRoleEntrySummary(entryRole)");
  expect(loginBody).not.toContain('Pilot 1.0 Preparation');
  expect(loginBody).not.toContain('After signing in, you can access:');
  expect(loginBody).not.toContain('Investment Models');
  expect(loginBody).not.toContain('Portfolio');
  expect(loginBody).toContain('Continue with NEAR Wallet to Investor Dashboard');
  expect(loginBody).toContain('For admin-provided accounts');
  expect(loginBody).toContain('Sign in here only if a platform admin gave you a username and password.');
  expect(walletHandlerBody).toContain("btn.dataset.defaultLabel || 'Login with NEAR Wallet'");
});

test('role-specific login entries preserve generic auth and keep Farmer access non-wallet-first', () => {
  const routeStart = appJs.indexOf('function route()');
  const routeBody = appJs.slice(routeStart, routeStart + 5200);
  const loginStart = appJs.indexOf('function showLogin()');
  const loginBody = appJs.slice(loginStart, loginStart + 9000);

  expect(routeBody).toContain("hash.match(/^#login\\/(investor|farmer|admin)$/)");
  expect(routeBody).toContain('showLogin(loginEntry[1])');
  expect(loginBody).toContain("const showWalletAccess = entryRole == null || entryRole === 'investor'");
  expect(loginBody).toContain("entryRole === 'farmer'");
  expect(loginBody).toContain('My Projects, Funding Confirmation, and Reports');
  expect(loginBody).toContain("document.getElementById('login-near-wallet')?.addEventListener");
});
