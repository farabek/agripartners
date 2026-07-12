# Frontend Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static HTML/JS/CSS dashboard for AgriPartners — deals list and a detail page for each deal with blockchain balances.

**Architecture:** Hash-based SPA (no build step). Two views: `#deals` (deal cards) and `#deals/:id` (details + Chart.js donut + event history). Frontend calls backend API at `localhost:3000`.

**Tech Stack:** HTML5, Tailwind CSS v3 (CDN), Chart.js v4 (CDN), vanilla JS (BigInt for yoctoNEAR), Express cors middleware.

---

## File Structure

```
E:\agripartners\
  backend\src\app.js          — add cors middleware
  frontend\
    index.html                — HTML skeleton, CDN imports
    style.css                 — dark theme, status badge colors, spinner
    app.js                    — utilities, router, all view functions
```

---

## Task 1: Add CORS to backend

**Files:**

- Modify: `E:\agripartners\backend\src\app.js`
- Modify: `E:\agripartners\backend\package.json` (via npm install)

Without CORS the browser blocks fetch requests from `file://` or another port to `localhost:3000`.

- [ ] **Step 1: Install cors**

```powershell
Set-Location E:\agripartners\backend
npm install cors
```

Expected output: `added 1 package` (or similar).

- [ ] **Step 2: Add cors to app.js**

Open `E:\agripartners\backend\src\app.js` and add cors after the `const express = require('express');` line:

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { requireApiKey } = require('./middleware/auth');
const dealsRouter = require('./routes/deals');
const adminRouter = require('./routes/admin');

['API_KEY', 'NEAR_ADMIN_ACCOUNT', 'NEAR_ADMIN_PRIVATE_KEY'].forEach(k => {
  if (!process.env[k]) throw new Error(`Missing required env var: ${k}`);
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/deals', dealsRouter);
app.use('/api/admin', requireApiKey, adminRouter);

module.exports = app;
```

- [ ] **Step 3: Verify backend starts**

```powershell
Set-Location E:\agripartners\backend
npm start
```

Expected output: `AgriPartners backend listening on port 3000` (or similar). Press Ctrl+C.

- [ ] **Step 4: Verify tests pass**

```powershell
Set-Location E:\agripartners\backend
npm test
```

Expected output: `29 passed` (all tests green).

- [ ] **Step 5: Commit**

```powershell
Set-Location E:\agripartners
git add backend/src/app.js backend/package.json backend/package-lock.json
git commit -m "feat: add CORS middleware to backend"
```

---

## Task 2: HTML skeleton + dark theme CSS

**Files:**

- Create: `E:\agripartners\frontend\index.html`
- Create: `E:\agripartners\frontend\style.css`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen font-sans">
  <div id="view-list" class="hidden max-w-4xl mx-auto px-4 py-8"></div>
  <div id="view-detail" class="hidden max-w-4xl mx-auto px-4 py-8"></div>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create `style.css`**

```css
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-Initialized     { background-color: #374151; color: #9ca3af; }
.badge-Funded          { background-color: #78350f; color: #fde68a; }
.badge-CycleActive     { background-color: #1e3a5f; color: #93c5fd; }
.badge-CycleSettlement { background-color: #7c2d12; color: #fdba74; }
.badge-Completed       { background-color: #14532d; color: #86efac; }
.badge-Terminated      { background-color: #7f1d1d; color: #fca5a5; }

.spinner {
  border: 3px solid #334155;
  border-top-color: #22d3ee;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 0.8s linear infinite;
  margin: 2rem auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

- [ ] **Step 3: Visual check**

Install `serve` if not available:

```powershell
npm install -g serve
```

Run:

```powershell
serve E:\agripartners\frontend -p 5500
```

Open `http://localhost:5500` in browser.
Expected result: dark page (bg-slate-900), both `div`s hidden (no visible content). No errors in DevTools Console.

- [ ] **Step 4: Commit**

```powershell
Set-Location E:\agripartners
git add frontend/index.html frontend/style.css
git commit -m "feat: add frontend HTML skeleton and dark theme CSS"
```

---

## Task 3: app.js — utilities + router

**Files:**

- Create: `E:\agripartners\frontend\app.js`

- [ ] **Step 1: Create `app.js` with utilities and router**

```js
const API_BASE = 'http://localhost:3000';

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
  document.getElementById('view-list').classList.add('hidden');
  document.getElementById('view-detail').classList.add('hidden');
  document.getElementById(viewId).classList.remove('hidden');
}

function route() {
  const hash = location.hash;
  const m = hash.match(/^#deals\/(\d+)$/);
  if (m) {
    showDeal(m[1]);
  } else {
    showDeals();
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', () => {
  if (!location.hash || location.hash === '#') location.hash = '#deals';
  else route();
});

// --- Placeholder for next tasks ---
function showDeals() { showView('view-list'); document.getElementById('view-list').innerHTML = '<p class="text-slate-400">Loading...</p>'; }
function showDeal(id) { showView('view-detail'); document.getElementById('view-detail').innerHTML = `<p class="text-slate-400">Deal ${id}</p>`; }
```

- [ ] **Step 2: Check router in browser**

Open `http://localhost:5500` (serve should be running from Task 2).

- Go to `http://localhost:5500/#deals` → see "Loading..."
- Go to `http://localhost:5500/#deals/1` → see "Deal 1"
- Go to `http://localhost:5500/` → should redirect to `#deals`

- [ ] **Step 3: Check utilities in DevTools Console**

```js
yoctoToNear('1000000000000000000000000')   // → "1.00 NEAR"
yoctoToNear('2500000000000000000000000')   // → "2.50 NEAR"
yoctoToNear('0')                           // → "0.00 NEAR"
formatAddress('alice.testnet')             // → "alice.testnet"
formatAddress('abcdef1234567890abcdef1234567890abcdef12') // → "abcdef…ef12"
statusBadge('CycleActive')                 // → string with class badge-CycleActive
```

- [ ] **Step 4: Commit**

```powershell
Set-Location E:\agripartners
git add frontend/app.js
git commit -m "feat: add frontend utilities and hash router"
```

---

## Task 4: Deals list (showDeals + renderDealCard)

**Files:**

- Modify: `E:\agripartners\frontend\app.js` — replace placeholder `showDeals` with full implementation

- [ ] **Step 1: Replace `showDeals` function in app.js**

Find the line:

```js
function showDeals() { showView('view-list'); document.getElementById('view-list').innerHTML = '<p class="text-slate-400">Loading...</p>'; }
```

Replace with:

```js
async function showDeals() {
  showView('view-list');
  const el = document.getElementById('view-list');
  el.innerHTML = `
    <h1 class="text-3xl font-bold text-green-400 mb-1">AgriPartners</h1>
    <p class="text-slate-400 mb-6">Agricultural investments on NEAR Protocol</p>
    <div class="spinner"></div>
  `;
  try {
    const res = await fetch(`${API_BASE}/api/deals`);
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
```

- [ ] **Step 2: Start backend**

```powershell
Set-Location E:\agripartners\backend
npm start
```

- [ ] **Step 3: Check deals list in browser**

Open `http://localhost:5500/#deals`.

Expected results:

- "AgriPartners" heading in green
- Spinner appears for a second then disappears
- Deal cards are displayed (if DB contains deals)
- "Open →" button is green, clicking navigates to `#deals/:id`

Check empty state: temporarily change `${API_BASE}/api/deals` to a non-existent URL, verify red "Backend unavailable" banner appears, then revert.

- [ ] **Step 4: Commit**

```powershell
Set-Location E:\agripartners
git add frontend/app.js
git commit -m "feat: add deals list view with cards"
```

---

## Task 5: Deal detail — parameters + status

**Files:**

- Modify: `E:\agripartners\frontend\app.js` — replace placeholder `showDeal`, add `renderDealDetail`, `renderParams`

- [ ] **Step 1: Replace `showDeal` function in app.js**

Find the line:

```js
function showDeal(id) { showView('view-detail'); document.getElementById('view-detail').innerHTML = `<p class="text-slate-400">Deal ${id}</p>`; }
```

Replace with:

```js
async function showDeal(id) {
  showView('view-detail');
  const el = document.getElementById('view-detail');
  el.innerHTML = `
    <a href="#deals" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">← Back</a>
    <div class="spinner"></div>
  `;

  const [dealRes, statusRes, balancesRes, eventsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}`),
    fetch(`${API_BASE}/api/deals/${id}/status`),
    fetch(`${API_BASE}/api/deals/${id}/balances`),
    fetch(`${API_BASE}/api/deals/${id}/events`)
  ]);

  el.querySelector('.spinner')?.remove();

  if (dealRes.status === 'rejected' || !dealRes.value.ok) {
    const code = dealRes.value?.status;
    el.innerHTML += code === 404
      ? '<p class="text-slate-400 mt-8 text-center">Deal not found</p>'
      : `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Backend unavailable</div>`;
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
          ? '<canvas id="balances-chart" width="240" height="240"></canvas>'
          : '<p class="text-slate-500 text-sm">Balances unavailable</p>'}
      </div>
    </div>
    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">Event History</h3>
      ${renderEvents(events)}
    </div>
  `;

  if (balances) renderBalancesChart(balances);

  document.getElementById('btn-refresh').addEventListener('click', () => refreshDeal(deal.id));
}

function renderParams(deal) {
  const rows = [
    ['Farmer',           formatAddress(deal.farmer)],
    ['Investor',         formatAddress(deal.investor)],
    ['Administrator',    formatAddress(deal.admin)],
    ['Platform',         formatAddress(deal.platform)],
    ['Split',            `${deal.farmer_split_pct}% / ${deal.investor_split_pct}%`],
    ['Escrow',           `${deal.escrow_pct}%`],
    ['Performance Fee',  `${deal.performance_fee_pct}%`],
    ['Cycle duration',   `${deal.cycle_duration_days} days`],
    ['Total cycles',     deal.total_cycles],
    ['Investment',       yoctoToNear(deal.investment_amount)],
    ['Capital return',   yoctoToNear(deal.capital_return_near)],
  ];
  return rows.map(([k, v]) => `
    <div class="flex justify-between text-sm gap-2">
      <span class="text-slate-400 shrink-0">${k}</span>
      <span class="text-slate-100 font-mono text-right">${v}</span>
    </div>
  `).join('');
}

// Placeholder for next task
function renderBalancesChart(balances) {}
function renderEvents(events) { return '<p class="text-slate-500 text-sm">Loading...</p>'; }
async function refreshDeal(id) {}
```

- [ ] **Step 2: Check deal detail page in browser**

Open `http://localhost:5500/#deals`, click "Open →" on any card.

Expected results:

- "← Back" breadcrumb works (returns to list)
- Header: deal type + status badge + cycle number
- Left column: all deal parameters in a table
- Right column: "Balances unavailable" (chart function still empty)
- Events section: "Loading..."

Check `#deals/99999` → should show "Deal not found".

- [ ] **Step 3: Commit**

```powershell
Set-Location E:\agripartners
git add frontend/app.js
git commit -m "feat: add deal detail view with params and status"
```

---

## Task 6: Balances chart + events + refresh

**Files:**

- Modify: `E:\agripartners\frontend\app.js` — replace three placeholder functions

- [ ] **Step 1: Replace `renderBalancesChart` in app.js**

Find:

```js
function renderBalancesChart(balances) {}
```

Replace with:

```js
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
```

- [ ] **Step 2: Replace `renderEvents` in app.js**

Find:

```js
function renderEvents(events) { return '<p class="text-slate-500 text-sm">Loading...</p>'; }
```

Replace with:

```js
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
```

- [ ] **Step 3: Replace `refreshDeal` in app.js**

Find:

```js
async function refreshDeal(id) {}
```

Replace with:

```js
async function refreshDeal(id) {
  const btn = document.getElementById('btn-refresh');
  if (btn) { btn.disabled = true; btn.textContent = 'Refreshing...'; }

  const [statusRes, balancesRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}/status`),
    fetch(`${API_BASE}/api/deals/${id}/balances`)
  ]);

  const status = statusRes.status === 'fulfilled' && statusRes.value.ok
    ? await statusRes.value.json() : null;
  const balances = balancesRes.status === 'fulfilled' && balancesRes.value.ok
    ? await balancesRes.value.json() : null;

  if (status) {
    const badgeEl = document.getElementById('status-badge');
    const cycleEl = document.getElementById('cycle-text');
    if (badgeEl) badgeEl.innerHTML = statusBadge(status.status);
    if (cycleEl) cycleEl.textContent = `· Cycle ${status.current_cycle}`;
  }
  if (balances) renderBalancesChart(balances);

  if (btn) { btn.disabled = false; btn.textContent = 'Refresh'; }
}
```

- [ ] **Step 4: Check chart + events + refresh in browser**

Open `http://localhost:5500/#deals`, open any deal.

Expected results:

- Right column: donut chart with 4 segments (blue/green/yellow/red)
- Legend below chart: Farmer / Investor / Platform / Escrow
- If all balances = 0 (deal just created), chart may be empty — that's normal
- Event history: list with types, cycles, amounts
- Click "Refresh" → button becomes "Refreshing..." for a second, then chart updates

- [ ] **Step 5: Commit**

```powershell
Set-Location E:\agripartners
git add frontend/app.js
git commit -m "feat: add balances chart, events timeline and refresh button"
```

---

## Task 7: Final check + polish

**Files:**

- Modify (if needed): `E:\agripartners\frontend\style.css`, `E:\agripartners\frontend\app.js`

- [ ] **Step 1: Check all error scenarios**

| Scenario | How to check | Expected result |
| --- | --- | --- |
| Backend unavailable | Stop backend, open `#deals` | Red banner "Backend unavailable" |
| Deal not found | Open `#deals/99999` | "Deal not found" |
| No deals | Check empty DB or temporarily substitute URL | "No deals found" |
| Blockchain unavailable | Cannot simulate easily — skip |

- [ ] **Step 2: Check navigation**

- Open `http://localhost:5500/` → redirects to `#deals`
- Open a deal → click "← Back" → return to list
- In list click "Open →" → go to details
- Click browser Back button → return to list

- [ ] **Step 3: Check NEAR display correctness**

In DevTools Console on the page:

```js
yoctoToNear('1000000000000000000000000')  // "1.00 NEAR"
yoctoToNear('500000000000000000000000')   // "0.50 NEAR"
yoctoToNear('0')                          // "0.00 NEAR"
```

- [ ] **Step 4: Final commit**

```powershell
Set-Location E:\agripartners
git add frontend/
git status
git commit -m "feat: complete AgriPartners frontend dashboard"
```

- [ ] **Step 5: Update memory**

Save to memory that frontend is complete.

---

## How to run for demo

```powershell
# Terminal 1 — backend
Set-Location E:\agripartners\backend
npm start

# Terminal 2 — frontend
serve E:\agripartners\frontend -p 5500
```

Open: `http://localhost:5500`
