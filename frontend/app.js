const API_BASE = 'https://agripartners.onrender.com';

// --- Auth state ---

function getAuth() {
  try { return JSON.parse(localStorage.getItem('ap_auth') || 'null'); } catch { return null; }
}

function setAuth(token, user) {
  localStorage.setItem('ap_auth', JSON.stringify({ token, user }));
}

function clearAuth() {
  localStorage.removeItem('ap_auth');
}

function authHeaders() {
  const auth = getAuth();
  return auth ? { Authorization: `Bearer ${auth.token}` } : {};
}

function jsonAuthHeaders() {
  return { ...authHeaders(), 'Content-Type': 'application/json' };
}

function isAdmin() {
  return getAuth()?.user?.role === 'admin';
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
  ['view-login', 'view-list', 'view-detail', 'view-investor'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(viewId).classList.remove('hidden');
}

function route() {
  const auth = getAuth();
  const hash = location.hash;

  if (hash === '#login') {
    if (auth) { location.hash = '#deals'; return; }
    showLogin();
    return;
  }

  if (!auth) {
    location.hash = '#login';
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

  const m = hash.match(/^#deals\/(\d+)$/);
  if (m) {
    showDeal(m[1]);
  } else {
    if (auth.user.role === 'investor') {
      location.hash = '#investor';
    } else {
      showDeals();
    }
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', () => {
  if (!location.hash || location.hash === '#') {
    const auth = getAuth();
    location.hash = auth ? (auth.user.role === 'investor' ? '#investor' : '#deals') : '#login';
  } else {
    route();
  }
});

// --- Login ---

function showLogin() {
  showView('view-login');
  const el = document.getElementById('view-login');
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
    </form>
  `;
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
    location.hash = data.user.role === 'investor' ? '#investor' : '#deals';
  } catch {
    errEl.textContent = 'Server unavailable';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

function logout() {
  clearAuth();
  location.hash = '#login';
}

// --- Nav bar ---

function renderNav() {
  const auth = getAuth();
  if (!auth) return '';
  const labels = { farmer: 'Farmer', investor: 'Investor', admin: 'Administrator' };
  const roleLabel = labels[auth.user.role] || auth.user.role;
  return `
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
      <span class="text-sm text-slate-400">${roleLabel}: <span class="text-slate-200 font-medium">${auth.user.username}</span></span>
      <div class="flex items-center gap-3">
        <a href="#investor" class="text-sm text-slate-400 hover:text-green-400 transition">Investor Portal</a>
        ${auth.user.role === 'admin' ? '<a href="#deals" class="text-sm text-slate-400 hover:text-green-400 transition">Admin Dashboard</a>' : ''}
        <button onclick="logout()" class="text-sm text-slate-400 hover:text-red-400 transition">Sign out →</button>
      </div>
    </div>
  `;
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
  return `
    <div class="bg-slate-800 rounded-xl p-5 flex justify-between items-center gap-4">
      <div class="space-y-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-300">${d.deal_type}</span>
        </div>
        <p class="text-sm text-slate-400">Farmer: <span class="text-slate-200">${formatAddress(d.farmer)}</span></p>
        <p class="text-sm text-slate-400">Investor: <span class="text-slate-200">${formatAddress(d.investor)}</span></p>
        <p class="text-sm text-slate-500">${d.total_cycles} cycle(s) × ${d.cycle_duration_days} days  ·  ${yoctoToNear(d.investment_amount)}</p>
      </div>
      <a href="#deals/${d.id}" class="shrink-0 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Open →</a>
    </div>
  `;
}

// --- Investor Portal ---

async function showInvestorPortal() {
  showView('view-investor');
  const el = document.getElementById('view-investor');
  const auth = getAuth();
  el.innerHTML = `
    ${renderNav()}
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-green-400 mb-1">Investor Portal</h1>
      <p class="text-slate-400">Signed in as <span class="text-slate-200 font-medium">${escapeHtml(auth.user.username)}</span></p>
    </div>
    <h2 class="text-xl font-semibold mb-4">My Investments</h2>
    <div class="spinner"></div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/me/deals`, { headers: authHeaders() });
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const deals = await res.json();
    const enrichedDeals = await enrichDealsForInvestor(deals);
    renderInvestorDashboard(el, enrichedDeals);
  } catch (e) {
    el.querySelector('.spinner')?.remove();
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Investor Portal unavailable: ${escapeHtml(e.message)}</div>`;
  }
}

async function enrichDealsForInvestor(deals) {
  const headers = authHeaders();
  return Promise.all(deals.map(async deal => {
    const [statusRes, balancesRes] = await Promise.allSettled([
      fetch(`${API_BASE}/api/deals/${deal.id}/status`, { headers }),
      fetch(`${API_BASE}/api/deals/${deal.id}/balances`, { headers })
    ]);
    const status = statusRes.status === 'fulfilled' && statusRes.value.ok
      ? await statusRes.value.json() : null;
    const balances = balancesRes.status === 'fulfilled' && balancesRes.value.ok
      ? await balancesRes.value.json() : null;
    return { ...deal, status, balances };
  }));
}

function investorMetrics(deals) {
  return deals.reduce((acc, deal) => {
    acc.totalInvested = addYocto(acc.totalInvested, deal.investment_amount);
    acc.totalInvestorAvailable = addYocto(acc.totalInvestorAvailable, deal.balances?.investor);
    if (deal.status?.status === 'Completed') acc.completedDeals += 1;
    if (deal.status?.status && !['Completed', 'Terminated'].includes(deal.status.status)) {
      acc.activeDeals += 1;
    }
    return acc;
  }, {
    totalInvested: '0',
    activeDeals: 0,
    completedDeals: 0,
    totalInvestorAvailable: '0'
  });
}

function renderInvestorDashboard(el, deals) {
  el.querySelector('.spinner')?.remove();
  const metrics = investorMetrics(deals);

  if (deals.length === 0) {
    el.innerHTML += `
      ${renderInvestorMetrics(metrics)}
      <p class="text-slate-400 mt-6">No investments found</p>
    `;
    return;
  }

  el.innerHTML += `
    ${renderInvestorMetrics(metrics)}
    <div class="grid gap-4 mt-6">
      ${deals.map(renderInvestorDealCard).join('')}
    </div>
  `;
}

function renderInvestorMetrics(metrics) {
  return `
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="metric-box">
        <span class="metric-label">Total Invested</span>
        <span class="metric-value">${yoctoToNear(metrics.totalInvested)}</span>
        <span class="metric-raw">${formatYoctoRaw(metrics.totalInvested)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Active Deals</span>
        <span class="metric-value">${metrics.activeDeals}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Completed Deals</span>
        <span class="metric-value">${metrics.completedDeals}</span>
      </div>
      <div class="metric-box">
        <span class="metric-label">Investor Available</span>
        <span class="metric-value">${yoctoToNear(metrics.totalInvestorAvailable)}</span>
        <span class="metric-raw">${formatYoctoRaw(metrics.totalInvestorAvailable)}</span>
      </div>
    </div>
  `;
}

function renderInvestorDealCard(deal) {
  const status = deal.status?.status || 'Unknown';
  const currentCycle = deal.status?.current_cycle ?? '—';
  return `
    <div class="bg-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-300">Deal #${deal.id}</span>
          ${statusBadge(status)}
          <span class="text-xs text-slate-500">Cycle ${currentCycle}</span>
        </div>
        <p class="text-sm text-slate-400">Contract: <span class="text-slate-200 font-mono">${escapeHtml(formatAddress(deal.contract_address))}</span></p>
        <p class="text-sm text-slate-400">Farmer: <span class="text-slate-200">${escapeHtml(formatAddress(deal.farmer))}</span></p>
        <p class="text-sm text-slate-400">
          Investment:
          <span class="text-slate-100 font-mono">${yoctoToNear(deal.investment_amount)}</span>
          <span class="block text-xs text-slate-500 font-mono">${formatYoctoRaw(deal.investment_amount)}</span>
        </p>
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
    const { deal, status, balances, events } = await fetchInvestorDealBundle(id);
    renderInvestorDealDetail(el, deal, status, balances, events);
  } catch (e) {
    el.querySelector('.spinner')?.remove();
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Deal unavailable: ${escapeHtml(e.message)}</div>`;
  }
}

async function fetchInvestorDealBundle(id) {
  const headers = authHeaders();
  const [dealRes, statusRes, balancesRes, eventsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/status`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/balances`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/events`, { headers })
  ]);

  if (dealRes.status === 'rejected' || !dealRes.value.ok) {
    throw new Error(dealRes.value?.status === 404 ? 'Deal not found' : 'Backend unavailable');
  }

  return {
    deal: await dealRes.value.json(),
    status: statusRes.status === 'fulfilled' && statusRes.value.ok ? await statusRes.value.json() : null,
    balances: balancesRes.status === 'fulfilled' && balancesRes.value.ok ? await balancesRes.value.json() : null,
    events: eventsRes.status === 'fulfilled' && eventsRes.value.ok ? await eventsRes.value.json() : []
  };
}

function renderInvestorDealDetail(el, deal, status, balances, events) {
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

    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Event History</h3>
      <div id="investor-events-list">${renderEvents(events)}</div>
    </div>
  `;

  document.getElementById('btn-investor-refresh').addEventListener('click', () => refreshInvestorDeal(deal.id));
  document.getElementById('btn-investor-withdraw').addEventListener('click', () => withdrawInvestorFromPortal(deal));
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
    const res = await fetch(`${API_BASE}/api/admin/deals/${deal.id}/withdraw-as`, {
      method: 'POST',
      headers: jsonAuthHeaders(),
      body: JSON.stringify({ account_id: deal.investor })
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
    const { status, balances, events } = await fetchInvestorDealBundle(id);
    const badgeEl = document.getElementById('investor-status-badge');
    const cycleEl = document.getElementById('investor-cycle-text');
    const eventsEl = document.getElementById('investor-events-list');
    if (badgeEl) badgeEl.innerHTML = statusBadge(status?.status);
    if (cycleEl) cycleEl.textContent = `Cycle ${status?.current_cycle ?? '—'}`;
    if (eventsEl) eventsEl.innerHTML = renderEvents(events);

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
  const [dealRes, statusRes, balancesRes, eventsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/status`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/balances`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/events`, { headers })
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

  renderDealDetail(el, deal, status, balances, events);
}

function renderDealDetail(el, deal, status, balances, events) {
  const cycleText = status ? `· Cycle ${status.current_cycle}` : '';
  el.innerHTML = `
    ${renderNav()}
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="#deals" class="text-slate-400 hover:text-white text-sm">← Back</a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">${deal.deal_type}</span>
      <span id="status-badge">${statusBadge(status?.status)}</span>
      <span id="cycle-text" class="text-slate-400 text-sm">${cycleText}</span>
      <button id="btn-refresh" class="ml-auto bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded transition">Refresh</button>
    </div>
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
    ${isAdmin() ? renderAdminActions(deal) : ''}
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

function renderAdminActions(deal) {
  return `
    <div class="bg-slate-800 rounded-xl p-5 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide">Admin Actions</h3>
        <span class="text-xs text-slate-500">Blockchain transactions require confirmation</span>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <button type="button" class="admin-action-btn action-fund" data-action="fund">Fund</button>
        <button type="button" class="admin-action-btn" data-action="start-cycle">Start Cycle</button>
        <button type="button" class="admin-action-btn" data-action="report-profit">Report Profit</button>
        <button type="button" class="admin-action-btn" data-action="withdraw-farmer">Withdraw Farmer</button>
        <button type="button" class="admin-action-btn" data-action="withdraw-investor">Withdraw Investor</button>
        <button type="button" class="admin-action-btn" data-action="withdraw-platform">Withdraw Platform</button>
      </div>
      <div id="admin-action-result" class="hidden mt-4 rounded-lg px-4 py-3 text-sm"></div>
    </div>
  `;
}

function bindAdminActions(deal) {
  document.querySelectorAll('.admin-action-btn').forEach(btn => {
    btn.addEventListener('click', () => runAdminAction(deal, btn.dataset.action));
  });
}

function setAdminActionBusy(isBusy) {
  document.querySelectorAll('.admin-action-btn').forEach(btn => {
    btn.disabled = isBusy;
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
  const [statusRes, balancesRes, eventsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}/status`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/balances`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/events`, { headers })
  ]);

  const status = statusRes.status === 'fulfilled' && statusRes.value.ok
    ? await statusRes.value.json() : null;
  const balances = balancesRes.status === 'fulfilled' && balancesRes.value.ok
    ? await balancesRes.value.json() : null;
  const events = eventsRes.status === 'fulfilled' && eventsRes.value.ok
    ? await eventsRes.value.json() : null;

  if (status) {
    const badgeEl = document.getElementById('status-badge');
    const cycleEl = document.getElementById('cycle-text');
    if (badgeEl) badgeEl.innerHTML = statusBadge(status.status);
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

  if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }
}
