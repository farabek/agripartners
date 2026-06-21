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
