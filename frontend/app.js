import { Buffer } from 'buffer';

globalThis.global = globalThis;
globalThis.Buffer = Buffer;

if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

const { setupWalletSelector } = await import('@near-wallet-selector/core');
const { setupMyNearWallet } = await import('@near-wallet-selector/my-near-wallet');

const API_BASE = ['localhost', '127.0.0.1'].includes(window.location.hostname)
  ? 'http://localhost:3000'
  : 'https://agripartners.onrender.com';
const NEAR_WALLET_NETWORK = 'testnet';
const NEAR_RPC_URL = import.meta.env.VITE_NEAR_RPC_URL || 'https://test.rpc.fastnear.com';
const NEAR_WALLET_NETWORK_CONFIG = {
  networkId: NEAR_WALLET_NETWORK,
  nodeUrl: NEAR_RPC_URL,
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://testnet.nearblocks.io',
  indexerUrl: 'https://testnet-api.kitwallet.app',
};
const WALLET_AUTH_CHALLENGE_KEY = 'ap_wallet_auth_challenge';
const AUTH_STORAGE_KEY = 'ap_auth';
const LOCAL_MVP_ADMIN_WALLETS = ['farab.testnet'];

let walletSelector;

// --- Auth state ---

function getAuth() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem(AUTH_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // Try the next storage backend.
    }
  }
  return null;
}

function setAuth(token, user) {
  const value = JSON.stringify({ token, user });
  try { localStorage.setItem(AUTH_STORAGE_KEY, value); } catch {}
  try { sessionStorage.setItem(AUTH_STORAGE_KEY, value); } catch {}
}

function updateAuthUser(updates) {
  const auth = getAuth();
  if (!auth) return;
  setAuth(auth.token, { ...auth.user, ...updates });
}

function clearAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(WALLET_AUTH_CHALLENGE_KEY);
}

function authHeaders() {
  const auth = getAuth();
  return auth ? { Authorization: `Bearer ${auth.token}` } : {};
}

function jsonAuthHeaders() {
  return { ...authHeaders(), 'Content-Type': 'application/json' };
}

function isAdmin() {
  const user = getAuth()?.user;
  return user?.role === 'admin' || isAdminWalletUser(user);
}

function isWalletAuth() {
  return getAuth()?.user?.auth_type === 'wallet';
}

function getConnectedWalletAccount() {
  const user = getAuth()?.user;
  if (user?.auth_type !== 'wallet') return '';
  return user.account_id || user.near_account || '';
}

function getNearWalletAccount() {
  return getConnectedWalletAccount();
}

function isLocalMvpHost() {
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
}

function isAdminWalletUser(user) {
  const accountId = user?.account_id || user?.near_account || user?.username;
  return isLocalMvpHost() && LOCAL_MVP_ADMIN_WALLETS.includes(accountId);
}

function portalHashForRole(role) {
  if (role === 'farmer') return '#farmer';
  if (role === 'investor') return '#investor';
  if (role === 'admin') return '#admin';
  return '#deals';
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.error || `Request failed with ${response.status}`);
  }
  return data;
}

async function readJsonResponse(response) {
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`Expected JSON from ${response.url}; received ${contentType || 'unknown content type'}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from ${response.url}`);
  }
}

function walletCallbackUrl() {
  return `${window.location.origin}${window.location.pathname}`;
}

async function getWalletSelector() {
  if (walletSelector) return walletSelector;
  walletSelector = await setupWalletSelector({
    network: NEAR_WALLET_NETWORK_CONFIG,
    modules: [setupMyNearWallet()],
  });
  exposeWalletDebugHelpers();
  return walletSelector;
}

async function getMyNearWallet() {
  const selector = await getWalletSelector();
  const wallet = await selector.wallet('my-near-wallet');
  logWalletSelectorDebug('getMyNearWallet', selector, wallet);
  return wallet;
}

function getWalletSelectorSnapshot(selector) {
  const state = selector.store.getState();
  const activeAccount = state.accounts.find((account) => account.active) || state.accounts[0] || null;
  return {
    state,
    selectedWalletId: state.selectedWalletId,
    accounts: state.accounts,
    activeAccount,
  };
}

function logWalletSelectorDebug(label, selector, wallet = null) {
  if (!isLocalMvpHost()) return;
  const snapshot = getWalletSelectorSnapshot(selector);
  console.debug(`[wallet-selector:${label}]`, {
    selectedWalletId: snapshot.selectedWalletId,
    state: snapshot.state,
    accounts: snapshot.accounts,
    activeAccount: snapshot.activeAccount,
    wallet,
  });
}

function exposeWalletDebugHelpers() {
  if (!isLocalMvpHost() || typeof window === 'undefined') return;
  window.__apDebug = {
    get selector() { return walletSelector; },
    getMyNearWallet,
    getWalletSelector,
  };
}

async function ensureWalletSelectorSession({ contractId, methodName, expectedAccountId }) {
  const selector = await getWalletSelector();
  const wallet = await getMyNearWallet();
  const snapshot = getWalletSelectorSnapshot(selector);
  const matchingAccount = snapshot.accounts.find((account) => account.accountId === expectedAccountId);

  logWalletSelectorDebug('before-sign', selector, wallet);

  if (matchingAccount) {
    selector.setActiveAccount(expectedAccountId);
    logWalletSelectorDebug('active-account-restored', selector, wallet);
    return { selector, wallet, accountId: expectedAccountId };
  }

  if (selector.isSignedIn() || snapshot.accounts.length > 0) {
    const activeAccount = snapshot.activeAccount?.accountId || 'unknown';
    throw new Error(`Wallet Selector is signed in as ${activeAccount}. Sign out and log in as ${expectedAccountId}.`);
  }

  const accounts = await wallet.signIn({
    contractId,
    methodNames: [methodName],
    successUrl: window.location.href,
    failureUrl: window.location.href,
  });
  if (accounts?.some((account) => account.accountId === expectedAccountId)) {
    selector.setActiveAccount(expectedAccountId);
    logWalletSelectorDebug('signed-in-before-sign', selector, wallet);
    return { selector, wallet, accountId: expectedAccountId };
  }
  throw new Error('Wallet connection approval is required. Approve MyNearWallet, then retry withdrawal.');
}

async function signAndSendWalletFunctionCall({ contractId, methodName, args = {}, gas = '100000000000000', deposit = '0', expectedAccountId = null }) {
  const { wallet } = expectedAccountId
    ? await ensureWalletSelectorSession({ contractId, methodName, expectedAccountId })
    : { wallet: await getMyNearWallet() };
  return wallet.signAndSendTransaction({
    receiverId: contractId,
    callbackUrl: window.location.href,
    actions: [
      {
        type: 'FunctionCall',
        params: {
          methodName,
          args,
          gas,
          deposit,
        },
      },
    ],
  });
}

function readWalletCallbackParams() {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const hashParams = new URLSearchParams(hash);

  for (const [key, value] of hashParams.entries()) {
    if (!params.has(key)) params.set(key, value);
  }

  return Object.fromEntries(params.entries());
}

function cleanWalletAuthCallbackUrl(targetHash = '#investor') {
  const url = new URL(window.location.href);
  ['accountId', 'account_id', 'publicKey', 'public_key', 'signature', 'callbackUrl', 'state'].forEach(key => {
    url.searchParams.delete(key);
  });
  url.hash = targetHash;
  window.history.replaceState({}, document.title, url.toString());
}

function buildWalletUser(verified) {
  return {
    role: 'wallet',
    username: verified.account_id,
    auth_type: 'wallet',
    account_id: verified.account_id,
    near_account: verified.account_id,
    public_key: verified.public_key,
    network: verified.network,
  };
}

async function fetchMyProfile() {
  const res = await fetch(`${API_BASE}/api/profile/me`, { headers: authHeaders() });
  const data = await readJsonResponse(res);
  if (res.status === 401) {
    clearAuth();
    location.hash = '#login';
    throw new Error('Wallet session expired');
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function applyProfileToAuth(profile) {
  if (!profile) return;
  updateAuthUser({
    role: profile.role,
    display_name: profile.displayName,
    profile,
  });
}

async function resolveWalletLandingHash() {
  const data = await fetchMyProfile();
  if (data.needsOnboarding || !data.profile) return '#/onboarding';
  applyProfileToAuth(data.profile);
  return portalHashForRole(data.profile.role);
}

async function loginWithNearWallet() {
  const wallet = await getMyNearWallet();
  const challenge = await postJson('/api/wallet-auth/challenge');
  challenge.callbackUrl = walletCallbackUrl();
  localStorage.setItem(WALLET_AUTH_CHALLENGE_KEY, JSON.stringify(challenge));

  const nonce = Buffer.from(challenge.nonceBase64, 'base64');
  if (nonce.length !== 32) {
    throw new Error(`Challenge nonce must decode to exactly 32 bytes; received ${nonce.length}`);
  }

  await wallet.signMessage({
    message: challenge.message,
    recipient: challenge.recipient,
    nonce,
    callbackUrl: challenge.callbackUrl,
  });
}

async function verifyWalletCallbackIfPresent() {
  const params = readWalletCallbackParams();
  if (!params.signature) return false;

  try {
    const challengeRaw = localStorage.getItem(WALLET_AUTH_CHALLENGE_KEY);
    if (!challengeRaw) throw new Error('Wallet challenge was not found. Please try logging in again.');
    const challenge = JSON.parse(challengeRaw);
    const verified = await postJson('/api/wallet-auth/verify', {
      account_id: params.accountId || params.account_id,
      public_key: params.publicKey || params.public_key,
      signature: params.signature?.replace(/ /g, '+'),
      nonce: challenge.nonce,
      callbackUrl: challenge.callbackUrl || walletCallbackUrl(),
    });

    if (!verified.token) throw new Error('Wallet verification did not return a token');
    setAuth(verified.token, buildWalletUser(verified));
    localStorage.removeItem(WALLET_AUTH_CHALLENGE_KEY);
    const targetHash = await resolveWalletLandingHash();
    cleanWalletAuthCallbackUrl(targetHash);
    return true;
  } catch (err) {
    localStorage.removeItem(WALLET_AUTH_CHALLENGE_KEY);
    cleanWalletAuthCallbackUrl();
    sessionStorage.setItem('ap_login_error', err.message || 'Wallet login failed');
    return false;
  }
}

// --- Utilities ---

function yoctoToNear(yocto) {
  if (!yocto || yocto === '0') return '0.00 NEAR';
  const n = BigInt(yocto);
  const one = BigInt('1000000000000000000000000');
  const whole = n / one;
  const frac = (n % one) * 100n / one;
  return `${whole}.${frac.toString().padStart(2, '0')} NEAR`;
}

function yoctoToNearFloat(yocto) {
  if (!yocto || yocto === '0') return 0;
  const n = BigInt(yocto);
  const one = BigInt('1000000000000000000000000');
  const whole = Number(n / one);
  const frac = Number((n % one) * 10000n / one) / 10000;
  return whole + frac;
}

function formatYoctoRaw(yocto) {
  return `${yocto || '0'} yoctoNEAR`;
}

function addYocto(a, b) {
  return (BigInt(a || '0') + BigInt(b || '0')).toString();
}

function hasPositiveYocto(value) {
  return BigInt(value || '0') > 0n;
}

function nearToYocto(near) {
  const value = String(near || '').trim();
  if (!/^\d+(\.\d{1,24})?$/.test(value)) {
    throw new Error('Enter a valid NEAR amount with up to 24 decimal places');
  }
  const [whole, frac = ''] = value.split('.');
  return (BigInt(whole) * BigInt('1000000000000000000000000')
    + BigInt(frac.padEnd(24, '0'))).toString();
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatAddress(addr) {
  if (!addr) return '—';
  if (addr.length <= 20) return addr;
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

function statusBadge(status) {
  if (!status) return '<span class="badge badge-Initialized">—</span>';
  return `<span class="badge badge-${status}">${status}</span>`;
}

// --- Router ---

function showView(viewId) {
  ['view-login', 'view-list', 'view-detail', 'view-investor', 'view-farmer', 'view-admin', 'view-onboarding'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(viewId).classList.remove('hidden');
}

async function redirectAuthenticatedUser() {
  const auth = getAuth();
  if (!auth) {
    location.hash = '#login';
    return;
  }
  if (auth.user?.auth_type === 'wallet') {
    try {
      location.hash = await resolveWalletLandingHash();
    } catch (err) {
      sessionStorage.setItem('ap_login_error', err.message || 'Unable to load wallet profile');
      clearAuth();
      location.hash = '#login';
    }
    return;
  }
  location.hash = portalHashForRole(auth.user.role);
}

function route() {
  const auth = getAuth();
  const hash = location.hash;

  if (hash === '#login') {
    if (auth) { redirectAuthenticatedUser(); return; }
    showLogin();
    return;
  }

  if (!auth) {
    location.hash = '#login';
    return;
  }

  if (hash === '#/onboarding' || hash === '#onboarding') {
    showOnboarding();
    return;
  }

  const farmerDeal = hash.match(/^#farmer\/deals\/(\d+)$/);
  if (farmerDeal) {
    showFarmerDeal(farmerDeal[1]);
    return;
  }

  if (hash === '#farmer') {
    showFarmerPortal();
    return;
  }

  const investorDeal = hash.match(/^#investor\/deals\/(\d+)$/);
  if (investorDeal) {
    showInvestorDeal(investorDeal[1]);
    return;
  }

  if (hash === '#investor') {
    showInvestorPortal();
    return;
  }

  if (hash === '#admin' || hash === '#/admin') {
    if (!isAdmin()) {
      location.hash = portalHashForRole(auth.user.role);
      return;
    }
    showAdminPortal();
    return;
  }

  const m = hash.match(/^#deals\/(\d+)$/);
  if (m) {
    showDeal(m[1]);
  } else {
    if (auth.user.role === 'investor' && !isAdmin()) {
      location.hash = '#investor';
    } else {
      showDeals();
    }
  }
}

async function initializeApp() {
  await verifyWalletCallbackIfPresent();
  if (!location.hash || location.hash === '#') {
    const auth = getAuth();
    if (auth) {
      await redirectAuthenticatedUser();
    } else {
      location.hash = '#login';
    }
  } else {
    route();
  }
}

window.addEventListener('hashchange', route);
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// --- Login ---

function showLogin() {
  showView('view-login');
  const el = document.getElementById('view-login');
  const pendingLoginError = sessionStorage.getItem('ap_login_error');
  sessionStorage.removeItem('ap_login_error');
  el.innerHTML = `
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-green-400">AgriPartners</h1>
      <p class="text-slate-400 mt-1">Sign in to your account</p>
    </div>
    <form id="login-form" class="bg-slate-800 rounded-xl p-6 space-y-4">
      <div>
        <label class="block text-sm text-slate-400 mb-1">Username</label>
        <input id="login-username" type="text" autocomplete="username"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
      </div>
      <div>
        <label class="block text-sm text-slate-400 mb-1">Password</label>
        <div class="relative">
          <input id="login-password" type="password" autocomplete="current-password"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 pr-12 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
          <button type="button" id="toggle-password"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100">
            👁
          </button>
        </div>
      </div>
      <div id="login-error" class="hidden bg-red-900 text-red-200 px-3 py-2 rounded text-sm"></div>
      <button type="submit"
        class="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium transition">
        Sign In
      </button>
      <div class="flex items-center gap-3 py-1">
        <span class="h-px flex-1 bg-slate-700"></span>
        <span class="text-xs uppercase tracking-wide text-slate-500">or</span>
        <span class="h-px flex-1 bg-slate-700"></span>
      </div>
      <button type="button" id="login-near-wallet"
        class="w-full bg-slate-100 hover:bg-white text-slate-950 py-2 rounded-lg font-medium transition">
        Login with NEAR Wallet
      </button>
      <div class="bg-slate-900 border border-slate-700 rounded-lg p-4 space-y-3">
        <div>
          <h2 class="text-sm font-semibold text-slate-100">New to AgriPartners?</h2>
          <p class="text-sm text-slate-400 mt-1">
            Create or import a NEAR testnet wallet first, then return here and click Login with NEAR Wallet.
          </p>
        </div>
        <div class="grid gap-2 sm:grid-cols-2">
          <a href="https://testnet.mynearwallet.com/create" target="_blank" rel="noopener noreferrer"
            class="text-center bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
            Create NEAR Testnet Wallet
          </a>
          <a href="https://testnet.mynearwallet.com/recover-account" target="_blank" rel="noopener noreferrer"
            class="text-center bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
            Import Existing Wallet
          </a>
        </div>
      </div>
    </form>
  `;
  if (pendingLoginError) {
    const errEl = document.getElementById('login-error');
    errEl.textContent = pendingLoginError;
    errEl.classList.remove('hidden');
  }
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    await handleLogin(
      document.getElementById('login-username').value.trim(),
      document.getElementById('login-password').value
    );
  });
  document.getElementById('toggle-password').addEventListener('click', () => {
    const input = document.getElementById('login-password');
    const btn = document.getElementById('toggle-password');

    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁';
    }
  });
  document.getElementById('login-near-wallet').addEventListener('click', handleWalletLogin);
}

async function handleLogin(username, password) {
  const errEl = document.getElementById('login-error');
  const btn = document.querySelector('#login-form button[type="submit"]');
  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Signing in...';
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Login failed';
      errEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Sign In';
      return;
    }
    setAuth(data.token, data.user);
    location.hash = portalHashForRole(data.user.role);
  } catch {
    errEl.textContent = 'Server unavailable';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

async function handleWalletLogin() {
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-near-wallet');
  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Opening wallet...';

  try {
    await loginWithNearWallet();
  } catch (err) {
    errEl.textContent = err.message || 'Wallet login failed';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Login with NEAR Wallet';
  }
}

async function logout() {
  try {
    if (walletSelector?.isSignedIn()) {
      const wallet = await getMyNearWallet();
      await wallet.signOut();
    }
  } catch (err) {
    console.warn('Wallet sign out failed', err);
  }
  clearAuth();
  location.hash = '#login';
}

window.logout = logout;

// --- Nav bar ---

function renderNav() {
  const auth = getAuth();
  if (!auth) return '';
  const labels = { farmer: 'Farmer', investor: 'Investor', admin: 'Administrator' };
  const roleLabel = isWalletAuth() ? 'Wallet Account' : (labels[auth.user.role] || auth.user.role);
  const displayName = isWalletAuth() ? auth.user.account_id : auth.user.username;
  return `
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
      <span class="text-sm text-slate-400">${roleLabel}: <span class="text-slate-200 font-medium">${escapeHtml(displayName)}</span></span>
      <div class="flex items-center gap-3">
        <a href="#investor" class="text-sm text-slate-400 hover:text-green-400 transition">Investor Portal</a>
        <a href="#farmer" class="text-sm text-slate-400 hover:text-green-400 transition">Farmer Portal</a>
        ${isAdmin() ? '<a href="#admin" class="text-sm text-slate-400 hover:text-green-400 transition">Admin Portal</a>' : ''}
        ${isAdmin() ? '<a href="#deals" class="text-sm text-slate-400 hover:text-green-400 transition">Admin Dashboard</a>' : ''}
        <button onclick="logout()" class="text-sm text-slate-400 hover:text-red-400 transition">Sign out →</button>
      </div>
    </div>
  `;
}

// --- Admin Portal ---

async function fetchAdminJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? jsonAuthHeaders() : authHeaders()),
      ...(options.headers || {}),
    },
  });
  const data = await readJsonResponse(res);
  if (res.status === 401) {
    clearAuth();
    location.hash = '#login';
    throw new Error('Session expired');
  }
  if (res.status === 403) throw new Error('Admin access required');
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function profileOptionLabel(profile) {
  const name = profile.displayName || profile.organizationName || profile.walletAccountId;
  return `${name} (${profile.walletAccountId})`;
}

function renderProfileOptions(profiles) {
  return profiles.map(profile => `
    <option value="${escapeHtml(profile.walletAccountId)}">${escapeHtml(profileOptionLabel(profile))}</option>
  `).join('');
}

async function showAdminPortal() {
  showView('view-admin');
  const el = document.getElementById('view-admin');
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
        <h1 class="text-3xl font-bold text-green-400 mb-1">Admin Portal</h1>
        <p class="text-slate-400">Create a new deal for existing wallet profiles.</p>
      </div>
      <a href="#deals" class="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Open Dashboard</a>
    </div>
    <div id="admin-create-content" class="bg-slate-800 rounded-xl p-5">
      <div class="spinner"></div>
    </div>
  `;

  const contentEl = document.getElementById('admin-create-content');
  try {
    const [farmersData, investorsData] = await Promise.all([
      fetchAdminJson('/api/admin/farmers'),
      fetchAdminJson('/api/admin/investors'),
    ]);
    renderAdminCreateForm(contentEl, farmersData.farmers || [], investorsData.investors || []);
  } catch (err) {
    contentEl.innerHTML = `<div class="bg-red-900 text-red-200 px-4 py-3 rounded">Admin Portal unavailable: ${escapeHtml(err.message)}</div>`;
  }
}

function renderAdminCreateForm(el, farmers, investors) {
  const hasProfiles = farmers.length > 0 && investors.length > 0;
  el.innerHTML = `
    <form id="admin-create-deal-form" class="space-y-4">
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-investor">Investor</label>
          <select id="admin-investor" required
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500">
            ${renderProfileOptions(investors)}
          </select>
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-farmer">Farmer</label>
          <select id="admin-farmer" required
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500">
            ${renderProfileOptions(farmers)}
          </select>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-amount">Amount</label>
          <input id="admin-amount" type="number" min="0" step="0.000001" required placeholder="132"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1" for="admin-title">Title</label>
          <input id="admin-title" type="text" maxlength="120" required placeholder="Greenhouse expansion"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
      </div>
      <div>
        <label class="block text-sm text-slate-400 mb-1" for="admin-description">Description</label>
        <textarea id="admin-description" rows="4" required placeholder="Short deal summary"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500"></textarea>
      </div>
      <div id="admin-create-result" class="hidden rounded-lg px-4 py-3 text-sm"></div>
      <button type="submit" ${hasProfiles ? '' : 'disabled'}
        class="bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:text-slate-400 text-white px-4 py-2 rounded-lg font-medium transition">
        Create Deal
      </button>
      ${hasProfiles ? '' : '<p class="text-sm text-slate-400">Add at least one farmer and one investor profile before creating a deal.</p>'}
    </form>
  `;

  document.getElementById('admin-create-deal-form').addEventListener('submit', createAdminDeal);
}

function showAdminCreateResult(type, html) {
  const el = document.getElementById('admin-create-result');
  if (!el) return;
  el.className = `${type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'} rounded-lg px-4 py-3 text-sm`;
  el.innerHTML = html;
  el.classList.remove('hidden');
}

async function createAdminDeal(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Creating...';
  showAdminCreateResult('success', 'Creating deal and deploying contract...');

  const payload = {
    investor_wallet: document.getElementById('admin-investor').value,
    farmer_wallet: document.getElementById('admin-farmer').value,
    amount: document.getElementById('admin-amount').value,
    title: document.getElementById('admin-title').value.trim(),
    description: document.getElementById('admin-description').value.trim(),
  };

  try {
    const created = await fetchAdminJson('/api/admin/deals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const dealId = created.deal_id || created.id;
    showAdminCreateResult('success', `
      <div class="font-semibold">Deal created successfully</div>
      <div class="mt-2">Deal #${escapeHtml(dealId)}</div>
      <div class="font-mono break-all text-xs mt-1">Contract address: ${escapeHtml(created.contract_address || 'Pending deployment')}</div>
      <div class="flex flex-wrap gap-2 mt-3">
        <a href="#deals/${escapeHtml(dealId)}" class="underline">Open Admin Deal</a>
        <a href="#farmer" class="underline">View in Farmer Portal</a>
        <a href="#investor" class="underline">View in Investor Portal</a>
      </div>
    `);
    form.reset();
  } catch (err) {
    showAdminCreateResult('error', `Create deal failed: ${escapeHtml(err.message)}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Deal';
  }
}

// --- Deals list ---

async function showDeals() {
  showView('view-list');
  const el = document.getElementById('view-list');
  el.innerHTML = `
    ${renderNav()}
    <h1 class="text-3xl font-bold text-green-400 mb-1">AgriPartners</h1>
    <p class="text-slate-400 mb-6">Agricultural investments on NEAR Protocol</p>
    <div class="mb-6">
      <a href="#investor" class="inline-flex bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Open Investor Portal</a>
      <a href="#farmer" class="inline-flex bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition ml-2">Open Farmer Portal</a>
    </div>
    <div class="spinner"></div>
  `;
  try {
    const res = await fetch(`${API_BASE}/api/me/deals`, { headers: authHeaders() });
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const deals = await res.json();
    el.querySelector('.spinner').remove();
    if (deals.length === 0) {
      el.innerHTML += '<p class="text-slate-400 mt-4">No deals found</p>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'grid gap-4';
    deals.forEach(d => { grid.innerHTML += renderDealCard(d); });
    el.appendChild(grid);
  } catch (e) {
    el.querySelector('.spinner')?.remove();
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Backend unavailable: ${e.message}</div>`;
  }
}

function renderDealCard(d) {
  const dealTitle = d.title || d.deal_type;
  return `
    <div class="bg-slate-800 rounded-xl p-5 flex justify-between items-center gap-4">
      <div class="space-y-1 min-w-0">
        <h2 class="text-lg font-semibold text-slate-100 truncate">Deal #${escapeHtml(d.id)} &mdash; ${escapeHtml(dealTitle)}</h2>
        ${d.description ? `<p class="text-sm text-slate-300">${escapeHtml(d.description)}</p>` : ''}
        <p class="text-sm text-slate-400">Farmer: <span class="text-slate-200">${formatAddress(d.farmer)}</span></p>
        <p class="text-sm text-slate-400">Investor: <span class="text-slate-200">${formatAddress(d.investor)}</span></p>
        <p class="text-sm text-slate-500">${d.total_cycles} cycle(s) × ${d.cycle_duration_days} days  ·  ${yoctoToNear(d.investment_amount)}</p>
      </div>
      <a href="#deals/${d.id}" class="shrink-0 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Open →</a>
    </div>
  `;
}

// --- Onboarding ---

async function showOnboarding() {
  showView('view-onboarding');
  const el = document.getElementById('view-onboarding');
  const wallet = getNearWalletAccount();

  if (!isWalletAuth() || !wallet) {
    el.innerHTML = `
      <div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200">
        Wallet login is required to create a profile.
      </div>
    `;
    return;
  }

  try {
    const data = await fetchMyProfile();
    if (data.profile) {
      applyProfileToAuth(data.profile);
      location.hash = portalHashForRole(data.profile.role);
      return;
    }
  } catch (err) {
    el.innerHTML = `<div class="bg-red-900 text-red-200 px-4 py-3 rounded">Unable to load profile: ${escapeHtml(err.message)}</div>`;
    return;
  }

  el.innerHTML = `
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-green-400 mb-1">Welcome to AgriPartners</h1>
      <p class="text-slate-400">Create a wallet-linked profile for <span class="text-slate-200 font-mono">${escapeHtml(wallet)}</span></p>
    </div>

    <form id="onboarding-form" class="bg-slate-800 rounded-xl p-6 space-y-5">
      <div>
        <label class="block text-sm text-slate-400 mb-2">Choose your role</label>
        <div class="onboarding-role-grid">
          <button type="button" class="onboarding-role-btn is-selected" data-role="farmer">
            <span class="onboarding-role-title">Farmer</span>
            <span class="onboarding-role-note">Manage farm deals and submit cycle reports.</span>
          </button>
          <button type="button" class="onboarding-role-btn" data-role="investor">
            <span class="onboarding-role-title">Investor</span>
            <span class="onboarding-role-note">Track investments, balances, and withdrawals.</span>
          </button>
        </div>
      </div>

      <input type="hidden" id="onboarding-role" value="farmer" />

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1">Display Name</label>
          <input id="onboarding-display-name" type="text" maxlength="120" required
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Country</label>
          <input id="onboarding-country" type="text" maxlength="80"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Phone</label>
          <input id="onboarding-phone" type="tel" maxlength="40"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Organization / Farm Name</label>
          <input id="onboarding-organization" type="text" maxlength="160"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
      </div>

      <div>
        <label class="block text-sm text-slate-400 mb-1">Bio</label>
        <textarea id="onboarding-bio" rows="4" maxlength="1000"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500"></textarea>
      </div>

      <div id="onboarding-error" class="hidden bg-red-900 text-red-200 px-3 py-2 rounded text-sm"></div>
      <button type="submit" id="btn-create-profile" class="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium transition">
        Create Profile
      </button>
    </form>
  `;

  document.querySelectorAll('.onboarding-role-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.onboarding-role-btn').forEach(item => item.classList.remove('is-selected'));
      btn.classList.add('is-selected');
      document.getElementById('onboarding-role').value = btn.dataset.role;
    });
  });
  document.getElementById('onboarding-form').addEventListener('submit', submitOnboarding);
}

async function submitOnboarding(event) {
  event.preventDefault();
  const errEl = document.getElementById('onboarding-error');
  const btn = document.getElementById('btn-create-profile');
  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Creating profile...';

  const payload = {
    role: document.getElementById('onboarding-role').value,
    displayName: document.getElementById('onboarding-display-name').value.trim(),
    country: document.getElementById('onboarding-country').value.trim(),
    phone: document.getElementById('onboarding-phone').value.trim(),
    organizationName: document.getElementById('onboarding-organization').value.trim(),
    bio: document.getElementById('onboarding-bio').value.trim(),
  };

  try {
    const res = await fetch(`${API_BASE}/api/profile/onboarding`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await readJsonResponse(res);
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    applyProfileToAuth(data.profile);
    location.hash = portalHashForRole(data.profile.role);
  } catch (err) {
    errEl.textContent = err.message || 'Profile creation failed';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Create Profile';
  }
}

// --- Farmer Portal ---

async function fetchFarmerJson(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? jsonAuthHeaders() : authHeaders()),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearAuth();
    location.hash = '#login';
    throw new Error('Wallet session expired');
  }
  if (res.status === 403 || res.status === 404) {
    throw new Error(data.error || 'Farmer deal not found');
  }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

async function showFarmerPortal() {
  showView('view-farmer');
  const el = document.getElementById('view-farmer');
  const connectedWalletAccount = getNearWalletAccount();
  el.innerHTML = `
    ${renderNav()}
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-green-400 mb-1">Farmer Portal</h1>
      <p class="text-slate-400">Wallet: <span class="text-slate-200 font-medium">${escapeHtml(connectedWalletAccount || 'Not connected')}</span></p>
    </div>
    <div id="farmer-dashboard-content">
      <h2 class="text-xl font-semibold mb-4">Active Deals</h2>
      <div class="spinner"></div>
    </div>
  `;

  const contentEl = document.getElementById('farmer-dashboard-content');
  if (!connectedWalletAccount) {
    contentEl.innerHTML = `
      <div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200">
        Farmer Portal access requires a signed NEAR wallet session.
      </div>
    `;
    return;
  }

  try {
    const [profileData, dealsData] = await Promise.all([
      fetchMyProfile(),
      fetchFarmerJson('/api/farmer/deals'),
    ]);
    renderFarmerDashboard(contentEl, dealsData.deals || [], dealsData.farmer, profileData.profile);
  } catch (err) {
    contentEl.querySelector('.spinner')?.remove();
    contentEl.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Farmer Portal unavailable: ${escapeHtml(err.message)}</div>`;
  }
}

function farmerProfileValue(profile, field, fallback = 'Not set') {
  const value = profile?.[field];
  return value ? escapeHtml(value) : fallback;
}

function farmerDashboardMetrics(deals) {
  const totalFunding = deals.reduce(
    (sum, deal) => addYocto(sum, deal.amount || deal.investment_amount || '0'),
    '0'
  );
  const activeCycles = deals.filter((deal) => deal.activeCycleId != null).length;
  return {
    activeDeals: deals.length,
    totalFunding,
    activeCycles,
    pendingReports: 'N/A',
  };
}

function renderFarmerProfilePanel(profile, farmer) {
  return `
    <div class="bg-slate-800 rounded-xl p-5 mb-4">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold text-slate-100">${farmerProfileValue(profile, 'displayName', escapeHtml(farmer || 'Farmer'))}</h2>
          <p class="text-sm text-slate-400 mt-1">${farmerProfileValue(profile, 'organizationName')}</p>
        </div>
        <span class="text-xs font-semibold bg-slate-700 px-2 py-1 rounded text-slate-300">${escapeHtml(profile?.role || 'farmer')}</span>
      </div>
      <div class="grid sm:grid-cols-2 gap-3 mt-4 text-sm">
        <div>
          <span class="block text-slate-500">Display Name</span>
          <span class="text-slate-200">${farmerProfileValue(profile, 'displayName', escapeHtml(farmer || 'Farmer'))}</span>
        </div>
        <div>
          <span class="block text-slate-500">Organization / Farm Name</span>
          <span class="text-slate-200">${farmerProfileValue(profile, 'organizationName')}</span>
        </div>
        <div>
          <span class="block text-slate-500">Country</span>
          <span class="text-slate-200">${farmerProfileValue(profile, 'country')}</span>
        </div>
        <div>
          <span class="block text-slate-500">Wallet account</span>
          <span class="text-slate-200 font-mono break-all">${escapeHtml(farmer || profile?.walletAccountId || 'Not connected')}</span>
        </div>
      </div>
    </div>
  `;
}

function renderFarmerSummaryCards(metrics) {
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div class="metric-box">
        <span class="metric-label">Active Deals</span>
        <span class="metric-value">${metrics.activeDeals}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Total Funding</span>
        <span class="metric-value">${yoctoToNear(metrics.totalFunding)}</span>
        <span class="metric-raw">${formatYoctoRaw(metrics.totalFunding)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Active Cycles</span>
        <span class="metric-value">${metrics.activeCycles}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Pending Reports</span>
        <span class="metric-value">${metrics.pendingReports}</span>
      </div>
    </div>
  `;
}

function renderFarmerEmptyState(farmer) {
  return `
    <div class="bg-slate-800 border border-slate-700 rounded-xl p-6">
      <h2 class="text-xl font-semibold text-slate-100 mb-2">No active deals yet</h2>
      <p class="text-slate-400 mb-4">
        Your farmer profile is ready. Once an admin creates or assigns a farming deal to your wallet, it will appear here.
      </p>
      <div class="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 mb-4">
        <span class="block text-xs uppercase text-slate-500 font-semibold">Wallet</span>
        <span id="farmer-wallet-copy-value" class="text-slate-100 font-mono break-all">${escapeHtml(farmer || 'Not connected')}</span>
      </div>
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-slate-300 mb-2">Next steps</h3>
        <ul class="list-disc list-inside text-sm text-slate-400 space-y-1">
          <li>Share your wallet account with AgriPartners admin</li>
          <li>Prepare your farm information</li>
          <li>Wait for your first deal to be assigned</li>
        </ul>
      </div>
      <button id="btn-copy-farmer-wallet" type="button" class="admin-action-btn">Copy Wallet Account</button>
      <span id="farmer-wallet-copy-state" class="ml-3 text-sm text-green-300 hidden">Copied</span>
    </div>
  `;
}

function bindFarmerDashboardActions(farmer) {
  document.getElementById('btn-copy-farmer-wallet')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(farmer || '');
      document.getElementById('farmer-wallet-copy-state')?.classList.remove('hidden');
    } catch {
      document.getElementById('farmer-wallet-copy-state')?.classList.remove('hidden');
      document.getElementById('farmer-wallet-copy-state').textContent = 'Copy unavailable';
    }
  });
}

function renderFarmerDashboard(el, deals, farmer, profile = null) {
  el.querySelector('.spinner')?.remove();
  const metrics = farmerDashboardMetrics(deals);

  if (deals.length === 0) {
    el.innerHTML = `
      ${renderFarmerProfilePanel(profile, farmer)}
      ${renderFarmerSummaryCards(metrics)}
      ${renderFarmerEmptyState(farmer)}
    `;
    bindFarmerDashboardActions(farmer);
    return;
  }

  el.innerHTML = `
    ${renderFarmerProfilePanel(profile, farmer)}
    ${renderFarmerSummaryCards(metrics)}
    <h2 class="text-xl font-semibold mb-4">Active Deals</h2>
    <div class="grid gap-4">
      ${deals.map(renderFarmerDealCard).join('')}
    </div>
  `;
}

function renderFarmerDealCard(deal) {
  return `
    <div class="bg-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-300">Deal #${deal.id}</span>
          ${statusBadge(deal.status)}
          <span class="text-xs text-slate-500">Active Cycle: ${deal.activeCycleId ?? 'none'}</span>
        </div>
        <p class="text-sm text-slate-400">Investor: <span class="text-slate-200">${escapeHtml(formatAddress(deal.investor))}</span></p>
        <p class="text-sm text-slate-400">Amount: <span class="text-slate-100 font-mono">${yoctoToNear(deal.amount || deal.investment_amount)}</span></p>
      </div>
      <a href="#farmer/deals/${deal.id}" class="shrink-0 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition">View Deal</a>
    </div>
  `;
}

async function showFarmerDeal(id) {
  showView('view-farmer');
  const el = document.getElementById('view-farmer');
  el.innerHTML = `
    ${renderNav()}
    <a href="#farmer" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">Back to Farmer Portal</a>
    <div class="spinner"></div>
  `;

  try {
    const [dealData, cyclesData, balancesData] = await Promise.all([
      fetchFarmerJson(`/api/farmer/deals/${id}`),
      fetchFarmerJson(`/api/farmer/deals/${id}/cycles`),
      fetchFarmerJson(`/api/deals/${id}/balances`),
    ]);
    renderFarmerDealDetail(el, dealData.deal, cyclesData.cycles || [], balancesData);
  } catch (err) {
    el.querySelector('.spinner')?.remove();
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Deal unavailable: ${escapeHtml(err.message)}</div>`;
  }
}

function renderFarmerDealDetail(el, deal, cycles, balances = null) {
  const farmerBalance = balances?.farmer || '0';
  const canWithdrawFarmer = hasPositiveYocto(farmerBalance);
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="#farmer" class="text-slate-400 hover:text-white text-sm">Back to Farmer Portal</a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">Deal #${deal.id}</span>
      ${statusBadge(deal.status)}
      <button id="btn-farmer-refresh" class="ml-auto bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded transition">Refresh</button>
    </div>

    ${deal.description ? `<p class="text-slate-400 mb-6">${escapeHtml(deal.description)}</p>` : ''}
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl p-5 space-y-2">
        ${renderFarmerDealParams(deal)}
      </div>
      <div class="bg-slate-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Farmer Actions</h3>
        <div class="mb-4 text-sm">
          <span class="block text-slate-500">Farmer Available</span>
          <span id="farmer-available-balance" class="text-slate-100 font-mono">${escapeHtml(`${yoctoToNear(farmerBalance)} · ${formatYoctoRaw(farmerBalance)}`)}</span>
        </div>
        <button id="btn-farmer-withdraw" class="admin-action-btn action-fund w-full mb-4" ${canWithdrawFarmer ? '' : 'disabled'}>${canWithdrawFarmer ? 'Withdraw Farmer Balance' : 'No Farmer Balance'}</button>
        <p class="text-xs text-slate-400 mb-4">Confirm received funding and submit text reports for active cycles.</p>
        <div id="farmer-action-result" class="hidden rounded-lg px-4 py-3 text-sm"></div>
      </div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Cycles</h3>
      <div id="farmer-cycles-list">${renderFarmerCycles(deal.id, cycles)}</div>
    </div>
  `;

  document.getElementById('btn-farmer-refresh').addEventListener('click', () => showFarmerDeal(deal.id));
  document.getElementById('btn-farmer-withdraw')?.addEventListener('click', () => withdrawFarmerWithWallet(deal));
  bindFarmerCycleActions(deal.id);
}

function renderFarmerDealParams(deal) {
  const rows = [
    ['Farmer', deal.farmer],
    ['Investor', deal.investor],
    ['Amount', yoctoToNear(deal.amount || deal.investment_amount)],
    ['Status', deal.status],
    ['Active Cycle', deal.activeCycleId ?? 'none'],
    ['Contract', deal.contract_address],
  ];
  return rows.map(([k, v]) => `
    <div class="flex justify-between text-sm gap-3">
      <span class="text-slate-400 shrink-0">${k}</span>
      <span class="text-slate-100 font-mono text-right break-all">${escapeHtml(v)}</span>
    </div>
  `).join('');
}

function renderFarmerCycles(dealId, cycles) {
  if (!cycles.length) return '<p class="text-slate-500 text-sm">No cycles found yet</p>';
  return cycles.map((cycle) => {
    const reportSubmitted = cycle.reportStatus === 'submitted' && cycle.report;
    const fundingSent = ['funding_sent', 'reported'].includes(cycle.status);
    const canConfirmFunding = fundingSent && !cycle.fundingReceived;
    const canSubmitReport = cycle.fundingReceived && !reportSubmitted;
    const cycleLabel = reportSubmitted
      ? 'Report submitted'
      : (cycle.fundingReceived ? 'Funding confirmed' : (cycle.status === 'pending' ? 'Pending' : 'Funding sent'));
    return `
      <div class="farmer-cycle-row">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="font-semibold text-slate-100">Cycle #${cycle.id}</span>
            <span class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">${escapeHtml(cycleLabel)}</span>
          </div>
          <p class="text-sm text-slate-400">Funding received: <span class="text-slate-200">${cycle.fundingReceived ? 'Confirmed' : 'Not confirmed'}</span></p>
          <p class="text-sm text-slate-400">Report: <span class="text-slate-200">${reportSubmitted ? 'Submitted' : 'Not submitted'}</span></p>
          ${reportSubmitted ? renderFarmerReportSummary(cycle.report) : ''}
        </div>
        <div class="farmer-cycle-actions">
          <button type="button" class="admin-action-btn farmer-confirm-btn" data-deal-id="${dealId}" data-cycle-id="${cycle.id}" ${canConfirmFunding ? '' : 'disabled'}>Confirm funding received</button>
          <button type="button" class="admin-action-btn farmer-report-btn" data-deal-id="${dealId}" data-cycle-id="${cycle.id}" ${canSubmitReport ? '' : 'disabled'}>${reportSubmitted ? 'Report submitted' : (cycle.fundingReceived ? 'Submit report' : 'Confirm funding first')}</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderFarmerReportSummary(report) {
  const title = report.report_title || report.title || 'Farmer report';
  const body = report.report_body || report.description || '';
  return `
    <div class="farmer-report-summary">
      <div class="font-semibold text-slate-100">${escapeHtml(title)}</div>
      <p class="text-sm text-slate-400 mt-1">${escapeHtml(body)}</p>
      <div class="grid sm:grid-cols-2 gap-2 mt-3 text-xs">
        <div>
          <span class="block text-slate-500">Amount used</span>
          <span class="text-slate-200">${escapeHtml(report.amountUsed || 'Not provided')}</span>
        </div>
        <div>
          <span class="block text-slate-500">Submitted</span>
          <span class="text-slate-200">${report.submittedAt ? escapeHtml(new Date(report.submittedAt).toLocaleDateString('en-US')) : 'Submitted'}</span>
        </div>
      </div>
      ${report.evidenceUrl ? `<a href="${escapeHtml(report.evidenceUrl)}" target="_blank" rel="noopener noreferrer" class="inline-block text-blue-400 hover:underline text-xs mt-2">Evidence link</a>` : ''}
    </div>
  `;
}

function bindFarmerCycleActions(dealId) {
  document.querySelectorAll('.farmer-confirm-btn').forEach((btn) => {
    btn.addEventListener('click', () => confirmFarmerFunding(btn.dataset.dealId, btn.dataset.cycleId));
  });
  document.querySelectorAll('.farmer-report-btn').forEach((btn) => {
    btn.addEventListener('click', () => showFarmerReportForm(dealId, btn.dataset.cycleId));
  });
}

function showFarmerActionResult(type, message) {
  const el = document.getElementById('farmer-action-result');
  if (!el) return;
  el.className = `${type === 'success' ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'} rounded-lg px-4 py-3 text-sm`;
  el.textContent = message;
  el.classList.remove('hidden');
}

function getWalletTransactionHash(result) {
  return result?.transaction?.hash
    || result?.transaction_outcome?.id
    || result?.receipts_outcome?.[0]?.id
    || '';
}

async function withdrawFarmerWithWallet(deal) {
  const connectedWallet = getNearWalletAccount();
  if (connectedWallet !== deal.farmer) {
    showFarmerActionResult('error', `Connected wallet must be ${deal.farmer}`);
    return;
  }
  if (!confirm(`Withdraw farmer balance to ${deal.farmer}?`)) return;

  const btn = document.getElementById('btn-farmer-withdraw');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Opening wallet...';
  }
  showFarmerActionResult('success', 'Farmer withdrawal submitted to wallet...');

  try {
    const result = await signAndSendWalletFunctionCall({
      contractId: deal.contract_address,
      methodName: 'withdraw',
      expectedAccountId: deal.farmer,
    });
    const txHash = getWalletTransactionHash(result);
    showFarmerActionResult('success', txHash
      ? `Farmer withdrawal completed. Tx: ${txHash}`
      : 'Farmer withdrawal completed.');
    await showFarmerDeal(deal.id);
  } catch (err) {
    showFarmerActionResult('error', `Farmer withdrawal failed: ${err.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Withdraw Farmer Balance';
    }
  }
}

async function confirmFarmerFunding(dealId, cycleId) {
  try {
    await fetchFarmerJson(`/api/farmer/deals/${dealId}/cycles/${cycleId}/confirm-funding`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    showFarmerActionResult('success', 'Funding receipt confirmed');
    await showFarmerDeal(dealId);
  } catch (err) {
    showFarmerActionResult('error', `Confirmation failed: ${err.message}`);
  }
}

function showFarmerReportForm(dealId, cycleId) {
  const el = document.getElementById('farmer-action-result');
  if (!el) return;
  el.className = 'bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-sm';
  el.innerHTML = `
    <form id="farmer-report-form" class="space-y-3">
      <div class="font-semibold text-slate-100">Cycle #${escapeHtml(cycleId)} report</div>
      <input id="farmer-report-title" class="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" placeholder="Report title (optional)" />
      <textarea id="farmer-report-body" rows="5" class="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" placeholder="Report body"></textarea>
      <button type="submit" class="admin-action-btn action-fund w-full">Submit report</button>
    </form>
  `;
  el.classList.remove('hidden');
  document.getElementById('farmer-report-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    await submitFarmerReport(dealId, cycleId);
  });
}

async function submitFarmerReport(dealId, cycleId) {
  const payload = {
    report_title: document.getElementById('farmer-report-title').value.trim(),
    report_body: document.getElementById('farmer-report-body').value.trim(),
  };
  try {
    await fetchFarmerJson(`/api/farmer/deals/${dealId}/cycles/${cycleId}/report`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    showFarmerActionResult('success', 'Cycle report submitted');
    await showFarmerDeal(dealId);
  } catch (err) {
    showFarmerActionResult('error', `Report failed: ${err.message}`);
  }
}

// --- Investor Portal ---

async function showInvestorPortal() {
  showView('view-investor');
  const el = document.getElementById('view-investor');
  const auth = getAuth();
  const connectedWalletAccount = getNearWalletAccount();
  const signedInLabel = connectedWalletAccount || auth.user.username;
  el.innerHTML = `
    ${renderNav()}
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-green-400 mb-1">Investor Portal</h1>
      <p class="text-slate-400">Signed in as <span class="text-slate-200 font-medium">${escapeHtml(signedInLabel)}</span></p>
    </div>
    <div id="near-wallet-section" class="mb-6"></div>
    <div id="investor-profile-section" class="mb-6"></div>
    <div id="investor-dashboard-content"></div>
  `;
  renderNearWalletSection();
  const profileEl = document.getElementById('investor-profile-section');
  const dashboardEl = document.getElementById('investor-dashboard-content');

  if (!connectedWalletAccount) {
    renderInvestorProfileLoginMessage(profileEl);
    renderInvestorPortalMessage(
      dashboardEl,
      'Investor Portal access requires a signed NEAR wallet session. Use Login with NEAR Wallet on the sign-in screen.'
    );
    return;
  }

  loadInvestorProfile();

  dashboardEl.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">My Investments</h2>
    <div class="spinner"></div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/investor/deals`, { headers: authHeaders() });
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (res.status === 403) {
      renderInvestorPortalMessage(dashboardEl, 'This session is not authorized for wallet investor data.', 'error');
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const deals = await res.json();
    const enrichedDeals = await enrichDealsForInvestor(deals);
    renderInvestorDashboard(dashboardEl, enrichedDeals, connectedWalletAccount);
  } catch (e) {
    dashboardEl.querySelector('.spinner')?.remove();
    renderInvestorPortalMessage(
      dashboardEl,
      `Investor Portal unavailable: ${e.message}`,
      'error'
    );
  }
}

function renderNoWalletInvestorDashboard() {
  const dashboardEl = document.getElementById('investor-dashboard-content');
  if (!dashboardEl) return;
  renderInvestorPortalMessage(
    dashboardEl,
    'Investor Portal access requires a signed NEAR wallet session. Use Login with NEAR Wallet on the sign-in screen.'
  );
}

function renderNearWalletSection() {
  const el = document.getElementById('near-wallet-section');
  if (!el) return;

  const accountId = getNearWalletAccount();
  el.innerHTML = `
    <div class="wallet-panel">
      <div class="wallet-header">
        <div>
          <h2 class="wallet-title">NEAR Wallet</h2>
          <p class="wallet-note">Authenticated with NEP-413 wallet signature.</p>
        </div>
        <span class="wallet-network">Network: ${NEAR_WALLET_NETWORK}</span>
      </div>
      <div class="wallet-body">
        <div class="wallet-account">
          <span class="wallet-label">Connected account</span>
          <span class="wallet-value">${accountId ? escapeHtml(accountId) : 'Not connected'}</span>
        </div>
        <div class="wallet-actions">
          <button type="button" id="btn-wallet-logout" class="wallet-btn" ${accountId ? '' : 'disabled'}>
            Logout
          </button>
        </div>
      </div>
      <p class="wallet-helper">Investor data is loaded through wallet-protected API routes using this session JWT.</p>
    </div>
  `;

  document.getElementById('btn-wallet-logout')?.addEventListener('click', logout);
}

function renderInvestorProfileLoginMessage(el) {
  if (!el) return;
  el.innerHTML = `
    <div class="wallet-panel">
      <h2 class="wallet-title">Investor Profile</h2>
      <p class="wallet-helper">Investor Profile requires a signed NEAR wallet session.</p>
    </div>
  `;
}

function renderInvestorProfileLoading(el) {
  el.innerHTML = `
    <div class="wallet-panel">
      <div class="wallet-header">
        <div>
          <h2 class="wallet-title">Investor Profile</h2>
          <p class="wallet-note">Loading wallet-linked profile...</p>
        </div>
      </div>
      <div class="spinner"></div>
    </div>
  `;
}

async function loadInvestorProfile() {
  const el = document.getElementById('investor-profile-section');
  if (!el) return;
  renderInvestorProfileLoading(el);

  try {
    const res = await fetch(`${API_BASE}/api/investor/profile`, { headers: authHeaders() });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    renderInvestorProfileForm(el, data);
  } catch (err) {
    renderInvestorProfileError(el, err.message || 'Profile unavailable');
  }
}

function profileOption(value, label, selectedValue) {
  return `<option value="${value}" ${selectedValue === value ? 'selected' : ''}>${label}</option>`;
}

function renderInvestorProfileForm(el, profile, message = null, type = 'success') {
  const accountId = profile.account_id || getNearWalletAccount();
  el.innerHTML = `
    <form id="investor-profile-form" class="wallet-panel">
      <div class="wallet-header">
        <div>
          <h2 class="wallet-title">Investor Profile</h2>
          <p class="wallet-note">Linked to your authenticated wallet account.</p>
        </div>
        <span class="wallet-network">KYC: ${escapeHtml(profile.kyc_status || 'not_started')}</span>
      </div>

      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-slate-400 mb-1">Wallet account</label>
          <input type="text" value="${escapeHtml(accountId)}" readonly
            class="w-full bg-slate-900 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 font-mono" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">KYC status</label>
          <input type="text" value="${escapeHtml(profile.kyc_status || 'not_started')}" readonly
            class="w-full bg-slate-900 text-slate-300 px-3 py-2 rounded-lg border border-slate-700" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Display name</label>
          <input id="profile-display-name" type="text" maxlength="120" value="${escapeHtml(profile.display_name || '')}"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Country</label>
          <input id="profile-country" type="text" maxlength="80" value="${escapeHtml(profile.country || '')}"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Investor type</label>
          <select id="profile-investor-type"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500">
            <option value="">Not specified</option>
            ${profileOption('individual', 'Individual', profile.investor_type)}
            ${profileOption('company', 'Company', profile.investor_type)}
            ${profileOption('fund', 'Fund', profile.investor_type)}
            ${profileOption('other', 'Other', profile.investor_type)}
          </select>
        </div>
        <div>
          <label class="block text-sm text-slate-400 mb-1">Risk profile</label>
          <select id="profile-risk-profile"
            class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500">
            <option value="">Not specified</option>
            ${profileOption('conservative', 'Conservative', profile.risk_profile)}
            ${profileOption('balanced', 'Balanced', profile.risk_profile)}
            ${profileOption('growth', 'Growth', profile.risk_profile)}
            ${profileOption('high_risk', 'High risk', profile.risk_profile)}
          </select>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-700">
        <div id="profile-save-state" class="${message ? '' : 'hidden'} text-sm ${type === 'error' ? 'text-red-200' : 'text-green-200'}">
          ${message ? escapeHtml(message) : ''}
        </div>
        <button type="submit" id="btn-save-investor-profile" class="wallet-btn wallet-btn-primary ml-auto">
          Save Profile
        </button>
      </div>
    </form>
  `;

  document.getElementById('investor-profile-form')?.addEventListener('submit', saveInvestorProfile);
}

function renderInvestorProfileError(el, message) {
  el.innerHTML = `
    <div class="wallet-panel">
      <h2 class="wallet-title">Investor Profile</h2>
      <div class="bg-red-900 text-red-100 border border-red-800 rounded-lg px-4 py-3 mt-3">
        ${escapeHtml(message)}
      </div>
    </div>
  `;
}

async function saveInvestorProfile(event) {
  event.preventDefault();
  const btn = document.getElementById('btn-save-investor-profile');
  const stateEl = document.getElementById('profile-save-state');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving...'; }
  if (stateEl) {
    stateEl.className = 'text-sm text-slate-300';
    stateEl.textContent = 'Saving profile...';
  }

  const payload = {
    display_name: document.getElementById('profile-display-name')?.value || '',
    country: document.getElementById('profile-country')?.value || '',
    investor_type: document.getElementById('profile-investor-type')?.value || '',
    risk_profile: document.getElementById('profile-risk-profile')?.value || '',
  };

  try {
    const res = await fetch(`${API_BASE}/api/investor/profile`, {
      method: 'PUT',
      headers: jsonAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    renderInvestorProfileForm(document.getElementById('investor-profile-section'), data, 'Profile saved.');
  } catch (err) {
    if (stateEl) {
      stateEl.className = 'text-sm text-red-200';
      stateEl.textContent = err.message || 'Profile save failed';
    }
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Save Profile'; }
  }
}

function renderInvestorPortalMessage(el, message, type = 'info') {
  const isError = type === 'error';
  el.innerHTML = `
    <div class="${isError ? 'bg-red-900 text-red-100 border-red-800' : 'bg-slate-800 text-slate-200 border-slate-700'} border rounded-lg px-4 py-3">
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

async function enrichDealsForInvestor(deals) {
  const headers = authHeaders();
  return Promise.all(deals.map(async deal => {
    const [detailRes, statusRes, balancesRes] = await Promise.allSettled([
      fetch(`${API_BASE}/api/investor/deals/${deal.id}`, { headers }),
      fetch(`${API_BASE}/api/investor/deals/${deal.id}/status`, { headers }),
      fetch(`${API_BASE}/api/investor/deals/${deal.id}/balances`, { headers })
    ]);
    const detail = detailRes.status === 'fulfilled' && detailRes.value.ok
      ? await detailRes.value.json() : {};
    const status = statusRes.status === 'fulfilled' && statusRes.value.ok
      ? await statusRes.value.json() : null;
    const balances = balancesRes.status === 'fulfilled' && balancesRes.value.ok
      ? await balancesRes.value.json() : null;
    return { ...deal, ...detail, status, balances };
  }));
}

function parseNearAmount(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNearAmount(value) {
  return `${value.toFixed(2)} NEAR`;
}

function sumNearFields(deals, field) {
  return deals.reduce((sum, deal) => sum + parseNearAmount(deal[field]), 0);
}

function investorMetrics(deals) {
  const roiDeals = deals.filter(deal => deal.roi_percent != null);
  return {
    totalInvested: sumNearFields(deals, 'amount'),
    expectedReturns: sumNearFields(deals, 'expected_return'),
    returned: sumNearFields(deals, 'returned_amount'),
    outstanding: sumNearFields(deals, 'outstanding_amount'),
    averageRoi: roiDeals.length
      ? roiDeals.reduce((sum, deal) => sum + Number(deal.roi_percent), 0) / roiDeals.length
      : 0,
    activeDeals: deals.filter(deal => !['Completed', 'Terminated'].includes(deal.status?.status)).length,
    completedDeals: deals.filter(deal => deal.status?.status === 'Completed').length,
  };
}

function renderInvestorDashboard(el, deals, connectedWalletAccount) {
  el.querySelector('.spinner')?.remove();
  const metrics = investorMetrics(deals);
  const dashboard = document.createElement('div');

  if (deals.length === 0) {
    dashboard.innerHTML = `
      ${renderInvestorMetrics(metrics)}
      <p class="text-slate-400 mt-6">No investments found for connected wallet account: <span class="font-mono text-slate-200">${escapeHtml(connectedWalletAccount)}</span></p>
    `;
    el.appendChild(dashboard);
    return;
  }

  dashboard.innerHTML = `
    ${renderInvestorMetrics(metrics)}
    <div class="flex flex-wrap items-center justify-between gap-3 mt-8 mb-4">
      <h2 class="text-xl font-semibold">Pilot Deals</h2>
      <span class="text-xs text-slate-500 uppercase tracking-wide">Fidlot + Hissar Sheep</span>
    </div>
    <div class="grid gap-4">
      ${deals.map(renderInvestorDealCard).join('')}
    </div>
  `;
  el.appendChild(dashboard);
}

function renderInvestorMetrics(metrics) {
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="metric-box">
        <span class="metric-label">Total Invested</span>
        <span class="metric-value">${formatNearAmount(metrics.totalInvested)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Expected Returns</span>
        <span class="metric-value">${formatNearAmount(metrics.expectedReturns)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Returned</span>
        <span class="metric-value">${formatNearAmount(metrics.returned)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Outstanding</span>
        <span class="metric-value">${formatNearAmount(metrics.outstanding)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Average ROI</span>
        <span class="metric-value">${metrics.averageRoi.toFixed(1)}%</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Active Deals</span>
        <span class="metric-value">${metrics.activeDeals}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Completed Deals</span>
        <span class="metric-value">${metrics.completedDeals}</span>
      </div>
    </div>
  `;
}

function investorPilotLabel(deal) {
  const type = String(deal.deal_type || deal.title || '').toLowerCase();
  if (deal.id === 1 || type.includes('fidlot')) return 'Pilot Deal #1 (Fidlot)';
  if (deal.id === 2 || type.includes('hissar')) return 'Pilot Deal #2 (Hissar Sheep)';
  return deal.title || `Deal #${deal.id}`;
}

function renderInvestorDealCard(deal) {
  const status = deal.status?.status || 'Unknown';
  const pilotLabel = investorPilotLabel(deal);
  const currentCycle = deal.status?.current_cycle ?? '—';
  return `
    <div class="bg-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-300">Deal #${deal.id}</span>
          ${statusBadge(status)}
          <span class="text-xs text-slate-500">Cycle ${currentCycle}</span>
        </div>
        <h3 class="text-lg font-semibold text-slate-100">${escapeHtml(pilotLabel)}</h3>
        <p class="text-sm text-slate-400">Contract: <span class="text-slate-200 font-mono">${escapeHtml(formatAddress(deal.contract_address))}</span></p>
        <p class="text-sm text-slate-400">Farmer: <span class="text-slate-200">${escapeHtml(formatAddress(deal.farmer))}</span></p>
        <div class="grid sm:grid-cols-4 gap-3 pt-2">
          <div>
            <span class="block text-xs text-slate-500">Invested</span>
            <span class="text-sm text-slate-100 font-mono">${formatNearDisplay(deal.amount)}</span>
          </div>
          <div>
            <span class="block text-xs text-slate-500">Expected</span>
            <span class="text-sm text-slate-100 font-mono">${formatNearDisplay(deal.expected_return)}</span>
          </div>
          <div>
            <span class="block text-xs text-slate-500">Returned</span>
            <span class="text-sm text-green-300 font-mono">${formatNearDisplay(deal.returned_amount)}</span>
          </div>
          <div>
            <span class="block text-xs text-slate-500">ROI</span>
            <span class="text-sm text-slate-100 font-mono">${escapeHtml(deal.roi_percent ?? 20)}%</span>
          </div>
        </div>
      </div>
      <a href="#investor/deals/${deal.id}" class="shrink-0 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium text-center transition">View Deal</a>
    </div>
  `;
}

async function showInvestorDeal(id) {
  showView('view-investor');
  const el = document.getElementById('view-investor');
  el.innerHTML = `
    ${renderNav()}
    <a href="#investor" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">Back to Investor Portal</a>
    <div class="spinner"></div>
  `;

  try {
    const { deal, status, balances, events, reports, cycles, returns } = await fetchInvestorDealBundle(id);
    renderInvestorDealDetail(el, deal, status, balances, events, reports, cycles, returns);
  } catch (e) {
    el.querySelector('.spinner')?.remove();
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Deal unavailable: ${escapeHtml(e.message)}</div>`;
  }
}

async function fetchInvestorDealBundle(id) {
  const headers = authHeaders();
  const [dealRes, statusRes, balancesRes, eventsRes, cyclesRes, reportsRes, returnsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/investor/deals/${id}`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/status`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/balances`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/events`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/cycles`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/reports`, { headers }),
    fetch(`${API_BASE}/api/investor/deals/${id}/returns`, { headers })
  ]);

  if (dealRes.status === 'rejected' || !dealRes.value.ok) {
    const status = dealRes.value?.status;
    if (status === 401) {
      clearAuth();
      location.hash = '#login';
      throw new Error('Wallet session expired');
    }
    if (status === 403) throw new Error('This deal is not linked to the connected wallet account');
    throw new Error(status === 404 ? 'Deal not found' : 'Backend unavailable');
  }

  return {
    deal: await dealRes.value.json(),
    status: statusRes.status === 'fulfilled' && statusRes.value.ok ? await statusRes.value.json() : null,
    balances: balancesRes.status === 'fulfilled' && balancesRes.value.ok ? await balancesRes.value.json() : null,
    events: eventsRes.status === 'fulfilled' && eventsRes.value.ok ? await eventsRes.value.json() : [],
    cycles: cyclesRes.status === 'fulfilled' && cyclesRes.value.ok ? normalizeCyclesResponse(await cyclesRes.value.json()) : [],
    reports: reportsRes.status === 'fulfilled' && reportsRes.value.ok ? (await reportsRes.value.json()).reports || [] : [],
    returns: returnsRes.status === 'fulfilled' && returnsRes.value.ok ? await returnsRes.value.json() : []
  };
}

function renderInvestorDealAccessMessage(el) {
  el.querySelector('.spinner')?.remove();
  el.innerHTML = `
    ${renderNav()}
    <a href="#investor" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">Back to Investor Portal</a>
    <div class="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-200">
      <p>This deal is not linked to the connected wallet account.</p>
    </div>
  `;
}

function renderInvestorDealDetail(el, deal, status, balances, events, reports = [], cycles = [], returns = []) {
  const investorBalance = balances?.investor || '0';
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="#investor" class="text-slate-400 hover:text-white text-sm">Back to Investor Portal</a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">Deal #${deal.id}</span>
      <span id="investor-status-badge">${statusBadge(status?.status)}</span>
      <span id="investor-cycle-text" class="text-slate-400 text-sm">Cycle ${status?.current_cycle ?? '—'}</span>
      <button id="btn-investor-refresh" class="ml-auto bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded transition">Refresh</button>
    </div>

    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl p-5 space-y-2">
        ${renderInvestorDealParams(deal, status, investorBalance)}
      </div>
      <div class="bg-slate-800 rounded-xl p-5">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Investor Actions</h3>
        <p class="text-xs text-amber-200 bg-amber-950 border border-amber-800 rounded-lg px-3 py-2 mb-4">Testnet MVP: investor withdrawal is executed through backend signer support.</p>
        <button id="btn-investor-withdraw" class="admin-action-btn w-full">Withdraw Investor</button>
        <div id="investor-action-result" class="hidden mt-4 rounded-lg px-4 py-3 text-sm"></div>
      </div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Investment Summary</h3>
      <div id="investor-investment-summary">${renderInvestmentSummary(deal)}</div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Returns</h3>
      <div id="investor-returns-list">${renderRepaymentHistory(returns)}</div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Cycle Status</h3>
      <div id="investor-cycles-list">${renderCycleStatusCards(cycles)}</div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Farmer Reports</h3>
      <div id="investor-reports-list">${renderInvestorReports(reports)}</div>
    </div>

    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Event History</h3>
      <div id="investor-events-list">${renderEvents(events)}</div>
    </div>
  `;

  document.getElementById('btn-investor-refresh').addEventListener('click', () => refreshInvestorDeal(deal.id));
  document.getElementById('btn-investor-withdraw').addEventListener('click', () => withdrawInvestorFromPortal(deal));
}

function formatNearDisplay(value) {
  return `${escapeHtml(value ?? '0.00')} NEAR`;
}

function renderInvestmentSummary(deal) {
  const rows = [
    ['Invested', formatNearDisplay(deal.amount)],
    ['Expected Return', formatNearDisplay(deal.expected_return)],
    ['Returned', formatNearDisplay(deal.returned_amount)],
    ['Outstanding', formatNearDisplay(deal.outstanding_amount)],
    ['ROI', `${escapeHtml(deal.roi_percent ?? 20)}%`],
  ];
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
      ${rows.map(([label, value]) => `
        <div class="metric-box">
          <span class="metric-label">${label}</span>
          <span class="metric-value">${value}</span>
        </div>
      `).join('')}
    </div>
  `;
}

function renderRepaymentHistory(returns) {
  if (!returns.length) return '<p class="text-slate-500 text-sm">No repayments recorded yet</p>';
  return returns.map((repayment) => `
    <div class="farmer-report-summary">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-slate-200 font-medium">${repayment.created_at ? escapeHtml(new Date(repayment.created_at).toLocaleDateString('en-US')) : 'Recorded'}</span>
        <span class="text-green-300 font-mono">${formatNearDisplay(repayment.amount_near)}</span>
      </div>
      ${repayment.note ? `<p class="text-sm text-slate-400 mt-2">${escapeHtml(repayment.note)}</p>` : ''}
    </div>
  `).join('');
}

function renderInvestorReports(reports) {
  if (!reports.length) return '<p class="text-slate-500 text-sm">No farmer reports submitted yet</p>';
  return reports.map((report) => `
    <div class="farmer-report-summary">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span class="text-xs text-slate-500">Cycle #${escapeHtml(report.cycle_id)}</span>
          <h4 class="font-semibold text-slate-100">${escapeHtml(report.title)}</h4>
        </div>
        <span class="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">Submitted</span>
      </div>
      <p class="text-sm text-slate-400 mt-2">${escapeHtml(report.description)}</p>
      <div class="grid sm:grid-cols-3 gap-3 mt-3 text-xs">
        <div>
          <span class="block text-slate-500">Farmer</span>
          <span class="text-slate-200 font-mono break-all">${escapeHtml(report.farmer_wallet)}</span>
        </div>
        <div>
          <span class="block text-slate-500">Amount used</span>
          <span class="text-slate-200">${escapeHtml(report.amount_used || 'Not provided')}</span>
        </div>
        <div>
          <span class="block text-slate-500">Submitted</span>
          <span class="text-slate-200">${report.submitted_at ? escapeHtml(new Date(report.submitted_at).toLocaleDateString('en-US')) : 'Submitted'}</span>
        </div>
      </div>
      ${report.evidence_url ? `<a href="${escapeHtml(report.evidence_url)}" target="_blank" rel="noopener noreferrer" class="inline-block text-blue-400 hover:underline text-xs mt-2">Evidence link</a>` : ''}
    </div>
  `).join('');
}

function normalizeCyclesResponse(data) {
  return Array.isArray(data) ? data : (data?.cycles || []);
}

function normalizeCycleCard(cycle) {
  const report = cycle.report || {};
  const reportSubmitted = cycle.report_submitted ?? (cycle.reportStatus === 'submitted' && Boolean(cycle.report));
  const fundingSent = cycle.funding_sent ?? ['funding_sent', 'reported'].includes(cycle.status);
  const fundingConfirmed = cycle.funding_confirmed ?? Boolean(cycle.fundingReceived);
  const reportCreatedAt = cycle.report_created_at || report.submittedAt || report.created_at || '';
  return {
    cycleNumber: cycle.cycle_number ?? cycle.id,
    status: cycle.status || (fundingSent ? (reportSubmitted ? 'reported' : 'funding_sent') : 'pending'),
    fundingSent,
    fundingConfirmed,
    reportSubmitted,
    report: reportSubmitted ? {
      ...report,
      title: cycle.report_title || report.title || 'Farmer report',
      description: cycle.report_body || report.description || '',
      submittedAt: reportCreatedAt,
    } : null,
  };
}

function renderCycleStatusCards(cycles) {
  if (!cycles.length) return '<p class="text-slate-500 text-sm">No cycle updates yet</p>';
  return cycles.map((cycle) => {
    const card = normalizeCycleCard(cycle);
    return `
      <div class="farmer-cycle-row">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2 mb-2">
            <span class="font-semibold text-slate-100">Cycle #${escapeHtml(card.cycleNumber)}</span>
            <span class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">${escapeHtml(card.status)}</span>
          </div>
          <p class="text-sm text-slate-400">Funding sent: <span class="text-slate-200">${card.fundingSent ? 'Yes' : 'No'}</span></p>
          <p class="text-sm text-slate-400">Funding confirmed: <span class="text-slate-200">${card.fundingConfirmed ? 'Yes' : 'No'}</span></p>
          <p class="text-sm text-slate-400">Report status: <span class="text-slate-200">${card.reportSubmitted ? 'Submitted' : 'Waiting for farmer report'}</span></p>
          ${card.reportSubmitted ? renderFarmerReportSummary(card.report) : ''}
        </div>
      </div>
    `;
  }).join('');
}

function renderInvestorDealParams(deal, status, investorBalance) {
  const rows = [
    ['Contract ID',        deal.contract_address],
    ['Farmer',             deal.farmer],
    ['Investor',           deal.investor],
    ['Investment Amount',  `${yoctoToNear(deal.investment_amount)} · ${formatYoctoRaw(deal.investment_amount)}`],
    ['Status',             status?.status || 'Unknown'],
    ['Current Cycle',      status?.current_cycle ?? '—'],
    ['Investor Available', `${yoctoToNear(investorBalance)} · ${formatYoctoRaw(investorBalance)}`],
  ];
  return rows.map(([k, v]) => `
    <div class="flex justify-between text-sm gap-3">
      <span class="text-slate-400 shrink-0">${k}</span>
      <span ${k === 'Investor Available' ? 'id="investor-available-balance"' : ''} class="text-slate-100 font-mono text-right break-all">${escapeHtml(v)}</span>
    </div>
  `).join('');
}

function showInvestorActionResult(type, message, txHash) {
  const el = document.getElementById('investor-action-result');
  if (!el) return;
  const isSuccess = type === 'success';
  el.className = `${isSuccess ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'} mt-4 rounded-lg px-4 py-3 text-sm`;
  el.innerHTML = `
    <div class="font-medium">${escapeHtml(message)}</div>
    ${txHash ? `<div class="mt-1 text-xs">Tx: <a href="https://testnet.nearblocks.io/txns/${escapeHtml(txHash)}" target="_blank" class="font-mono underline">${escapeHtml(txHash)}</a></div>` : ''}
  `;
  el.classList.remove('hidden');
}

async function withdrawInvestorFromPortal(deal) {
  if (!confirm(`Withdraw investor balance to ${deal.investor}?`)) return;

  const btn = document.getElementById('btn-investor-withdraw');
  if (btn) { btn.disabled = true; btn.textContent = 'Withdrawing...'; }
  showInvestorActionResult('success', 'Investor withdrawal submitted...');

  try {
    const res = await fetch(`${API_BASE}/api/investor/deals/${deal.id}/withdraw`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    showInvestorActionResult('success', 'Investor withdrawal completed successfully', data.tx_hash);
    await refreshInvestorDeal(deal.id);
  } catch (err) {
    showInvestorActionResult('error', `Investor withdrawal failed: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Withdraw Investor'; }
  }
}

async function refreshInvestorDeal(id) {
  const btn = document.getElementById('btn-investor-refresh');
  if (btn) { btn.disabled = true; btn.textContent = 'Refreshing...'; }

  try {
    const { deal, status, balances, events, reports, cycles, returns } = await fetchInvestorDealBundle(id);
    const badgeEl = document.getElementById('investor-status-badge');
    const cycleEl = document.getElementById('investor-cycle-text');
    const eventsEl = document.getElementById('investor-events-list');
    const reportsEl = document.getElementById('investor-reports-list');
    const cyclesEl = document.getElementById('investor-cycles-list');
    const summaryEl = document.getElementById('investor-investment-summary');
    const returnsEl = document.getElementById('investor-returns-list');
    if (badgeEl) badgeEl.innerHTML = statusBadge(status?.status);
    if (cycleEl) cycleEl.textContent = `Cycle ${status?.current_cycle ?? '—'}`;
    if (eventsEl) eventsEl.innerHTML = renderEvents(events);
    if (reportsEl) reportsEl.innerHTML = renderInvestorReports(reports);
    if (cyclesEl) cyclesEl.innerHTML = renderCycleStatusCards(cycles);
    if (summaryEl) summaryEl.innerHTML = renderInvestmentSummary(deal);
    if (returnsEl) returnsEl.innerHTML = renderRepaymentHistory(returns);

    const investorBalanceEl = document.getElementById('investor-available-balance');
    if (investorBalanceEl) {
      const investorBalance = balances?.investor || '0';
      investorBalanceEl.textContent = `${yoctoToNear(investorBalance)} · ${formatYoctoRaw(investorBalance)}`;
    }
  } catch (err) {
    showInvestorActionResult('error', `Refresh failed: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }
  }
}

// --- Deal detail ---

async function showDeal(id) {
  showView('view-detail');
  const el = document.getElementById('view-detail');
  el.innerHTML = `
    ${renderNav()}
    <a href="#deals" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">← Back</a>
    <div class="spinner"></div>
  `;

  const headers = authHeaders();
  const [dealRes, statusRes, balancesRes, eventsRes, cyclesRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/status`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/balances`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/events`, { headers }),
    isAdmin()
      ? fetch(`${API_BASE}/api/admin/deals/${id}/cycles`, { headers })
      : Promise.resolve(new Response(JSON.stringify({ cycles: [] }), { status: 200, headers: { 'content-type': 'application/json' } }))
  ]);

  el.querySelector('.spinner')?.remove();

  if (dealRes.status === 'rejected' || !dealRes.value.ok) {
    const code = dealRes.value?.status;
    el.innerHTML += code === 404
      ? '<p class="text-slate-400 mt-8 text-center">Deal not found</p>'
      : '<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Backend unavailable</div>';
    return;
  }

  const deal = await dealRes.value.json();
  const status = statusRes.status === 'fulfilled' && statusRes.value.ok
    ? await statusRes.value.json() : null;
  const balances = balancesRes.status === 'fulfilled' && balancesRes.value.ok
    ? await balancesRes.value.json() : null;
  const events = eventsRes.status === 'fulfilled' && eventsRes.value.ok
    ? await eventsRes.value.json() : [];
  const cycles = cyclesRes.status === 'fulfilled' && cyclesRes.value.ok
    ? (await cyclesRes.value.json()).cycles || [] : [];

  renderDealDetail(el, deal, status, balances, events, cycles);
}

function renderDealDetail(el, deal, status, balances, events, cycles = []) {
  const dealTitle = deal.title || deal.deal_type;
  const cycleText = status ? `· Cycle ${status.current_cycle}` : '';
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="#deals" class="text-slate-400 hover:text-white text-sm">← Back</a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">${escapeHtml(dealTitle)}</span>
      <span id="status-badge">${statusBadge(status?.status)}</span>
      <span id="cycle-text" class="text-slate-400 text-sm">${cycleText}</span>
      <button id="btn-refresh" class="ml-auto bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded transition">Refresh</button>
    </div>
    ${deal.description ? `<p class="text-slate-400 mb-6">${escapeHtml(deal.description)}</p>` : ''}
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl p-5 space-y-2">
        ${renderParams(deal)}
      </div>
      <div class="bg-slate-800 rounded-xl p-5 flex flex-col items-center justify-center" id="chart-col">
        ${balances
          ? `<canvas id="balances-chart" width="240" height="240"></canvas>
             <div id="balances-summary" class="w-full mt-4 space-y-2">
               ${renderBalancesSummary(balances)}
             </div>`
          : '<p class="text-slate-500 text-sm">Balances unavailable</p>'}
      </div>
    </div>
    ${isAdmin() ? renderAdminActions(deal, status?.status) : ''}
    ${isAdmin() ? `
      <div class="bg-slate-800 rounded-xl p-5 mb-6">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Farmer Cycle Status</h3>
        <div id="admin-cycles-list">${renderCycleStatusCards(cycles)}</div>
      </div>
    ` : ''}
    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Event History</h3>
      <div id="events-list">${renderEvents(events)}</div>
    </div>
  `;

  if (balances) renderBalancesChart(balances);

  document.getElementById('btn-refresh').addEventListener('click', () => refreshDeal(deal.id));
  if (isAdmin()) bindAdminActions(deal);
}

function renderParams(deal) {
  const rows = [
    ['Farmer',             formatAddress(deal.farmer)],
    ['Investor',           formatAddress(deal.investor)],
    ['Administrator',      formatAddress(deal.admin)],
    ['Platform',           formatAddress(deal.platform)],
    ['Split',              `${deal.farmer_split_pct}% / ${deal.investor_split_pct}%`],
    ['Escrow',             `${deal.escrow_pct}%`],
    ['Performance Fee',    `${deal.performance_fee_pct}%`],
    ['Cycle duration',     `${deal.cycle_duration_days} days`],
    ['Total cycles',       deal.total_cycles],
    ['Investment',         yoctoToNear(deal.investment_amount)],
    ['Capital return',     yoctoToNear(deal.capital_return_near)],
  ];
  return rows.map(([k, v]) => `
    <div class="flex justify-between text-sm gap-2">
      <span class="text-slate-400 shrink-0">${k}</span>
      <span class="text-slate-100 font-mono text-right">${v}</span>
    </div>
  `).join('');
}

function renderBalancesSummary(balances) {
  const rows = [
    ['Farmer', balances.farmer],
    ['Investor', balances.investor],
    ['Platform', balances.platform],
    ['Escrow', balances.escrow],
  ];

  return rows.map(([label, raw]) => `
    <div class="balance-row">
      <span class="balance-label">${label}</span>
      <span class="balance-values">
        <span class="balance-near">${yoctoToNear(raw)}</span>
        <span class="balance-raw">${formatYoctoRaw(raw)}</span>
      </span>
    </div>
  `).join('');
}

function isAdminActionEnabled(action, status) {
  const normalizedStatus = status || 'Initialized';
  if (action === 'fund') return normalizedStatus === 'Initialized';
  if (action === 'start-cycle') return normalizedStatus === 'Funded';
  if (action === 'report-profit') return normalizedStatus === 'CycleActive';
  return true;
}

function renderAdminActionButton(action, label, status, className = '') {
  const enabled = isAdminActionEnabled(action, status);
  return `
    <button type="button" class="admin-action-btn ${className}" data-action="${action}" ${enabled ? '' : 'disabled'}>
      ${label}
    </button>
  `;
}

function renderAdminActions(deal, status) {
  return `
    <div id="admin-actions" data-status="${escapeHtml(status || 'Initialized')}" class="bg-slate-800 rounded-xl p-5 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide">Admin Actions</h3>
        <span class="text-xs text-slate-500">Blockchain transactions require confirmation</span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        ${renderAdminActionButton('fund', 'Fund', status, 'action-fund')}
        ${renderAdminActionButton('start-cycle', 'Start Cycle', status)}
        ${renderAdminActionButton('report-profit', 'Report Profit', status)}
        ${renderAdminActionButton('withdraw-farmer', 'Withdraw Farmer', status)}
        ${renderAdminActionButton('withdraw-investor', 'Withdraw Investor', status)}
        ${renderAdminActionButton('withdraw-platform', 'Withdraw Platform', status)}
      </div>
      <form id="admin-return-form" class="mt-5 border-t border-slate-700 pt-4 space-y-3">
        <h4 class="text-sm font-semibold text-slate-300">Record Return</h4>
        <div class="grid sm:grid-cols-[160px_1fr_auto] gap-2">
          <input id="admin-return-amount" name="amount_near" type="text" inputmode="decimal" placeholder="Amount (NEAR)"
            class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-green-500" />
          <input id="admin-return-note" name="note" type="text" placeholder="Note"
            class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-green-500" />
          <button id="btn-admin-record-return" type="submit" class="admin-action-btn">Record Return</button>
        </div>
      </form>
      <div id="admin-action-result" class="hidden mt-4 rounded-lg px-4 py-3 text-sm"></div>
    </div>
  `;
}

function bindAdminActions(deal) {
  document.querySelectorAll('.admin-action-btn').forEach(btn => {
    if (btn.type === 'submit') return;
    btn.addEventListener('click', () => runAdminAction(deal, btn.dataset.action));
  });
  document.getElementById('admin-return-form')?.addEventListener('submit', (event) => recordAdminReturn(event, deal));
}

function setAdminActionBusy(isBusy) {
  if (isBusy) {
    document.querySelectorAll('.admin-action-btn').forEach(btn => {
      btn.disabled = true;
    });
    return;
  }
  updateAdminActionState(document.getElementById('admin-actions')?.dataset.status);
}

function updateAdminActionState(status) {
  const actionsEl = document.getElementById('admin-actions');
  if (!actionsEl) return;
  const normalizedStatus = status || 'Initialized';
  actionsEl.dataset.status = normalizedStatus;
  actionsEl.querySelectorAll('.admin-action-btn').forEach(btn => {
    btn.disabled = !isAdminActionEnabled(btn.dataset.action, normalizedStatus);
  });
}

function showAdminActionResult(type, message, txHash) {
  const el = document.getElementById('admin-action-result');
  if (!el) return;
  const isSuccess = type === 'success';
  el.className = `${isSuccess ? 'bg-green-900 text-green-100' : 'bg-red-900 text-red-100'} mt-4 rounded-lg px-4 py-3 text-sm`;
  el.innerHTML = `
    <div class="font-medium">${escapeHtml(message)}</div>
    ${txHash ? `<div class="mt-1 text-xs">Tx: <a href="https://testnet.nearblocks.io/txns/${escapeHtml(txHash)}" target="_blank" class="font-mono underline">${escapeHtml(txHash)}</a></div>` : ''}
  `;
  el.classList.remove('hidden');
}

async function recordAdminReturn(event, deal) {
  event.preventDefault();
  const form = event.currentTarget;
  const btn = document.getElementById('btn-admin-record-return');
  const amountNear = document.getElementById('admin-return-amount')?.value.trim();
  const note = document.getElementById('admin-return-note')?.value.trim();
  if (btn) { btn.disabled = true; btn.textContent = 'Recording...'; }
  showAdminActionResult('success', 'Recording return...');

  try {
    const res = await fetch(`${API_BASE}/api/admin/deals/${deal.id}/returns`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ amount_near: amountNear, note }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    form.reset();
    showAdminActionResult('success', 'Return recorded successfully');
    await refreshDeal(deal.id);
  } catch (err) {
    showAdminActionResult('error', `Record return failed: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Record Return'; }
  }
}

function adminActionConfig(deal, action) {
  const base = `${API_BASE}/api/admin/deals/${deal.id}`;
  const configs = {
    fund: {
      label: 'Fund deal',
      confirm: `Fund this deal as investor ${deal.investor}?`,
      url: `${base}/fund-as`,
      body: { account_id: deal.investor }
    },
    'start-cycle': {
      label: 'Start cycle',
      confirm: 'Start the next contract cycle?',
      url: `${base}/start-cycle`
    },
    'withdraw-farmer': {
      label: 'Withdraw farmer',
      confirm: `Withdraw farmer balance to ${deal.farmer}?`,
      url: `${base}/withdraw-as`,
      body: { account_id: deal.farmer }
    },
    'withdraw-investor': {
      label: 'Withdraw investor',
      confirm: `Withdraw investor balance to ${deal.investor}?`,
      url: `${base}/withdraw-as`,
      body: { account_id: deal.investor }
    },
    'withdraw-platform': {
      label: 'Withdraw platform',
      confirm: `Withdraw platform balance to ${deal.platform}?`,
      url: deal.platform === deal.admin ? `${base}/withdraw` : `${base}/withdraw-as`,
      body: deal.platform === deal.admin ? null : { account_id: deal.platform }
    }
  };

  if (action === 'report-profit') {
    const profitNear = prompt('Profit amount in NEAR', '300');
    if (profitNear == null) return null;
    const lossesNear = prompt('Losses amount in NEAR', '0');
    if (lossesNear == null) return null;
    const profitYocto = nearToYocto(profitNear);
    const lossesYocto = nearToYocto(lossesNear || '0');
    return {
      label: 'Report profit',
      confirm: `Report profit ${profitNear} NEAR and losses ${lossesNear || '0'} NEAR?`,
      url: `${base}/report-cycle`,
      body: { profit_near: profitYocto, losses_near: lossesYocto }
    };
  }

  return configs[action];
}

async function runAdminAction(deal, action) {
  const currentStatus = document.getElementById('admin-actions')?.dataset.status;
  if (!isAdminActionEnabled(action, currentStatus)) {
    showAdminActionResult('success', `${action} is not available while deal status is ${currentStatus || 'Initialized'}.`);
    return;
  }

  let config;
  try {
    config = adminActionConfig(deal, action);
  } catch (err) {
    showAdminActionResult('error', err.message);
    return;
  }
  if (!config) return;
  if (!confirm(config.confirm)) return;

  setAdminActionBusy(true);
  showAdminActionResult('success', `${config.label} submitted...`);

  try {
    const res = await fetch(config.url, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: config.body ? JSON.stringify(config.body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);

    showAdminActionResult('success', `${config.label} completed successfully`, data.tx_hash);
    await refreshDeal(deal.id);
  } catch (err) {
    showAdminActionResult('error', `${config.label} failed: ${err.message}`);
  } finally {
    setAdminActionBusy(false);
  }
}

// --- Chart, events, refresh ---

let balancesChartInstance = null;

function renderBalancesChart(balances) {
  if (balancesChartInstance) {
    balancesChartInstance.destroy();
    balancesChartInstance = null;
  }
  const ctx = document.getElementById('balances-chart');
  if (!ctx) return;
  const data = [
    yoctoToNearFloat(balances.farmer),
    yoctoToNearFloat(balances.investor),
    yoctoToNearFloat(balances.platform),
    yoctoToNearFloat(balances.escrow),
  ];
  balancesChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Farmer', 'Investor', 'Platform', 'Escrow'],
      datasets: [{
        data,
        backgroundColor: ['#2563eb', '#16a34a', '#ca8a04', '#dc2626'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 12 }, padding: 12 }
        }
      },
      cutout: '65%'
    }
  });
}

function renderEvents(events) {
  if (!events.length) return '<p class="text-slate-500 text-sm">No events</p>';
  return events.map(e => {
    const profitHtml = e.profit_near
      ? `<span class="text-green-400 ml-2">+${yoctoToNear(e.profit_near)}</span>` : '';
    const lossHtml = e.losses_near && e.losses_near !== '0'
      ? `<span class="text-red-400 ml-2">−${yoctoToNear(e.losses_near)}</span>` : '';
    const txHtml = e.tx_hash
      ? `<a href="https://testnet.nearblocks.io/txns/${e.tx_hash}" target="_blank" class="text-blue-400 hover:underline font-mono">${formatAddress(e.tx_hash)}</a>`
      : '';
    const date = new Date(e.created_at).toLocaleDateString('en-US');
    return `
      <div class="flex justify-between items-start text-sm py-2.5 border-b border-slate-700 last:border-0 gap-2">
        <div>
          <span class="text-slate-200 font-medium">${e.event_type}</span>
          ${e.cycle_num != null ? `<span class="text-slate-400 ml-2">cycle ${e.cycle_num}</span>` : ''}
          ${profitHtml}${lossHtml}
        </div>
        <div class="text-right text-slate-500 shrink-0">
          ${txHtml}
          <div class="text-xs mt-0.5">${date}</div>
        </div>
      </div>
    `;
  }).join('');
}

async function refreshDeal(id) {
  const btn = document.getElementById('btn-refresh');
  if (btn) { btn.disabled = true; btn.textContent = 'Refreshing...'; }

  const headers = authHeaders();
  const [statusRes, balancesRes, eventsRes, cyclesRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}/status`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/balances`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/events`, { headers }),
    isAdmin()
      ? fetch(`${API_BASE}/api/admin/deals/${id}/cycles`, { headers })
      : Promise.resolve(new Response(JSON.stringify({ cycles: [] }), { status: 200, headers: { 'content-type': 'application/json' } }))
  ]);

  const status = statusRes.status === 'fulfilled' && statusRes.value.ok
    ? await statusRes.value.json() : null;
  const balances = balancesRes.status === 'fulfilled' && balancesRes.value.ok
    ? await balancesRes.value.json() : null;
  const events = eventsRes.status === 'fulfilled' && eventsRes.value.ok
    ? await eventsRes.value.json() : null;
  const cycles = cyclesRes.status === 'fulfilled' && cyclesRes.value.ok
    ? (await cyclesRes.value.json()).cycles || [] : null;

  if (status) {
    const badgeEl = document.getElementById('status-badge');
    const cycleEl = document.getElementById('cycle-text');
    if (badgeEl) badgeEl.innerHTML = statusBadge(status.status);
    updateAdminActionState(status.status);
    if (cycleEl) cycleEl.textContent = `· Cycle ${status.current_cycle}`;
  }
  if (balances) renderBalancesChart(balances);

  if (balances) {
    const summaryEl = document.getElementById('balances-summary');
    if (summaryEl) summaryEl.innerHTML = renderBalancesSummary(balances);
  }

  if (events) {
    const eventsEl = document.getElementById('events-list');
    if (eventsEl) eventsEl.innerHTML = renderEvents(events);
  }

  if (cycles) {
    const cyclesEl = document.getElementById('admin-cycles-list');
    if (cyclesEl) cyclesEl.innerHTML = renderCycleStatusCards(cycles);
  }

  if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }
}
