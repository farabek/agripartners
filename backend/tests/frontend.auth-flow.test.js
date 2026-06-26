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
  expect(appJs).toContain('New users start with "Create NEAR Testnet Wallet."');
  expect(appJs).toContain('Have admin-provided credentials?');
  expect(appJs).toContain('Sign in here with the username and password provided by a platform admin.');
  expect(appJs).toContain('Need help? Show step-by-step guide');
});

test('login screen links back to the home page', () => {
  const loginStart = appJs.indexOf('function showLogin()');
  expect(loginStart).toBeGreaterThan(-1);
  const loginBody = appJs.slice(loginStart, loginStart + 1200);
  expect(loginBody).toContain('href="#home"');
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
