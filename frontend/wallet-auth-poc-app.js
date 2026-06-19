import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { Buffer } from 'buffer';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const NEAR_WALLET_NETWORK = 'testnet';
const NEAR_RPC_URL = import.meta.env.VITE_NEAR_RPC_URL || 'https://test.rpc.fastnear.com';
const NEAR_WALLET_NETWORK_CONFIG = {
  networkId: NEAR_WALLET_NETWORK,
  nodeUrl: NEAR_RPC_URL,
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://testnet.nearblocks.io',
  indexerUrl: 'https://testnet-api.kitwallet.app',
};

const POC_TOKEN_KEY = 'ap_wallet_auth_poc_token';
const POC_CHALLENGE_KEY = 'ap_wallet_auth_poc_challenge';

const els = {
  init: document.getElementById('btn-init-selector'),
  sign: document.getElementById('btn-sign-message'),
  check: document.getElementById('btn-check-session'),
  clear: document.getElementById('btn-clear-poc'),
  walletStatus: document.getElementById('wallet-status'),
  authStatus: document.getElementById('auth-status'),
  log: document.getElementById('poc-log'),
};

let selector;

function log(message, data) {
  const line = data ? `${message}\n${JSON.stringify(data, null, 2)}` : message;
  els.log.textContent = `${new Date().toISOString()}  ${line}\n\n${els.log.textContent}`;
}

function setAuthStatus() {
  els.authStatus.textContent = localStorage.getItem(POC_TOKEN_KEY) ? 'POC token stored' : 'No POC token';
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
  const preview = text.slice(0, 200);

  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(
      `Expected JSON but received ${contentType || 'unknown content type'} from ${response.url} ` +
        `(status ${response.status}). First 200 chars: ${preview}`
    );
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Invalid JSON from ${response.url} (status ${response.status}). First 200 chars: ${preview}`
    );
  }
}

async function initSelector() {
  selector = await setupWalletSelector({
    network: NEAR_WALLET_NETWORK_CONFIG,
    modules: [setupMyNearWallet()],
  });

  const state = selector.store.getState();
  const account = state.accounts.find(item => item.active) || state.accounts[0];
  els.walletStatus.textContent = account ? account.accountId : 'Ready to connect';
  els.sign.disabled = false;
  log('Wallet Selector initialized', {
    networkId: NEAR_WALLET_NETWORK,
    nodeUrl: NEAR_RPC_URL,
    selectedWalletId: state.selectedWalletId,
    accounts: state.accounts.map(item => item.accountId),
  });
}

async function signMessage() {
  if (!selector) {
    await initSelector();
  }

  const wallet = await selector.wallet('my-near-wallet');
  const challenge = await postJson('/api/wallet-auth/challenge');
  const callbackUrl = `${window.location.origin}${window.location.pathname}`;
  challenge.callbackUrl = callbackUrl;
  localStorage.setItem(POC_CHALLENGE_KEY, JSON.stringify(challenge));

  log('Challenge received', challenge);

  const nonce = Buffer.from(challenge.nonceBase64, 'base64');
  log('Nonce diagnostics before signMessage', {
    constructorName: nonce.constructor?.name,
    isBuffer: Buffer.isBuffer(nonce),
    length: nonce.length,
    byteLength: nonce.byteLength,
  });

  if (nonce.length !== 32) {
    throw new Error(`Challenge nonce must decode to exactly 32 bytes; received ${nonce.length}`);
  }

  await wallet.signMessage({
    message: challenge.message,
    recipient: challenge.recipient,
    nonce,
    callbackUrl,
  });
}

async function verifyCallback(callbackParams) {
  const challengeRaw = localStorage.getItem(POC_CHALLENGE_KEY);
  if (!challengeRaw) {
    throw new Error('Wallet callback received but no stored POC challenge was found');
  }

  const challenge = JSON.parse(challengeRaw);
  const payload = {
    account_id: callbackParams.accountId || callbackParams.account_id,
    public_key: callbackParams.publicKey || callbackParams.public_key,
    signature: callbackParams.signature?.replace(/ /g, '+'),
    nonce: challenge.nonce,
    callbackUrl: challenge.callbackUrl || `${window.location.origin}${window.location.pathname}`,
  };

  log('Wallet signMessage callback', callbackParams);
  log('Backend verify payload', {
    account_id: payload.account_id,
    public_key: payload.public_key,
    signature: payload.signature,
    nonce: payload.nonce,
    callbackUrl: payload.callbackUrl,
  });
  const verified = await postJson('/api/wallet-auth/verify', payload);
  console.log('VERIFY RESPONSE RECEIVED', verified);
  log('VERIFY RESPONSE RECEIVED', {
    ...verified,
    token: verified.token?.slice(0, 20),
  });

  const token = verified.token;
  if (!token) {
    throw new Error('Verify response did not include token');
  }

  localStorage.setItem(POC_TOKEN_KEY, token);
  console.log('TOKEN SAVED TO STORAGE', token?.slice(0, 20));
  log('TOKEN SAVED TO STORAGE', { token: token?.slice(0, 20) });
  localStorage.removeItem(POC_CHALLENGE_KEY);
  els.walletStatus.textContent = verified.account_id;
  setAuthStatus();
  log('Backend verification succeeded', verified);

  window.history.replaceState({}, document.title, window.location.pathname);
}

async function checkSession() {
  const token = localStorage.getItem(POC_TOKEN_KEY);
  console.log('TOKEN LOADED FROM STORAGE', token?.slice(0, 20));
  log('TOKEN LOADED FROM STORAGE', { token: token?.slice(0, 20) });
  if (!token) {
    throw new Error('No POC token stored');
  }

  const authorizationHeader = `Bearer ${token}`;
  console.log('AUTH HEADER SENT', authorizationHeader?.slice(0, 30));
  log('AUTH HEADER SENT', { authorization: authorizationHeader?.slice(0, 30) });
  const response = await fetch(`${API_BASE}/api/investor/me`, {
    headers: { authorization: authorizationHeader },
  });
  const data = await readJsonResponse(response);
  if (!response.ok) {
    throw new Error(data.error || `Request failed with ${response.status}`);
  }
  log('/api/investor/me response', data);
}

function clearSession() {
  localStorage.removeItem(POC_TOKEN_KEY);
  localStorage.removeItem(POC_CHALLENGE_KEY);
  setAuthStatus();
  log('POC session cleared');
}

function readCallbackParams() {
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const hashParams = new URLSearchParams(hash);

  for (const [key, value] of hashParams.entries()) {
    if (!params.has(key)) params.set(key, value);
  }

  return Object.fromEntries(params.entries());
}

async function verifyCallbackIfPresent() {
  const params = readCallbackParams();
  if (!params.signature) return;

  try {
    await verifyCallback(params);
  } catch (err) {
    log(err.message || 'Wallet callback verification failed', params);
    localStorage.removeItem(POC_CHALLENGE_KEY);
    window.history.replaceState({}, document.title, window.location.pathname);
    log('POC callback cleared after failed verification. Click Sign Message to request a fresh challenge.');
  }
}

function bind(button, handler) {
  button.addEventListener('click', async () => {
    try {
      await handler();
    } catch (err) {
      log(err.message || 'Unexpected POC error');
    }
  });
}

bind(els.init, initSelector);
bind(els.sign, signMessage);
bind(els.check, checkSession);
bind(els.clear, clearSession);
setAuthStatus();
verifyCallbackIfPresent();
