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
  const helperBody = appJs.slice(helperStart, helperStart + 1600);

  expect(helperBody).toContain('ensureWalletSelectorSession');
  expect(helperBody).toContain('wallet.signAndSendTransaction');
  expect(helperBody).toContain('receiverId: contractId');
  expect(helperBody).toContain('callbackUrl: window.location.href');
  expect(helperBody).toContain("type: 'FunctionCall'");
  expect(helperBody).toContain('methodName');
  expect(helperBody).toContain('deposit');
});

test('wallet selector debug helpers are exposed in local development', () => {
  expect(appJs).toContain('function exposeWalletDebugHelpers');
  expect(appJs).toContain('window.__apDebug');
  expect(appJs).toContain('get selector() { return walletSelector; }');
  expect(appJs).toContain('getMyNearWallet');
  expect(appJs).toContain('getWalletSelector');
});

test('wallet selector session is inspected and restored before signing', () => {
  const snapshotStart = appJs.indexOf('function getWalletSelectorSnapshot');
  expect(snapshotStart).toBeGreaterThan(-1);
  const snapshotBody = appJs.slice(snapshotStart, snapshotStart + 700);
  expect(snapshotBody).toContain('selector.store.getState()');
  expect(snapshotBody).toContain('selectedWalletId');
  expect(snapshotBody).toContain('accounts');
  expect(snapshotBody).toContain('activeAccount');

  const ensureStart = appJs.indexOf('async function ensureWalletSelectorSession');
  expect(ensureStart).toBeGreaterThan(-1);
  const ensureBody = appJs.slice(ensureStart, ensureStart + 1800);

  expect(ensureBody).toContain('accounts');
  expect(ensureBody).toContain('activeAccount');
  expect(ensureBody).toContain('selector.setActiveAccount(expectedAccountId)');
  expect(ensureBody).toContain('wallet.signIn');
  expect(ensureBody).toContain('methodNames: [methodName]');
  expect(ensureBody).toContain('accounts?.some((account) => account.accountId === expectedAccountId)');
});

test('wallet selector debug logging includes wallet state and wallet object', () => {
  const debugStart = appJs.indexOf('function logWalletSelectorDebug');
  expect(debugStart).toBeGreaterThan(-1);
  const debugBody = appJs.slice(debugStart, debugStart + 900);

  expect(debugBody).toContain('console.debug');
  expect(debugBody).toContain('selectedWalletId');
  expect(debugBody).toContain('state: snapshot.state');
  expect(debugBody).toContain('accounts: snapshot.accounts');
  expect(debugBody).toContain('activeAccount: snapshot.activeAccount');
  expect(debugBody).toContain('wallet');
});
