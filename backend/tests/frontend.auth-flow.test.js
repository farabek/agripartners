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

test('wallet contract helper signs function call transactions through MyNearWallet', () => {
  const helperStart = appJs.indexOf('async function signAndSendWalletFunctionCall');
  expect(helperStart).toBeGreaterThan(-1);
  const helperBody = appJs.slice(helperStart, helperStart + 1000);

  expect(helperBody).toContain('getMyNearWallet()');
  expect(helperBody).toContain('wallet.signAndSendTransaction');
  expect(helperBody).toContain('receiverId: contractId');
  expect(helperBody).toContain("type: 'FunctionCall'");
  expect(helperBody).toContain('methodName');
  expect(helperBody).toContain('deposit');
});
