#!/usr/bin/env node

/*
Usage:
  ADMIN_USERNAME=admin ADMIN_PASSWORD=... npm run pilot:deal2

Optional env:
  ADMIN_JWT=...
  API_BASE_URL=http://localhost:3000
  DEAL_ID=2
  PROFIT_NEAR=1000000000000000000000000
  LOSSES_NEAR=0

This script only calls the local HTTP API. It does not read private keys,
write token.json, or modify backend/.env.
*/

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const DEAL_ID = process.env.DEAL_ID || '2';
const PROFIT_NEAR = process.env.PROFIT_NEAR || '1000000000000000000000000';
const LOSSES_NEAR = process.env.LOSSES_NEAR || '0';

const FARMER_ACCOUNT = process.env.FARMER_ACCOUNT || 'farmer-ap.testnet';
const INVESTOR_ACCOUNT = process.env.INVESTOR_ACCOUNT || 'investor-ap.testnet';

function endpoint(path) {
  return `${API_BASE_URL}${path}`;
}

async function parseResponseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(method, path, { token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(endpoint(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const data = await parseResponseBody(res);

  if (!res.ok) {
    const err = new Error(`${method} ${path} failed with HTTP ${res.status}`);
    err.details = { method, url: endpoint(path), status: res.status, body: data };
    throw err;
  }

  return data;
}

async function getAdminToken() {
  if (process.env.ADMIN_JWT) {
    console.log('Using ADMIN_JWT from environment');
    return process.env.ADMIN_JWT;
  }

  const { ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_JWT or ADMIN_USERNAME and ADMIN_PASSWORD before running this script');
  }

  console.log(`Logging in as ${ADMIN_USERNAME}`);
  const data = await request('POST', '/api/auth/login', {
    body: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD }
  });

  if (!data?.token) {
    throw new Error('Login succeeded but no token was returned');
  }

  return data.token;
}

function printJson(label, data) {
  console.log(`\n${label}`);
  console.log(JSON.stringify(data, null, 2));
}

function logTx(label, data) {
  const txHash = data?.tx_hash || data?.txHash;
  console.log(`${label}: ${txHash ? `tx_hash=${txHash}` : 'no tx_hash returned'}`);
  return txHash;
}

async function printStatusAndBalances(token, label) {
  const status = await request('GET', `/api/deals/${DEAL_ID}/status`, { token });
  const balances = await request('GET', `/api/deals/${DEAL_ID}/balances`, { token });
  printJson(`${label} status`, status);
  printJson(`${label} balances`, balances);
  return { status, balances };
}

async function printEvents(token, label) {
  const events = await request('GET', `/api/deals/${DEAL_ID}/events`, { token });
  printJson(`${label} events`, events);
  return events;
}

async function postAdmin(token, path, body) {
  return request('POST', `/api/admin/deals/${DEAL_ID}${path}`, { token, body });
}

async function withdrawFarmer(token) {
  const data = await postAdmin(token, '/withdraw-as', { account_id: FARMER_ACCOUNT });
  logTx('Withdraw Farmer', data);
}

async function withdrawInvestor(token) {
  const data = await postAdmin(token, '/withdraw-as', { account_id: INVESTOR_ACCOUNT });
  logTx('Withdraw Investor', data);
}

async function withdrawPlatform(token) {
  const data = await postAdmin(token, '/withdraw');
  logTx('Withdraw Platform', data);
}

async function runCycle(token, cycleNumber, { printEventsAfter = false } = {}) {
  console.log(`\n=== Cycle ${cycleNumber} ===`);

  const start = await postAdmin(token, '/start-cycle');
  logTx(`Start Cycle ${cycleNumber}`, start);

  await printStatusAndBalances(token, `After Start Cycle ${cycleNumber}`);

  const report = await postAdmin(token, '/report-cycle', {
    profit_near: PROFIT_NEAR,
    losses_near: LOSSES_NEAR
  });
  logTx(`Report Profit Cycle ${cycleNumber}`, report);

  await printStatusAndBalances(token, `After Report Profit Cycle ${cycleNumber}`);

  await withdrawFarmer(token);
  await withdrawInvestor(token);
  await withdrawPlatform(token);

  await printStatusAndBalances(token, `After Cycle ${cycleNumber} Withdrawals`);
  if (printEventsAfter) {
    await printEvents(token, `After Cycle ${cycleNumber}`);
  }
}

async function main() {
  console.log('AgriPartners Deal completion pilot');
  console.log(`API_BASE_URL=${API_BASE_URL}`);
  console.log(`DEAL_ID=${DEAL_ID}`);
  console.log(`PROFIT_NEAR=${PROFIT_NEAR}`);
  console.log(`LOSSES_NEAR=${LOSSES_NEAR}`);

  const token = await getAdminToken();

  await printStatusAndBalances(token, 'Initial');
  await runCycle(token, 2, { printEventsAfter: true });

  console.log('\n=== Cycle 3 / Completion ===');
  const start = await postAdmin(token, '/start-cycle');
  logTx('Start Cycle 3', start);

  const report = await postAdmin(token, '/report-cycle', {
    profit_near: PROFIT_NEAR,
    losses_near: LOSSES_NEAR
  });
  logTx('Report Profit Cycle 3', report);

  await printStatusAndBalances(token, 'After Report Profit Cycle 3');

  await withdrawFarmer(token);
  await withdrawInvestor(token);
  await withdrawPlatform(token);

  const finalState = await printStatusAndBalances(token, 'Final');
  await printEvents(token, 'Final');

  const reachedCompleted = finalState.status?.status === 'Completed';
  console.log(`\nCompleted reached: ${reachedCompleted ? 'YES' : 'NO'}`);
  if (!reachedCompleted) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('\nPilot script failed.');
  console.error(err.message);
  if (err.details) {
    console.error(JSON.stringify(err.details, null, 2));
  }
  process.exit(1);
});
