# Personal Cabinet Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add login with username/password and a personal cabinet for farmer/investor — each sees only their own deals.

**Architecture:** Backend gets a new endpoint `GET /api/me/deals` (JWT → near_account → filter by role), JWT token is extended with `near_account` field. Frontend gets a login screen (`#login`), auth-guard in the router, and a nav bar with a "Sign out" button. Auth state is stored in localStorage.

**Tech Stack:** Node.js/Express + jsonwebtoken (backend), Vanilla JS + Tailwind CSS (frontend), Jest + supertest (tests)

---

## File Map

| File | Action | What changes |
| --- | --- | --- |
| `backend/src/services/dealService.js` | Modify | Add `getDealsByUser(near_account, role)` |
| `backend/src/routes/auth.js` | Modify | `signToken` + login response include `near_account` |
| `backend/src/routes/me.js` | Create | `GET /api/me/deals` |
| `backend/src/app.js` | Modify | Mount `/api/me` router |
| `backend/tests/dealService.test.js` | Modify | Tests for `getDealsByUser` |
| `backend/tests/auth.test.js` | Modify | Test `near_account` in token |
| `backend/tests/me.test.js` | Create | Tests for `GET /api/me/deals` |
| `frontend/index.html` | Modify | Add `<div id="view-login">` |
| `frontend/app.js` | Modify | Auth state, login view, router with guard, nav bar |

---

## Task 1: dealService — add getDealsByUser

**Files:**

- Modify: `backend/src/services/dealService.js`
- Test: `backend/tests/dealService.test.js`

- [ ] **Step 1: Write failing tests for getDealsByUser**

Add to the end of `backend/tests/dealService.test.js`:

```js
const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents, getDealsByUser } =
  require('../src/services/dealService');

// ... add to end of file:

test('getDealsByUser returns farmer deals by near_account', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getDealsByUser('farmer.testnet', 'farmer');
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('WHERE farmer = $1');
  expect(params).toEqual(['farmer.testnet']);
  expect(deals).toHaveLength(1);
});

test('getDealsByUser returns investor deals by near_account', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getDealsByUser('investor.testnet', 'investor');
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('WHERE investor = $1');
  expect(params).toEqual(['investor.testnet']);
  expect(deals).toHaveLength(1);
});

test('getDealsByUser returns all deals for admin role', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getDealsByUser(null, 'admin');
  expect(pool.query).toHaveBeenCalledWith('SELECT * FROM deals ORDER BY created_at DESC');
  expect(deals).toHaveLength(1);
});

test('getDealsByUser returns all deals when near_account is not set', async () => {
  pool.query.mockResolvedValue({ rows: [] });
  await getDealsByUser(null, 'farmer');
  expect(pool.query).toHaveBeenCalledWith('SELECT * FROM deals ORDER BY created_at DESC');
});
```

- [ ] **Step 2: Run tests — verify they fail**

```powershell
cd E:\agripartners\backend
npx jest tests/dealService.test.js --no-coverage
```

Expected result: `getDealsByUser is not a function` or similar error.

- [ ] **Step 3: Update import in the first line of dealService.test.js**

Replace the first require line:

```js
// WAS:
const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents } =
  require('../src/services/dealService');

// BECOMES:
const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents, getDealsByUser } =
  require('../src/services/dealService');
```

- [ ] **Step 4: Implement getDealsByUser in dealService.js**

Add to the end of `backend/src/services/dealService.js` (before `module.exports`):

```js
async function getDealsByUser(near_account, role) {
  if (near_account && role === 'farmer') {
    const { rows } = await pool.query(
      'SELECT * FROM deals WHERE farmer = $1 ORDER BY created_at DESC',
      [near_account]
    );
    return rows;
  }
  if (near_account && role === 'investor') {
    const { rows } = await pool.query(
      'SELECT * FROM deals WHERE investor = $1 ORDER BY created_at DESC',
      [near_account]
    );
    return rows;
  }
  const { rows } = await pool.query('SELECT * FROM deals ORDER BY created_at DESC');
  return rows;
}
```

Update `module.exports`:

```js
module.exports = { getAllDeals, getDealById, createDeal, addEvent, getDealEvents, getDealsByUser };
```

- [ ] **Step 5: Run tests — verify they pass**

```powershell
npx jest tests/dealService.test.js --no-coverage
```

Expected result: all tests PASS.

- [ ] **Step 6: Commit**

```powershell
git add backend/src/services/dealService.js backend/tests/dealService.test.js
git commit -m "feat: add getDealsByUser to dealService"
```

---

## Task 2: JWT — add near_account to token

**Files:**

- Modify: `backend/src/routes/auth.js`
- Test: `backend/tests/auth.test.js`

- [ ] **Step 1: Write failing tests**

Add to the end of `backend/tests/auth.test.js`:

```js
test('POST /api/auth/login token contains near_account', async () => {
  userService.findByUsername.mockResolvedValue({ ...mockUser, near_account: 'farmer.testnet' });
  userService.verifyPassword.mockResolvedValue(true);

  const res = await request(app).post('/api/auth/login').send({ username: 'farmer1', password: 'pass' });
  expect(res.status).toBe(200);
  const decoded = jwt.verify(res.body.token, 'test-jwt-secret');
  expect(decoded.near_account).toBe('farmer.testnet');
  expect(res.body.user.near_account).toBe('farmer.testnet');
});

test('POST /api/auth/login near_account is null when not set', async () => {
  userService.findByUsername.mockResolvedValue(mockUser); // mockUser without near_account
  userService.verifyPassword.mockResolvedValue(true);

  const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Admin123!' });
  expect(res.status).toBe(200);
  const decoded = jwt.verify(res.body.token, 'test-jwt-secret');
  expect(decoded.near_account).toBeNull();
  expect(res.body.user.near_account).toBeNull();
});
```

- [ ] **Step 2: Run tests — verify they fail**

```powershell
npx jest tests/auth.test.js --no-coverage
```

Expected result: 2 new tests FAIL (near_account not in token).

- [ ] **Step 3: Update signToken and login response in auth.js**

Change the `signToken` function in `backend/src/routes/auth.js`:

```js
// WAS:
function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// BECOMES:
function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, near_account: user.near_account || null },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
```

Change the login response in the same file:

```js
// WAS:
res.json({ token: signToken(user), user: { id: user.id, username: user.username, role: user.role } });

// BECOMES:
res.json({
  token: signToken(user),
  user: { id: user.id, username: user.username, role: user.role, near_account: user.near_account || null }
});
```

- [ ] **Step 4: Run all auth tests**

```powershell
npx jest tests/auth.test.js --no-coverage
```

Expected result: all tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add backend/src/routes/auth.js backend/tests/auth.test.js
git commit -m "feat: add near_account to JWT payload and login response"
```

---

## Task 3: Backend — /api/me/deals route

**Files:**

- Create: `backend/src/routes/me.js`
- Create: `backend/tests/me.test.js`

- [ ] **Step 1: Write tests**

Create `backend/tests/me.test.js`:

```js
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.API_KEY = 'test-api-key';
process.env.NEAR_ADMIN_ACCOUNT = 'admin.testnet';
process.env.NEAR_ADMIN_PRIVATE_KEY = 'ed25519:test';

jest.mock('../src/services/dealService');
jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { requireJWT } = require('../src/middleware/jwtAuth');
const meRouter = require('../src/routes/me');
const dealService = require('../src/services/dealService');

const app = express();
app.use(express.json());
app.use('/api/me', requireJWT, meRouter);

const farmerToken = jwt.sign(
  { id: 2, username: 'farmer1', role: 'farmer', near_account: 'farmer.testnet' },
  'test-jwt-secret'
);
const investorToken = jwt.sign(
  { id: 3, username: 'inv1', role: 'investor', near_account: 'investor.testnet' },
  'test-jwt-secret'
);
const adminToken = jwt.sign(
  { id: 1, username: 'admin', role: 'admin', near_account: null },
  'test-jwt-secret'
);

const mockDeals = [
  { id: 1, farmer: 'farmer.testnet', investor: 'investor.testnet', deal_type: 'fidlot' }
];

beforeEach(() => jest.clearAllMocks());

test('GET /api/me/deals returns 401 without token', async () => {
  const res = await request(app).get('/api/me/deals');
  expect(res.status).toBe(401);
});

test('GET /api/me/deals returns 401 for invalid token', async () => {
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', 'Bearer invalid.token.here');
  expect(res.status).toBe(401);
});

test('GET /api/me/deals returns farmer deals', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${farmerToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith('farmer.testnet', 'farmer');
  expect(res.body).toHaveLength(1);
  expect(res.body[0].id).toBe(1);
});

test('GET /api/me/deals calls getDealsByUser with investor near_account', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${investorToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith('investor.testnet', 'investor');
});

test('GET /api/me/deals calls getDealsByUser with null for admin', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith(null, 'admin');
});

test('GET /api/me/deals returns 500 on DB error', async () => {
  dealService.getDealsByUser.mockRejectedValue(new Error('DB error'));
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${farmerToken}`);
  expect(res.status).toBe(500);
  expect(res.body.error).toBe('DB error');
});
```

- [ ] **Step 2: Run tests — verify they fail**

```powershell
npx jest tests/me.test.js --no-coverage
```

Expected result: `Cannot find module '../src/routes/me'`.

- [ ] **Step 3: Create me.js router**

Create file `backend/src/routes/me.js`:

```js
const router = require('express').Router();
const dealService = require('../services/dealService');

router.get('/deals', async (req, res) => {
  try {
    const { near_account, role } = req.user;
    const deals = await dealService.getDealsByUser(near_account, role);
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 4: Run tests**

```powershell
npx jest tests/me.test.js --no-coverage
```

Expected result: all 6 tests PASS.

- [ ] **Step 5: Commit**

```powershell
git add backend/src/routes/me.js backend/tests/me.test.js
git commit -m "feat: add GET /api/me/deals endpoint"
```

---

## Task 4: Backend — mount /api/me in app.js

**Files:**

- Modify: `backend/src/app.js`

- [ ] **Step 1: Add meRouter to app.js**

Modify `backend/src/app.js`:

```js
// ADD to imports (after adminRouter):
const meRouter = require('./routes/me');

// ADD after the /api/admin line:
app.use('/api/me', requireJWT, meRouter);
```

Full file after edit:

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/index');
const { requireJWT, requireRole } = require('./middleware/jwtAuth');
const authRouter = require('./routes/auth');
const dealsRouter = require('./routes/deals');
const adminRouter = require('./routes/admin');
const meRouter = require('./routes/me');

['API_KEY', 'NEAR_ADMIN_ACCOUNT', 'NEAR_ADMIN_PRIVATE_KEY', 'JWT_SECRET'].forEach(k => {
  if (!process.env[k]) throw new Error(`Missing required env var: ${k}`);
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/admin', requireJWT, requireRole('admin'), adminRouter);
app.use('/api/me', requireJWT, meRouter);

module.exports = app;
```

- [ ] **Step 2: Run all tests**

```powershell
npx jest --no-coverage
```

Expected result: all tests PASS (was 38 + added ~10 new = ~48).

- [ ] **Step 3: Commit**

```powershell
git add backend/src/app.js
git commit -m "feat: mount /api/me router in app"
```

---

## Task 5: Frontend — auth state + login screen

**Files:**

- Modify: `frontend/index.html`
- Modify: `frontend/app.js`

- [ ] **Step 1: Add view-login to index.html**

Modify `frontend/index.html` — add div after `view-detail`:

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
  <div id="view-login" class="hidden max-w-md mx-auto px-4 py-8"></div>
  <div id="view-list"  class="hidden max-w-4xl mx-auto px-4 py-8"></div>
  <div id="view-detail" class="hidden max-w-4xl mx-auto px-4 py-8"></div>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Add auth utilities to beginning of app.js**

Insert immediately after the `const API_BASE = '...'` line:

```js
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
```

- [ ] **Step 3: Add showLogin and handleLogin to app.js**

Insert before the `// --- Deals list ---` section:

```js
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
        <input id="login-password" type="password" autocomplete="current-password"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
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
    location.hash = '#deals';
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
```

- [ ] **Step 4: Update showView to support view-login**

Replace the `showView` function in app.js:

```js
// WAS:
function showView(viewId) {
  document.getElementById('view-list').classList.add('hidden');
  document.getElementById('view-detail').classList.add('hidden');
  document.getElementById(viewId).classList.remove('hidden');
}

// BECOMES:
function showView(viewId) {
  ['view-login', 'view-list', 'view-detail'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(viewId).classList.remove('hidden');
}
```

- [ ] **Step 5: Add renderNav to app.js**

Insert after the `logout()` function:

```js
// --- Nav bar ---

function renderNav() {
  const auth = getAuth();
  if (!auth) return '';
  const labels = { farmer: 'Farmer', investor: 'Investor', admin: 'Administrator' };
  const roleLabel = labels[auth.user.role] || auth.user.role;
  return `
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
      <span class="text-sm text-slate-400">${roleLabel}: <span class="text-slate-200 font-medium">${auth.user.username}</span></span>
      <button onclick="logout()" class="text-sm text-slate-400 hover:text-red-400 transition">Sign out →</button>
    </div>
  `;
}
```

- [ ] **Step 6: Update router with auth-guard**

Replace the `route` function in app.js:

```js
// WAS:
function route() {
  const hash = location.hash;
  const m = hash.match(/^#deals\/(\d+)$/);
  if (m) {
    showDeal(m[1]);
  } else {
    showDeals();
  }
}

// BECOMES:
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

  const m = hash.match(/^#deals\/(\d+)$/);
  if (m) {
    showDeal(m[1]);
  } else {
    showDeals();
  }
}
```

Update the load handler (at the end of app.js):

```js
// WAS:
window.addEventListener('load', () => {
  if (!location.hash || location.hash === '#') location.hash = '#deals';
  else route();
});

// BECOMES:
window.addEventListener('load', () => {
  if (!location.hash || location.hash === '#') {
    location.hash = getAuth() ? '#deals' : '#login';
  } else {
    route();
  }
});
```

- [ ] **Step 7: Manually verify — login screen**

Open `frontend/index.html` via `serve E:\agripartners\frontend -p 5500` and go to <http://localhost:5500>. Should show login screen.

Enter wrong credentials — should show error. Enter correct ones (admin / Demo2024!) — should open `#deals`.

- [ ] **Step 8: Commit**

```powershell
cd E:\agripartners
git add frontend/index.html frontend/app.js
git commit -m "feat: add login screen and auth state to frontend"
```

---

## Task 6: Frontend — personal cabinet (showDeals + nav)

**Files:**

- Modify: `frontend/app.js`

- [ ] **Step 1: Update showDeals — use /api/me/deals**

Replace the `showDeals` function in app.js:

```js
async function showDeals() {
  showView('view-list');
  const el = document.getElementById('view-list');
  el.innerHTML = `
    ${renderNav()}
    <h1 class="text-3xl font-bold text-green-400 mb-1">AgriPartners</h1>
    <p class="text-slate-400 mb-6">Agricultural investments on NEAR Protocol</p>
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
```

- [ ] **Step 2: Manually verify**

Log in as admin — list should load. At the top should be the line `Administrator: admin | Sign out →`.

Click "Sign out" — should return to login screen. After page refresh — login screen again.

- [ ] **Step 3: Commit**

```powershell
git add frontend/app.js
git commit -m "feat: showDeals uses /api/me/deals with auth headers and nav bar"
```

---

## Task 7: Frontend — auth in deal detail

**Files:**

- Modify: `frontend/app.js`

- [ ] **Step 1: Update showDeal — add nav and auth headers**

Replace the beginning of `showDeal` function (only loading state — before `Promise.allSettled`):

```js
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

  // ... rest unchanged
```

- [ ] **Step 2: Update renderDealDetail — add nav**

Replace the beginning of `el.innerHTML` in `renderDealDetail`:

```js
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
```

- [ ] **Step 3: Final manual check**

1. Open <http://localhost:5500> — should show login screen
2. Log in as admin (admin / Demo2024!) — deals list opened with nav bar
3. Click on a deal — detail page opened with nav bar
4. Click "← Back" — returned to list
5. Click "Sign out →" — returned to login screen
6. Refresh page — login screen again (localStorage cleared)
7. Log in again → go to <http://localhost:5500/#deals> — list opened without re-login

- [ ] **Step 4: Run all backend tests finally**

```powershell
cd E:\agripartners\backend
npx jest --no-coverage
```

Expected result: all tests PASS.

- [ ] **Step 5: Final commit**

```powershell
cd E:\agripartners
git add frontend/app.js
git commit -m "feat: add nav bar and auth headers to deal detail view"
```

---

## Self-Review

**Spec coverage:**

- ✅ Login required — router with auth-guard, redirect to #login
- ✅ View only — no withdraw button added
- ✅ Same view for farmer and investor — renderDealCard/renderDealDetail unchanged
- ✅ Extend existing app.js — no new frontend files created
- ✅ Routes: #login, #deals (own), #deals/:id
- ✅ Auth state: localStorage ap_auth { token, user }
- ✅ GET /api/me/deals with JWT and role filter
- ✅ near_account in JWT payload

**Type and name check:**

- `getDealsByUser(near_account, role)` — consistent across dealService.js, me.js and tests
- `authHeaders()` — used in showDeals and showDeal
- `renderNav()` — used in showDeals, showDeal loading state and renderDealDetail
- `getAuth()`, `setAuth()`, `clearAuth()` — consistent everywhere

**Placeholders:** none — all code is complete.
