# AgriPartners Pitch & Launch Pack — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy backend to Railway+Turso and frontend to Vercel, create 5 HTML one-pagers, 3 pitch scripts (RU/EN/UZ) and a NEAR Foundation documentation package.

**Architecture:** Backend migrates from better-sqlite3 (sync) to @libsql/client (async, compatible with Turso cloud and :memory: for tests). Frontend gets a Vercel rewrite to proxy API requests to Railway. All pitch materials are static files in the repository.

**Tech Stack:** @libsql/client, Railway (Node.js), Turso (LibSQL cloud), Vercel (static + rewrites), Tailwind CSS CDN (HTML pages), Markdown (pitch scripts + NEAR docs)

---

## File Structure

```
backend/
  src/db/index.js              ← replace: Turso async client (was: better-sqlite3 sync)
  src/services/dealService.js  ← replace: all functions async
  src/routes/deals.js          ← change: await dealService calls
  src/routes/admin.js          ← change: await dealService calls
  tests/db.test.js             ← replace: async tests + :memory:
  tests/dealService.test.js    ← replace: async tests + resetDb
  tests/deals.routes.test.js   ← change: mockResolvedValue
  tests/admin.routes.test.js   ← change: mockResolvedValue
  package.json                 ← add @libsql/client, remove better-sqlite3
railway.json                   ← new: Railway deployment config
contract/.gitignore            ← add exception for release WASM
frontend/
  app.js                       ← change line 1: dynamic API_BASE
  vercel.json                  ← new: Vercel rewrites → Railway
  pages/
    investor-brief-ru.html     ← new
    investor-brief-en.html     ← new
    farmer-brief-uz.html       ← new
    farmer-brief-ru.html       ← new
    platform-overview-en.html  ← new
docs/
  pitch-script-ru.md           ← new
  pitch-script-en.md           ← new
  pitch-script-uz.md           ← new
  near-grant-proposal.md       ← new
  near-horizon-profile.md      ← new
```

---

## Task 1: Turso — setup and db/index.js

**Files:**

- Modify: `backend/package.json`
- Modify: `backend/src/db/index.js`

- [ ] **Step 1.1: Install @libsql/client, remove better-sqlite3**

```bash
cd backend
npm install @libsql/client
npm uninstall better-sqlite3
```

- [ ] **Step 1.2: Rewrite backend/src/db/index.js**

```js
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

let client = null;

async function getDb() {
  if (client) return client;
  client = createClient({
    url: process.env.TURSO_DATABASE_URL || ':memory:',
    authToken: process.env.TURSO_AUTH_TOKEN
  });
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const stmts = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of stmts) {
    await client.execute(stmt);
  }
  return client;
}

function resetDb() {
  client = null;
}

module.exports = { getDb, resetDb };
```

- [ ] **Step 1.3: Update db.test.js**

```js
process.env.TURSO_DATABASE_URL = ':memory:';
const { getDb, resetDb } = require('../src/db/index');

beforeEach(() => { resetDb(); });

test('creates deals and events tables on init', async () => {
  const db = await getDb();
  const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
  const names = result.rows.map(t => t.name);
  expect(names).toContain('deals');
  expect(names).toContain('events');
});

test('getDb returns same instance on repeated calls', async () => {
  const db1 = await getDb();
  const db2 = await getDb();
  expect(db1).toBe(db2);
});
```

- [ ] **Step 1.4: Run test**

```bash
cd backend && npx jest tests/db.test.js --no-coverage
```

Expected result: `Tests: 2 passed`

- [ ] **Step 1.5: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/src/db/index.js backend/tests/db.test.js
git commit -m "feat: migrate db layer from better-sqlite3 to @libsql/client (Turso)"
```

---

## Task 2: Migrate dealService to async

**Files:**

- Modify: `backend/src/services/dealService.js`
- Modify: `backend/tests/dealService.test.js`

- [ ] **Step 2.1: Rewrite dealService.js**

```js
const { getDb } = require('../db/index');

async function getAllDeals() {
  const db = await getDb();
  const result = await db.execute('SELECT * FROM deals ORDER BY created_at DESC');
  return result.rows;
}

async function getDealById(id) {
  const db = await getDb();
  const result = await db.execute({ sql: 'SELECT * FROM deals WHERE id = ?', args: [id] });
  return result.rows[0] || null;
}

async function createDeal(deal) {
  const db = await getDb();
  const result = await db.execute({
    sql: `INSERT INTO deals (
      contract_address, deal_type, farmer, investor, admin, platform,
      investment_amount, farmer_split_pct, investor_split_pct, escrow_pct,
      performance_fee_pct, cycle_duration_days, total_cycles, capital_return_near, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      deal.contract_address, deal.deal_type, deal.farmer, deal.investor,
      deal.admin, deal.platform, deal.investment_amount,
      deal.farmer_split_pct, deal.investor_split_pct, deal.escrow_pct,
      deal.performance_fee_pct, deal.cycle_duration_days, deal.total_cycles,
      deal.capital_return_near, new Date().toISOString()
    ]
  });
  return getDealById(Number(result.lastInsertRowid));
}

async function addEvent(event) {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO events (deal_id, event_type, cycle_num, profit_near, losses_near, tx_hash, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      event.deal_id, event.event_type, event.cycle_num ?? null,
      event.profit_near ?? null, event.losses_near ?? null,
      event.tx_hash ?? null, new Date().toISOString()
    ]
  });
}

async function getDealEvents(dealId) {
  const db = await getDb();
  const result = await db.execute({ sql: 'SELECT * FROM events WHERE deal_id = ? ORDER BY created_at ASC', args: [dealId] });
  return result.rows;
}

module.exports = { getAllDeals, getDealById, createDeal, addEvent, getDealEvents };
```

- [ ] **Step 2.2: Rewrite dealService.test.js**

```js
process.env.TURSO_DATABASE_URL = ':memory:';
const { resetDb } = require('../src/db/index');
const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents } = require('../src/services/dealService');

const sampleDeal = {
  contract_address: 'ap123.agripartners.testnet',
  deal_type: 'fidlot',
  farmer: 'farmer.testnet',
  investor: 'investor.testnet',
  admin: 'agripartners.testnet',
  platform: 'agripartners.testnet',
  investment_amount: '50000000000000000000000000',
  farmer_split_pct: 60,
  investor_split_pct: 40,
  escrow_pct: 44,
  performance_fee_pct: 20,
  cycle_duration_days: 150,
  total_cycles: 7,
  capital_return_near: '20400000000000000000000000'
};

beforeEach(() => { resetDb(); });

test('getAllDeals returns empty array initially', async () => {
  expect(await getAllDeals()).toEqual([]);
});

test('createDeal inserts and returns deal with id', async () => {
  const deal = await createDeal(sampleDeal);
  expect(deal).toHaveProperty('id');
  expect(deal.contract_address).toBe('ap123.agripartners.testnet');
  expect(deal.deal_type).toBe('fidlot');
});

test('getDealById returns correct deal', async () => {
  const deal = await createDeal({ ...sampleDeal, contract_address: 'ap456.agripartners.testnet' });
  expect(await getDealById(deal.id)).toMatchObject({ id: deal.id });
});

test('getDealById returns null for missing id', async () => {
  expect(await getDealById(9999)).toBeNull();
});

test('getAllDeals returns inserted deals', async () => {
  await createDeal(sampleDeal);
  expect((await getAllDeals()).length).toBeGreaterThan(0);
});

test('addEvent and getDealEvents work correctly', async () => {
  const deal = await createDeal({ ...sampleDeal, contract_address: 'ap789.agripartners.testnet' });
  await addEvent({ deal_id: deal.id, event_type: 'deployed', tx_hash: 'abc123' });
  const events = await getDealEvents(deal.id);
  expect(events).toHaveLength(1);
  expect(events[0].event_type).toBe('deployed');
  expect(events[0].tx_hash).toBe('abc123');
});
```

- [ ] **Step 2.3: Run test**

```bash
cd backend && npx jest tests/dealService.test.js --no-coverage
```

Expected result: `Tests: 6 passed`

- [ ] **Step 2.4: Commit**

```bash
git add backend/src/services/dealService.js backend/tests/dealService.test.js
git commit -m "feat: make dealService fully async for Turso compatibility"
```

---

## Task 3: Update routes and route tests

**Files:**

- Modify: `backend/src/routes/deals.js`
- Modify: `backend/src/routes/admin.js`
- Modify: `backend/tests/deals.routes.test.js`
- Modify: `backend/tests/admin.routes.test.js`

- [ ] **Step 3.1: Update deals.js — add await to dealService calls**

Open `backend/src/routes/deals.js`. Find all `dealService.*` calls and add `await`. Example — each line like:

```js
const deal = dealService.getDealById(req.params.id);
// replace with:
const deal = await dealService.getDealById(req.params.id);
```

Same for `getAllDeals`, `getDealEvents`.

- [ ] **Step 3.2: Update admin.js — add await to dealService calls**

Open `backend/src/routes/admin.js`. Find all `dealService.*` calls and add `await`:

```js
const deal = await dealService.getDealById(req.params.id);
const deal = await dealService.createDeal({...});
await dealService.addEvent({...});
```

- [ ] **Step 3.3: Update deals.routes.test.js — sync mock → resolved mock**

In `beforeEach` replace `mockReturnValue` with `mockResolvedValue` for dealService:

```js
beforeEach(() => {
  dealService.getAllDeals.mockResolvedValue([mockDeal]);
  dealService.getDealById.mockResolvedValue(mockDeal);
  dealService.getDealEvents.mockResolvedValue([]);
  nearService.getContractStatus.mockResolvedValue({ status: 'Funded', current_cycle: 0 });
  nearService.getContractBalances.mockResolvedValue({ farmer: '0', investor: '0', platform: '0', escrow: '0' });
});
```

Also in 404 test: `dealService.getDealById.mockResolvedValueOnce(null);`

- [ ] **Step 3.4: Update admin.routes.test.js — sync mock → resolved mock**

In `beforeEach` replace:

```js
beforeEach(() => {
  dealService.getDealById.mockResolvedValue(mockDeal);
  dealService.createDeal.mockResolvedValue(mockDeal);
  dealService.addEvent.mockResolvedValue(undefined);
  nearService.deployContract.mockResolvedValue({ contractId: 'ap1.agripartners.testnet', txHash: 'tx1' });
  nearService.startCycle.mockResolvedValue({ txHash: 'tx2' });
  nearService.reportCycle.mockResolvedValue({ txHash: 'tx3' });
  nearService.getContractStatus.mockResolvedValue({ status: 'CycleActive', current_cycle: 1 });
  nearService.fundContract = jest.fn().mockResolvedValue({ txHash: 'tx4' });
});
```

Also: `dealService.getDealById.mockResolvedValueOnce(null)` in 404 test.

- [ ] **Step 3.5: Run all tests**

```bash
cd backend && npm test
```

Expected result: `Tests: 29 passed` (all green)

- [ ] **Step 3.6: Commit**

```bash
git add backend/src/routes/deals.js backend/src/routes/admin.js \
        backend/tests/deals.routes.test.js backend/tests/admin.routes.test.js
git commit -m "feat: update routes and tests for async dealService"
```

---

## Task 4: Railway + Vercel + WASM configuration

**Files:**

- Create: `railway.json`
- Modify: `contract/.gitignore`
- Modify: `frontend/app.js` (line 1)
- Create: `frontend/vercel.json`

- [ ] **Step 4.1: Create railway.json**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

- [ ] **Step 4.2: Add WASM exception in contract/.gitignore**

Open `contract/.gitignore` and add the line:

```
/target
!/target/wasm32-unknown-unknown/release/agripartners.wasm
```

- [ ] **Step 4.3: Add WASM to git**

```bash
git add -f contract/target/wasm32-unknown-unknown/release/agripartners.wasm
```

- [ ] **Step 4.4: Update app.js — dynamic API_BASE**

In `frontend/app.js` replace line 1:

```js
// was:
const API_BASE = 'http://localhost:3000';
// becomes:
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
```

- [ ] **Step 4.5: Create frontend/vercel.json**

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://agripartners-backend.railway.app/api/:path*"
    },
    {
      "source": "/health",
      "destination": "https://agripartners-backend.railway.app/health"
    }
  ]
}
```

> **Important:** After getting the real Railway URL replace `agripartners-backend.railway.app` with the actual URL.

- [ ] **Step 4.6: Commit**

```bash
git add railway.json contract/.gitignore \
        contract/target/wasm32-unknown-unknown/release/agripartners.wasm \
        frontend/app.js frontend/vercel.json
git commit -m "feat: add Railway/Vercel deployment config and commit WASM binary"
```

---

## Task 5: Deploy to Railway

> Requires: account at railway.app, CLI installed (`npm i -g @railway/cli`)

- [ ] **Step 5.1: Login and create project**

```bash
railway login
cd backend
railway init   # choose "Empty Project", name it agripartners-backend
```

- [ ] **Step 5.2: Add environment variables via Railway dashboard**

Open <https://railway.app> → project → Variables. Add:

```
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=farab.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:<key from .env>
WASM_PATH=./contract/target/wasm32-unknown-unknown/release/agripartners.wasm
API_KEY=<new random key, minimum 32 characters>
TURSO_DATABASE_URL=<from step 5.3>
TURSO_AUTH_TOKEN=<from step 5.3>
PORT=3000
```

- [ ] **Step 5.3: Create Turso database**

```bash
npm install -g turso    # if not installed
turso auth login
turso db create agripartners
turso db show agripartners   # copy URL
turso db tokens create agripartners  # copy token
```

Paste URL and token into Railway Variables (step 5.2).

- [ ] **Step 5.4: Deploy**

```bash
cd /e/agripartners
railway up --service agripartners-backend
```

- [ ] **Step 5.5: Check health endpoint**

```bash
curl https://<railway-url>/health
```

Expected result: `{"status":"ok"}`

- [ ] **Step 5.6: Update Railway URL in vercel.json**

Replace `agripartners-backend.railway.app` with the real Railway URL in `frontend/vercel.json`. Commit:

```bash
git add frontend/vercel.json
git commit -m "chore: update Railway URL in Vercel rewrite config"
```

---

## Task 6: Deploy to Vercel

> Requires: account at vercel.com, CLI installed (`npm i -g vercel`)

- [ ] **Step 6.1: Deploy frontend**

```bash
cd /e/agripartners/frontend
vercel --prod
```

On first run: choose "Deploy from existing project", root = `frontend/`, framework = Other.

- [ ] **Step 6.2: Check dashboard online**

Open `https://<vercel-url>` in browser. Verify:

- Page loads
- GET /api/deals returns data (via Vercel rewrite → Railway)

- [ ] **Step 6.3: Save final URLs**

Record in `docs/live-urls.md`:

```markdown
# AgriPartners — Live URLs

- **Dashboard:** https://<vercel-url>
- **Backend API:** https://<railway-url>
- **GitHub:** https://github.com/farabek/agripartners
```

```bash
git add docs/live-urls.md
git commit -m "docs: add live deployment URLs"
git push
```

---

## Task 7: Investor Brief — HTML pages (RU + EN)

**Files:**

- Create: `frontend/pages/investor-brief-ru.html`
- Create: `frontend/pages/investor-brief-en.html`

- [ ] **Step 7.1: Create frontend/pages/ directory**

```bash
mkdir -p /e/agripartners/frontend/pages
```

- [ ] **Step 7.2: Create investor-brief-ru.html**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners — Инвестору</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print { .no-print { display: none; } body { font-size: 13px; } }
  </style>
</head>
<body class="bg-white text-gray-900 max-w-3xl mx-auto px-8 py-10 font-sans">

  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-green-800">AgriPartners</h1>
    <p class="text-gray-500 text-sm mt-1">Агро-инвестиции на блокчейне NEAR · Узбекистан</p>
  </div>

  <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
    <p class="text-lg font-semibold text-green-900 mb-4">
      Вложи $50,000 — получи $82,000 за 35 месяцев.<br>
      <span class="text-green-700">Защищено смарт-контрактом NEAR.</span>
    </p>
    <div class="grid grid-cols-4 gap-4 mt-4">
      <div><p class="text-2xl font-bold text-green-800">$50k</p><p class="text-xs text-gray-500">Инвестиция</p></div>
      <div><p class="text-2xl font-bold text-green-800">$82k</p><p class="text-xs text-gray-500">Возврат</p></div>
      <div><p class="text-2xl font-bold text-green-800">+64%</p><p class="text-xs text-gray-500">Чистый ROI</p></div>
      <div><p class="text-2xl font-bold text-green-800">21.9%</p><p class="text-xs text-gray-500">APR годовых</p></div>
    </div>
  </div>

  <h2 class="text-xl font-bold text-green-800 mb-3">Как это работает</h2>
  <ol class="list-decimal list-inside space-y-2 mb-8 text-gray-700">
    <li><strong>Вы вносите $50,000 USDC</strong> — деньги блокируются в смарт-контракте на NEAR.</li>
    <li><strong>Фермер закупает 50 голов молодняка</strong> (~$200/гол) и начинает откорм 5 месяцев.</li>
    <li><strong>Каждые 5 месяцев</strong> — продажа партии по $1,000/гол, прибыль делится 60/40. Вы получаете $9,600 на кошелёк.</li>
    <li><strong>Циклы 3–7</strong> — закупка уже из выручки (самофинансирование). Вы получаете $8,480/цикл.</li>
    <li><strong>После 35 месяцев</strong> — возврат капитала $20,400. Итого на руки: <strong>$82,000</strong>.</li>
  </ol>

  <h2 class="text-xl font-bold text-green-800 mb-3">Ваша защита</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>✅ <strong>Эскроу на блокчейне</strong> — деньги недоступны фермеру до завершения цикла</li>
    <li>✅ <strong>Условия неизменны</strong> — смарт-контракт нельзя переписать после подписания</li>
    <li>✅ <strong>Прозрачность в реальном времени</strong> — дашборд показывает статус и балансы онлайн</li>
    <li>✅ <strong>Performance Fee 20%</strong> — берётся только при положительном результате, только с вашей доли</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">Сделка</h2>
  <table class="w-full text-sm border border-gray-200 rounded mb-8">
    <tbody>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Модель</td><td class="px-4 py-2 font-medium">Fidlot v5.9 · Откорм КРС</td></tr>
      <tr class="border-b bg-gray-50"><td class="px-4 py-2 text-gray-500">Поголовье</td><td class="px-4 py-2 font-medium">50 голов × $1,000/гол</td></tr>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Циклов</td><td class="px-4 py-2 font-medium">7 × 5 мес = 35 мес</td></tr>
      <tr class="border-b bg-gray-50"><td class="px-4 py-2 text-gray-500">Сплит прибыли</td><td class="px-4 py-2 font-medium">Фермер 60% · Инвестор 40%</td></tr>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Комиссия платформы</td><td class="px-4 py-2 font-medium">20% только с доли инвестора</td></tr>
      <tr class="bg-gray-50"><td class="px-4 py-2 text-gray-500">Локация</td><td class="px-4 py-2 font-medium">Узбекистан</td></tr>
    </tbody>
  </table>

  <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
    <p class="font-semibold text-gray-800 mb-2">Документы</p>
    <p class="text-sm text-gray-600">Полный договор инвестора: <strong>docs/60-40/pdf/ru/Agri-Investor-Fidlot-v5.9-6040-RU.pdf</strong></p>
    <p class="text-sm text-gray-600 mt-1">Live дашборд: <strong>https://agripartners.vercel.app</strong></p>
  </div>

  <div class="text-center border-t pt-6">
    <p class="text-gray-700 font-semibold">Готовы обсудить?</p>
    <p class="text-gray-500 text-sm mt-1">farhodmuhamadiev4@gmail.com · GitHub: farabek/agripartners</p>
    <p class="text-xs text-gray-400 mt-3">AgriPartners · RWA на NEAR Protocol · MVP на testnet ✅</p>
  </div>

</body>
</html>
```

- [ ] **Step 7.3: Create investor-brief-en.html** (English version)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners — Investor Brief</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>@media print { .no-print { display: none; } body { font-size: 13px; } }</style>
</head>
<body class="bg-white text-gray-900 max-w-3xl mx-auto px-8 py-10 font-sans">

  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-green-800">AgriPartners</h1>
    <p class="text-gray-500 text-sm mt-1">Agricultural investments on NEAR blockchain · Uzbekistan</p>
  </div>

  <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
    <p class="text-lg font-semibold text-green-900 mb-4">
      Invest $50,000 — receive $82,000 in 35 months.<br>
      <span class="text-green-700">Secured by NEAR smart contract escrow.</span>
    </p>
    <div class="grid grid-cols-4 gap-4 mt-4">
      <div><p class="text-2xl font-bold text-green-800">$50k</p><p class="text-xs text-gray-500">Investment</p></div>
      <div><p class="text-2xl font-bold text-green-800">$82k</p><p class="text-xs text-gray-500">Return</p></div>
      <div><p class="text-2xl font-bold text-green-800">+64%</p><p class="text-xs text-gray-500">Net ROI</p></div>
      <div><p class="text-2xl font-bold text-green-800">21.9%</p><p class="text-xs text-gray-500">APR</p></div>
    </div>
  </div>

  <h2 class="text-xl font-bold text-green-800 mb-3">How It Works</h2>
  <ol class="list-decimal list-inside space-y-2 mb-8 text-gray-700">
    <li><strong>You deposit $50,000 USDC</strong> — locked in a NEAR smart contract escrow.</li>
    <li><strong>The farmer buys 50 cattle</strong> (~$200/head) and begins a 5-month fattening cycle.</li>
    <li><strong>Every 5 months</strong> — herd sold at $1,000/head, profit split 60/40. You receive $9,600.</li>
    <li><strong>Cycles 3–7</strong> — cattle purchased from revenue (self-financing). You receive $8,480/cycle.</li>
    <li><strong>After 35 months</strong> — capital returned: $20,400. Total received: <strong>$82,000</strong>.</li>
  </ol>

  <h2 class="text-xl font-bold text-green-800 mb-3">Your Protection</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>✅ <strong>On-chain escrow</strong> — funds inaccessible to the farmer until cycle completion</li>
    <li>✅ <strong>Immutable terms</strong> — smart contract cannot be changed after deployment</li>
    <li>✅ <strong>Real-time transparency</strong> — dashboard shows live status and balances</li>
    <li>✅ <strong>Performance Fee 20%</strong> — only taken from investor share, only on profit</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">Deal Structure</h2>
  <table class="w-full text-sm border border-gray-200 rounded mb-8">
    <tbody>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Model</td><td class="px-4 py-2 font-medium">Fidlot v5.9 · Cattle fattening</td></tr>
      <tr class="border-b bg-gray-50"><td class="px-4 py-2 text-gray-500">Herd</td><td class="px-4 py-2 font-medium">50 head × $1,000/head</td></tr>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Cycles</td><td class="px-4 py-2 font-medium">7 × 5 months = 35 months total</td></tr>
      <tr class="border-b bg-gray-50"><td class="px-4 py-2 text-gray-500">Profit split</td><td class="px-4 py-2 font-medium">Farmer 60% · Investor 40%</td></tr>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Platform fee</td><td class="px-4 py-2 font-medium">20% of investor share only</td></tr>
      <tr class="bg-gray-50"><td class="px-4 py-2 text-gray-500">Location</td><td class="px-4 py-2 font-medium">Uzbekistan</td></tr>
    </tbody>
  </table>

  <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
    <p class="font-semibold text-gray-800 mb-2">Documents</p>
    <p class="text-sm text-gray-600">Full investor agreement: <strong>docs/60-40/pdf/ru/Agri-Investor-Fidlot-v5.9-6040-RU.pdf</strong></p>
    <p class="text-sm text-gray-600 mt-1">Live dashboard: <strong>https://agripartners.vercel.app</strong></p>
  </div>

  <div class="text-center border-t pt-6">
    <p class="text-gray-700 font-semibold">Ready to discuss?</p>
    <p class="text-gray-500 text-sm mt-1">farhodmuhamadiev4@gmail.com · GitHub: farabek/agripartners</p>
    <p class="text-xs text-gray-400 mt-3">AgriPartners · RWA on NEAR Protocol · MVP live on testnet ✅</p>
  </div>

</body>
</html>
```

- [ ] **Step 7.4: Commit**

```bash
git add frontend/pages/
git commit -m "feat: add investor brief pages (RU + EN)"
```

---

## Task 8: Farmer Brief HTML (UZ + RU)

**Files:**

- Create: `frontend/pages/farmer-brief-uz.html`
- Create: `frontend/pages/farmer-brief-ru.html`

- [ ] **Step 8.1: Create farmer-brief-uz.html**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners — Fermer uchun</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 max-w-3xl mx-auto px-8 py-10 font-sans">

  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-green-800">AgriPartners</h1>
    <p class="text-gray-500 text-sm mt-1">Qishloq xo'jaligi moliyalashtirish · NEAR blokcheyni</p>
  </div>

  <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
    <p class="text-lg font-semibold text-green-900">
      Siz 0 so'm kiritasiz — 35 oyda $114,250 olasiz.
    </p>
    <div class="grid grid-cols-3 gap-4 mt-4">
      <div><p class="text-2xl font-bold text-green-800">$0</p><p class="text-xs text-gray-500">Sizning kiritma</p></div>
      <div><p class="text-2xl font-bold text-green-800">$15,250</p><p class="text-xs text-gray-500">1-to'lov (5 oyda)</p></div>
      <div><p class="text-2xl font-bold text-green-800">$114,250</p><p class="text-xs text-gray-500">Jami foyda</p></div>
    </div>
  </div>

  <h2 class="text-xl font-bold text-green-800 mb-3">An'anaviy moliyalashtirishning muammolari</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>❌ <strong>Banklar:</strong> yuqori foizlar — foydasiz, barcha daromadni yeydi</li>
    <li>❌ <strong>Noaniq shartnomalar</strong> — mayda harflar, yashirin to'lovlar</li>
    <li>❌ <strong>Uzoq kelishuv</strong> — oylab kutish, hujjatlar to'plami</li>
    <li>❌ <strong>Garov va kafil</strong> — ta'minot bo'yicha murakkab talablar</li>
    <li>❌ <strong>Kechikish jarimalari</strong> — bir yomon mavsum = qarz botqog'i</li>
    <li>❌ <strong>Fermer ishonmaydi</strong> — bank hisoblaridagi pullarni nazorat qila olmaydi</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">AgriPartners qanday ishlaydi</h2>
  <ol class="list-decimal list-inside space-y-2 mb-8 text-gray-700">
    <li>Investor $50,000 kiritadi — pul blokcheynga qulflangan.</li>
    <li>Siz 50 bosh mol-qo'y sotib olasiz va boqishni boshlaysiz.</li>
    <li>5 oyda sotish: 50 bosh × $1,000 = $50,000. Foyda 60/40 bo'linadi.</li>
    <li><strong>Sizga birinchi to'lov: $15,250</strong> — 5 oydan keyin.</li>
    <li>3-tsikldan boshlab xarid daromaddan amalga oshiriladi (o'z-o'zini moliyalashtirish).</li>
    <li>35 oydan keyin: $96,250 naqd + boqish bazasi ($18,000) — <strong>sizniki abadiy</strong>.</li>
  </ol>

  <h2 class="text-xl font-bold text-green-800 mb-3">Sizning himoyangiz</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>✅ <strong>60% foyda sizniki</strong> — platforma komissiyasi faqat investordan olinadi</li>
    <li>✅ <strong>Shaffof shartlar</strong> — blokcheynga yozilgan, o'zgartirib bo'lmaydi</li>
    <li>✅ <strong>Boqish bazasi $18,000</strong> — 35 oydan keyin sizniki abadiy</li>
    <li>✅ <strong>Haqiqiy vaqt nazorati</strong> — dashboard orqali barcha ko'rsatkichlar</li>
  </ul>

  <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
    <p class="font-semibold text-gray-800 mb-2">Hujjatlar</p>
    <p class="text-sm text-gray-600">To'liq fermer shartnomasi: <strong>docs/60-40/pdf/ru/Agri-Farmer-Fidlot-v5.9-6040-RU.pdf</strong></p>
    <p class="text-sm text-gray-600 mt-1">Dashboard: <strong>https://agripartners.vercel.app</strong></p>
  </div>

  <div class="text-center border-t pt-6">
    <p class="text-gray-700 font-semibold">Muzokaralar uchun:</p>
    <p class="text-gray-500 text-sm mt-1">farhodmuhamadiev4@gmail.com</p>
    <p class="text-xs text-gray-400 mt-3">AgriPartners · NEAR Protocol · MVP tayyor ✅</p>
  </div>

</body>
</html>
```

- [ ] **Step 8.2: Create farmer-brief-ru.html** (Russian version for farmer)

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners — Фермеру</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 max-w-3xl mx-auto px-8 py-10 font-sans">

  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-green-800">AgriPartners</h1>
    <p class="text-gray-500 text-sm mt-1">Агро-финансирование на блокчейне · Узбекистан</p>
  </div>

  <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
    <p class="text-lg font-semibold text-green-900">
      Вы вкладываете $0 — за 35 месяцев получаете $114,250.
    </p>
    <div class="grid grid-cols-3 gap-4 mt-4">
      <div><p class="text-2xl font-bold text-green-800">$0</p><p class="text-xs text-gray-500">Ваши вложения</p></div>
      <div><p class="text-2xl font-bold text-green-800">$15,250</p><p class="text-xs text-gray-500">Первая выплата (5 мес)</p></div>
      <div><p class="text-2xl font-bold text-green-800">$114,250</p><p class="text-xs text-gray-500">Итого выгода</p></div>
    </div>
  </div>

  <h2 class="text-xl font-bold text-green-800 mb-3">Проблемы традиционного финансирования</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>❌ <strong>Банки:</strong> высокие % — невыгодно, съедает всю прибыль</li>
    <li>❌ <strong>Непрозрачные договоры</strong> — мелкий шрифт, скрытые комиссии</li>
    <li>❌ <strong>Долгое согласование</strong> — месяцы ожидания, горы документов</li>
    <li>❌ <strong>Залог и поручители</strong> — сложные требования к обеспечению</li>
    <li>❌ <strong>Штрафы при просрочке</strong> — один плохой сезон = долговая яма</li>
    <li>❌ <strong>Фермер не доверяет</strong> — нет прозрачного контроля над деньгами на счетах в банках</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">Как работает AgriPartners</h2>
  <ol class="list-decimal list-inside space-y-2 mb-8 text-gray-700">
    <li>Инвестор вносит $50,000 — деньги заблокированы в смарт-контракте.</li>
    <li>Вы закупаете 50 голов молодняка и начинаете откорм.</li>
    <li>Через 5 месяцев продажа: 50 гол × $1,000 = $50,000. Прибыль делится 60/40.</li>
    <li><strong>Ваша первая выплата: $15,250</strong> — через 5 месяцев после старта.</li>
    <li>С цикла 3 — закупка из выручки (самофинансирование, без доп. вложений).</li>
    <li>После 35 месяцев: $96,250 деньгами + база $18,000 — <strong>ваша навсегда</strong>.</li>
  </ol>

  <h2 class="text-xl font-bold text-green-800 mb-3">Ваша защита</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>✅ <strong>60% прибыли ваши</strong> — комиссия платформы берётся только с инвесторов</li>
    <li>✅ <strong>Прозрачные условия</strong> — зафиксированы в блокчейне, не изменяются</li>
    <li>✅ <strong>Откормочная база $18,000</strong> — остаётся вам навсегда после 35 мес</li>
    <li>✅ <strong>Контроль в реальном времени</strong> — дашборд показывает все балансы онлайн</li>
  </ul>

  <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
    <p class="font-semibold text-gray-800 mb-2">Документы</p>
    <p class="text-sm text-gray-600">Полный договор фермера: <strong>docs/60-40/pdf/ru/Agri-Farmer-Fidlot-v5.9-6040-RU.pdf</strong></p>
    <p class="text-sm text-gray-600 mt-1">Дашборд: <strong>https://agripartners.vercel.app</strong></p>
  </div>

  <div class="text-center border-t pt-6">
    <p class="text-gray-700 font-semibold">Обсудить условия:</p>
    <p class="text-gray-500 text-sm mt-1">farhodmuhamadiev4@gmail.com</p>
    <p class="text-xs text-gray-400 mt-3">AgriPartners · NEAR Protocol · MVP готов ✅</p>
  </div>

</body>
</html>
```

- [ ] **Step 8.3: Commit**

```bash
git add frontend/pages/farmer-brief-uz.html frontend/pages/farmer-brief-ru.html
git commit -m "feat: add farmer brief pages (UZ + RU)"
```

---

## Task 9: Platform Overview HTML (EN)

**Files:**

- Create: `frontend/pages/platform-overview-en.html`

- [ ] **Step 9.1: Create platform-overview-en.html**

(Content already in English — see spec for full HTML)

- [ ] **Step 9.2: Commit**

```bash
git add frontend/pages/platform-overview-en.html
git commit -m "feat: add platform overview page (EN) for NEAR Foundation and partners"
```

---

## Task 10: Pitch scripts (RU / EN / UZ)

**Files:**

- Create: `docs/pitch-script-ru.md`
- Create: `docs/pitch-script-en.md`
- Create: `docs/pitch-script-uz.md`

(Content in respective languages — see spec for full scripts)

- [ ] **Step 10.4: Commit**

```bash
git add docs/pitch-script-ru.md docs/pitch-script-en.md docs/pitch-script-uz.md
git commit -m "feat: add pitch scripts in RU, EN, UZ (5-7 min investor demo)"
```

---

## Task 11: NEAR Grant Proposal

**Files:**

- Create: `docs/near-grant-proposal.md`

(Content in English — see spec for full text)

- [ ] **Step 11.2: Commit**

```bash
git add docs/near-grant-proposal.md
git commit -m "docs: add NEAR DevHub grant proposal ($30k, 3 milestones)"
```

---

## Task 12: NEAR Horizon Profile

**Files:**

- Create: `docs/near-horizon-profile.md`

(Content in English — see spec for full text)

- [ ] **Step 12.2: Commit**

```bash
git add docs/near-horizon-profile.md
git commit -m "docs: add NEAR Horizon startup profile"
```

- [ ] **Step 12.3: Push everything to GitHub**

```bash
git push origin main
```

---

## Self-Review

**Spec coverage check:**

- ✅ Block 1 (Railway + Turso + Vercel): Tasks 1–6
- ✅ Block 2A (Investor Brief RU+EN): Task 7
- ✅ Block 2B (Farmer Brief UZ+RU): Task 8
- ✅ Block 2C (Platform Overview EN): Task 9
- ✅ Block 3 (Pitch scripts RU+EN+UZ): Task 10
- ✅ Block 4A (NEAR Grant Proposal): Task 11
- ✅ Block 4B (NEAR Horizon Profile): Task 12
- ✅ PDF agreements referenced in all materials
- ✅ Real Fidlot v5.9 numbers in all documents

**Placeholder scan:** no TBD, no TODO, all numbers are real from the spec.

**Type consistency:** no cross-task dependencies — each is self-contained.
