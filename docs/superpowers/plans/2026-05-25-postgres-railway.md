# PostgreSQL + Railway Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the broken `@libsql/client` DB layer with PostgreSQL (`pg`) and deploy the backend to Railway with auto-deploy from GitHub.

**Architecture:** Drop-in DB layer replacement — `db/index.js` becomes a `pg.Pool` singleton, all `dealService.js` functions become `async`, routes get `await`. A migration runner (`migrate.js`) creates tables on startup. No structural changes to Express routing or business logic.

**Tech Stack:** Node.js, Express, `pg` (node-postgres), PostgreSQL on Railway, `railway.toml`

---

## Files map

| File | Action |
|---|---|
| `backend/package.json` | Remove `@libsql/client`, add `pg` |
| `backend/src/db/index.js` | Replace with `pg.Pool` singleton |
| `backend/src/db/migrate.js` | **New** — runs SQL migrations on startup |
| `backend/src/db/migrations/001_initial.sql` | **New** — Postgres schema |
| `backend/src/services/dealService.js` | All functions → async, use `pool.query()` |
| `backend/src/routes/deals.js` | Add `async/await` to 3 sync handlers |
| `backend/src/routes/admin.js` | Add `await` to all `dealService.*` calls |
| `backend/src/app.js` | Upgrade `/health` to check DB |
| `backend/server.js` | `await migrate()` before `listen()` |
| `backend/.env.example` | Remove `TURSO_*`/`DB_PATH`, add `DATABASE_URL` |
| `backend/railway.toml` | **New** — Railway deploy config |
| `backend/tests/db.test.js` | Rewrite for pg.Pool |
| `backend/tests/dealService.test.js` | Rewrite for async API + mocked pool |
| `backend/tests/deals.routes.test.js` | `mockReturnValue` → `mockResolvedValue` |
| `backend/tests/admin.routes.test.js` | `mockReturnValue` → `mockResolvedValue` |

---

## Task 1: Replace dependencies

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Remove `@libsql/client`, add `pg`**

Run in `E:\agripartners\backend`:
```powershell
npm uninstall @libsql/client
npm install pg
```

- [ ] **Step 2: Verify `package.json` dependencies**

`package.json` should now have `"pg": "^8.x.x"` and no `@libsql/client`.

```powershell
Get-Content package.json | Select-String "pg|libsql"
```

Expected: only `"pg"` appears, no `@libsql/client`.

- [ ] **Step 3: Commit**

```powershell
cd E:\agripartners
git add backend/package.json backend/package-lock.json
git commit -m "chore: replace @libsql/client with pg"
```

---

## Task 2: Postgres schema migration file

**Files:**
- Create: `backend/src/db/migrations/001_initial.sql`

- [ ] **Step 1: Create migrations directory**

```powershell
New-Item -ItemType Directory -Force "E:\agripartners\backend\src\db\migrations"
```

- [ ] **Step 2: Write the SQL file**

Create `backend/src/db/migrations/001_initial.sql`:

```sql
CREATE TABLE IF NOT EXISTS deals (
  id                  SERIAL PRIMARY KEY,
  contract_address    TEXT NOT NULL UNIQUE,
  deal_type           TEXT NOT NULL,
  farmer              TEXT NOT NULL,
  investor            TEXT NOT NULL,
  admin               TEXT NOT NULL,
  platform            TEXT NOT NULL,
  investment_amount   TEXT NOT NULL,
  farmer_split_pct    INTEGER NOT NULL,
  investor_split_pct  INTEGER NOT NULL,
  escrow_pct          INTEGER NOT NULL,
  performance_fee_pct INTEGER NOT NULL,
  cycle_duration_days INTEGER NOT NULL,
  total_cycles        INTEGER NOT NULL,
  capital_return_near TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id          SERIAL PRIMARY KEY,
  deal_id     INTEGER NOT NULL REFERENCES deals(id),
  event_type  TEXT NOT NULL,
  cycle_num   INTEGER,
  profit_near TEXT,
  losses_near TEXT,
  tx_hash     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- [ ] **Step 3: Commit**

```powershell
cd E:\agripartners
git add backend/src/db/migrations/001_initial.sql
git commit -m "feat: add Postgres migration schema"
```

---

## Task 3: Rewrite db/index.js (pg.Pool singleton)

**Files:**
- Modify: `backend/src/db/index.js`
- Modify: `backend/tests/db.test.js`

- [ ] **Step 1: Update `db.test.js` first (TDD)**

Replace the entire content of `backend/tests/db.test.js`:

```js
const pool = require('../src/db/index');

test('db exports a pg Pool with query method', () => {
  expect(typeof pool.query).toBe('function');
});

test('db returns the same instance on repeated requires', () => {
  const pool2 = require('../src/db/index');
  expect(pool).toBe(pool2);
});
```

- [ ] **Step 2: Run test — verify it fails**

```powershell
cd E:\agripartners\backend
npx jest tests/db.test.js --no-coverage 2>&1 | Select-String "PASS|FAIL|Error"
```

Expected: FAIL (old db/index.js returns async client, not pg.Pool).

- [ ] **Step 3: Rewrite `backend/src/db/index.js`**

Replace the entire file:

```js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
```

- [ ] **Step 4: Run test — verify it passes**

```powershell
npx jest tests/db.test.js --no-coverage 2>&1 | Select-String "PASS|FAIL|Error"
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
cd E:\agripartners
git add backend/src/db/index.js backend/tests/db.test.js
git commit -m "feat: replace db layer with pg.Pool singleton"
```

---

## Task 4: Create migration runner (migrate.js)

**Files:**
- Create: `backend/src/db/migrate.js`

No unit test for this file — it's a startup concern tested manually with a real DB.

- [ ] **Step 1: Create `backend/src/db/migrate.js`**

```js
const fs = require('fs');
const path = require('path');
const pool = require('./index');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      filename TEXT PRIMARY KEY,
      run_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const filename of files) {
    const { rows } = await pool.query(
      'SELECT filename FROM _migrations WHERE filename = $1',
      [filename]
    );
    if (rows.length > 0) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO _migrations (filename) VALUES ($1)',
        [filename]
      );
      await client.query('COMMIT');
      console.log(`[migrate] applied: ${filename}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = migrate;
```

- [ ] **Step 2: Verify the file has no syntax errors**

```powershell
node -e "require('./src/db/migrate')" 2>&1
```

Expected: no output (no errors at require time since pool is lazy).

- [ ] **Step 3: Commit**

```powershell
cd E:\agripartners
git add backend/src/db/migrate.js
git commit -m "feat: add SQL migration runner"
```

---

## Task 5: Rewrite dealService.js (async + pool.query)

**Files:**
- Modify: `backend/src/services/dealService.js`
- Modify: `backend/tests/dealService.test.js`

- [ ] **Step 1: Rewrite `tests/dealService.test.js` (TDD — tests for async API)**

Replace the entire file:

```js
const pool = require('../src/db/index');
jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents } =
  require('../src/services/dealService');

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

beforeEach(() => jest.clearAllMocks());

test('getAllDeals calls pool.query and returns rows', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getAllDeals();
  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM deals ORDER BY created_at DESC'
  );
  expect(deals).toHaveLength(1);
  expect(deals[0].id).toBe(1);
});

test('getDealById returns row when found', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deal = await getDealById(1);
  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM deals WHERE id = $1',
    [1]
  );
  expect(deal.id).toBe(1);
});

test('getDealById returns null when not found', async () => {
  pool.query.mockResolvedValue({ rows: [] });
  const deal = await getDealById(9999);
  expect(deal).toBeNull();
});

test('createDeal inserts and returns created row', async () => {
  const created = { id: 1, ...sampleDeal };
  pool.query.mockResolvedValue({ rows: [created] });
  const deal = await createDeal(sampleDeal);
  expect(pool.query).toHaveBeenCalled();
  const [sql] = pool.query.mock.calls[0];
  expect(sql).toContain('INSERT INTO deals');
  expect(sql).toContain('RETURNING *');
  expect(deal.id).toBe(1);
  expect(deal.contract_address).toBe(sampleDeal.contract_address);
});

test('addEvent inserts event row', async () => {
  pool.query.mockResolvedValue({ rows: [] });
  await addEvent({ deal_id: 1, event_type: 'deployed', tx_hash: 'abc123' });
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('INSERT INTO events');
  expect(params).toContain(1);
  expect(params).toContain('deployed');
  expect(params).toContain('abc123');
});

test('getDealEvents returns events for deal', async () => {
  const mockEvents = [{ id: 1, deal_id: 1, event_type: 'deployed', tx_hash: 'abc' }];
  pool.query.mockResolvedValue({ rows: mockEvents });
  const events = await getDealEvents(1);
  expect(pool.query).toHaveBeenCalledWith(
    'SELECT * FROM events WHERE deal_id = $1 ORDER BY created_at ASC',
    [1]
  );
  expect(events).toHaveLength(1);
});
```

- [ ] **Step 2: Run tests — verify they fail**

```powershell
cd E:\agripartners\backend
npx jest tests/dealService.test.js --no-coverage 2>&1 | Select-String "PASS|FAIL|Error"
```

Expected: FAIL (old service uses sync API).

- [ ] **Step 3: Rewrite `backend/src/services/dealService.js`**

Replace the entire file:

```js
const pool = require('../db/index');

async function getAllDeals() {
  const { rows } = await pool.query(
    'SELECT * FROM deals ORDER BY created_at DESC'
  );
  return rows;
}

async function getDealById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM deals WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

async function createDeal(deal) {
  const { rows } = await pool.query(
    `INSERT INTO deals (
      contract_address, deal_type, farmer, investor, admin, platform,
      investment_amount, farmer_split_pct, investor_split_pct, escrow_pct,
      performance_fee_pct, cycle_duration_days, total_cycles, capital_return_near
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
    RETURNING *`,
    [
      deal.contract_address, deal.deal_type, deal.farmer, deal.investor,
      deal.admin, deal.platform, deal.investment_amount,
      deal.farmer_split_pct, deal.investor_split_pct, deal.escrow_pct,
      deal.performance_fee_pct, deal.cycle_duration_days, deal.total_cycles,
      deal.capital_return_near
    ]
  );
  return rows[0];
}

async function addEvent(event) {
  await pool.query(
    `INSERT INTO events (deal_id, event_type, cycle_num, profit_near, losses_near, tx_hash)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      event.deal_id, event.event_type, event.cycle_num ?? null,
      event.profit_near ?? null, event.losses_near ?? null,
      event.tx_hash ?? null
    ]
  );
}

async function getDealEvents(dealId) {
  const { rows } = await pool.query(
    'SELECT * FROM events WHERE deal_id = $1 ORDER BY created_at ASC',
    [dealId]
  );
  return rows;
}

module.exports = { getAllDeals, getDealById, createDeal, addEvent, getDealEvents };
```

- [ ] **Step 4: Run tests — verify they pass**

```powershell
npx jest tests/dealService.test.js --no-coverage 2>&1 | Select-String "PASS|FAIL|Error"
```

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```powershell
cd E:\agripartners
git add backend/src/services/dealService.js backend/tests/dealService.test.js
git commit -m "feat: rewrite dealService to async pg.query"
```

---

## Task 6: Update routes/deals.js (async/await)

**Files:**
- Modify: `backend/src/routes/deals.js`
- Modify: `backend/tests/deals.routes.test.js`

- [ ] **Step 1: Update mocks in `tests/deals.routes.test.js`**

Change all `mockReturnValue` for dealService functions to `mockResolvedValue` (lines 17–19 in `beforeEach`):

```js
beforeEach(() => {
  dealService.getAllDeals.mockResolvedValue([mockDeal]);
  dealService.getDealById.mockResolvedValue(mockDeal);
  dealService.getDealEvents.mockResolvedValue([]);
  nearService.getContractStatus.mockResolvedValue({ status: 'Funded', current_cycle: 0 });
  nearService.getContractBalances.mockResolvedValue({ farmer: '0', investor: '0', platform: '0', escrow: '0' });
});
```

Also update the 404 test (line 37–40):
```js
test('GET /api/deals/:id returns 404 for missing deal', async () => {
  dealService.getDealById.mockResolvedValue(null);
  const res = await request(app).get('/api/deals/999');
  expect(res.status).toBe(404);
});
```

- [ ] **Step 2: Run tests — verify they fail (route still calls service synchronously)**

```powershell
cd E:\agripartners\backend
npx jest tests/deals.routes.test.js --no-coverage 2>&1 | Select-String "PASS|FAIL|Error"
```

Expected: some tests FAIL (Promise returned instead of value for sync calls).

- [ ] **Step 3: Rewrite `backend/src/routes/deals.js`**

Replace the entire file:

```js
const router = require('express').Router();
const dealService = require('../services/dealService');
const nearService = require('../services/nearService');

router.get('/', async (req, res) => {
  res.json(await dealService.getAllDeals());
});

router.get('/:id', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  res.json(deal);
});

router.get('/:id/status', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  try {
    res.json(await nearService.getContractStatus(deal.contract_address));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/balances', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  try {
    res.json(await nearService.getContractBalances(deal.contract_address));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/events', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  res.json(await dealService.getDealEvents(req.params.id));
});

module.exports = router;
```

- [ ] **Step 4: Run tests — verify they pass**

```powershell
npx jest tests/deals.routes.test.js --no-coverage 2>&1 | Select-String "PASS|FAIL|Error"
```

Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```powershell
cd E:\agripartners
git add backend/src/routes/deals.js backend/tests/deals.routes.test.js
git commit -m "feat: make deals routes async, await dealService calls"
```

---

## Task 7: Update routes/admin.js (await dealService calls)

**Files:**
- Modify: `backend/src/routes/admin.js`
- Modify: `backend/tests/admin.routes.test.js`

- [ ] **Step 1: Update mocks in `tests/admin.routes.test.js`**

In `beforeEach`, change dealService mocks from `mockReturnValue` to `mockResolvedValue`:

```js
beforeEach(() => {
  dealService.getDealById.mockResolvedValue(mockDeal);
  dealService.createDeal.mockResolvedValue(mockDeal);
  dealService.addEvent.mockResolvedValue(undefined);
  nearService.deployContract.mockResolvedValue({ contractId: 'ap1.agripartners.testnet', txHash: 'tx1' });
  nearService.startCycle.mockResolvedValue({ txHash: 'tx2' });
  nearService.reportCycle.mockResolvedValue({ txHash: 'tx3' });
  nearService.getContractStatus.mockResolvedValue({ status: 'CycleActive', current_cycle: 1 });
});
```

Also update the one-off override in the fund 404 test (line 115):
```js
dealService.getDealById.mockResolvedValueOnce(null);
```

- [ ] **Step 2: Run tests — verify some fail**

```powershell
cd E:\agripartners\backend
npx jest tests/admin.routes.test.js --no-coverage 2>&1 | Select-String "PASS|FAIL|Error"
```

Expected: some FAIL (route awaits but implementation calls service without await).

- [ ] **Step 3: Update `backend/src/routes/admin.js` — add `await` to all dealService calls**

Replace the entire file:

```js
const router = require('express').Router();
const dealService = require('../services/dealService');
const nearService = require('../services/nearService');

router.post('/deals', async (req, res) => {
  const { deal_type, farmer, investor, investment_amount, farmer_split_pct,
    investor_split_pct, escrow_pct, performance_fee_pct,
    total_cycles, cycle_duration_days, capital_return_near } = req.body;

  if (!deal_type || !farmer || !investor || !investment_amount) {
    return res.status(400).json({ error: 'Missing required fields: deal_type, farmer, investor, investment_amount' });
  }

  try {
    const { contractId, txHash } = await nearService.deployContract({
      deal_type, farmer, investor, investment_amount,
      farmer_split_pct: farmer_split_pct ?? 60,
      investor_split_pct: investor_split_pct ?? 40,
      escrow_pct: escrow_pct ?? 44,
      performance_fee_pct: performance_fee_pct ?? 20,
      total_cycles, cycle_duration_days, capital_return_near
    });

    const deal = await dealService.createDeal({
      contract_address: contractId,
      deal_type, farmer, investor,
      admin: process.env.NEAR_ADMIN_ACCOUNT,
      platform: process.env.NEAR_ADMIN_ACCOUNT,
      investment_amount,
      farmer_split_pct: farmer_split_pct ?? 60,
      investor_split_pct: investor_split_pct ?? 40,
      escrow_pct: escrow_pct ?? 44,
      performance_fee_pct: performance_fee_pct ?? 20,
      cycle_duration_days, total_cycles, capital_return_near
    });

    await dealService.addEvent({ deal_id: deal.id, event_type: 'deployed', tx_hash: txHash });
    res.status(201).json(deal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/start-cycle', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  try {
    const { txHash } = await nearService.startCycle(deal.contract_address);
    const { current_cycle } = await nearService.getContractStatus(deal.contract_address);
    await dealService.addEvent({ deal_id: deal.id, event_type: 'cycle_started', cycle_num: current_cycle, tx_hash: txHash });
    res.json({ success: true, tx_hash: txHash, cycle: current_cycle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/report-cycle', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  const { profit_near, losses_near } = req.body;
  if (profit_near == null) return res.status(400).json({ error: 'profit_near is required' });

  try {
    const { txHash } = await nearService.reportCycle(deal.contract_address, profit_near, losses_near || '0');
    const { status, current_cycle } = await nearService.getContractStatus(deal.contract_address);

    await dealService.addEvent({
      deal_id: deal.id, event_type: 'cycle_reported',
      cycle_num: current_cycle, profit_near,
      losses_near: losses_near || '0', tx_hash: txHash
    });

    if (status === 'Completed' || status === 'Terminated') {
      await dealService.addEvent({ deal_id: deal.id, event_type: status.toLowerCase(), tx_hash: txHash });
    }

    res.json({ success: true, tx_hash: txHash, status, cycle: current_cycle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/deals/:id/fund', async (req, res) => {
  const deal = await dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  try {
    const { txHash } = await nearService.fundContract(
      deal.contract_address,
      deal.investment_amount
    );
    await dealService.addEvent({ deal_id: deal.id, event_type: 'funded', tx_hash: txHash });
    res.json({ success: true, tx_hash: txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 4: Run tests — verify they pass**

```powershell
npx jest tests/admin.routes.test.js --no-coverage 2>&1 | Select-String "PASS|FAIL|Error"
```

Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```powershell
cd E:\agripartners
git add backend/src/routes/admin.js backend/tests/admin.routes.test.js
git commit -m "feat: await dealService calls in admin routes"
```

---

## Task 8: Upgrade /health and update server.js

**Files:**
- Modify: `backend/src/app.js`
- Modify: `backend/server.js`

- [ ] **Step 1: Replace `/health` in `backend/src/app.js`**

Find line:
```js
app.get('/health', (req, res) => res.json({ status: 'ok' }));
```

Replace with:
```js
const pool = require('./db/index');
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});
```

Make sure the `require('./db/index')` line is added at the top of `app.js`, after the existing requires.

- [ ] **Step 2: Verify existing tests still pass (app.js is not imported by route tests)**

```powershell
cd E:\agripartners\backend
npx jest tests/deals.routes.test.js tests/admin.routes.test.js --no-coverage 2>&1 | Select-String "PASS|FAIL|Error"
```

Expected: both PASS.

- [ ] **Step 3: Replace `backend/server.js`**

Replace the entire file:

```js
require('dotenv').config();
const app = require('./src/app');
const migrate = require('./src/db/migrate');

const PORT = process.env.PORT || 3000;

async function start() {
  await migrate();
  app.listen(PORT, () => console.log(`AgriPartners backend running on port ${PORT}`));
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
```

- [ ] **Step 4: Commit**

```powershell
cd E:\agripartners
git add backend/src/app.js backend/server.js
git commit -m "feat: upgrade /health with db check, run migrations on startup"
```

---

## Task 9: Config files

**Files:**
- Modify: `backend/.env.example`
- Create: `backend/railway.toml`
- Copy WASM to: `backend/contract/agripartners.wasm`

- [ ] **Step 1: Update `backend/.env.example`**

Replace the entire file:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NODE_ENV=production
PORT=3000
API_KEY=change-me-in-production
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=farab.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:YOUR_KEY_HERE
WASM_PATH=./contract/agripartners.wasm
```

- [ ] **Step 2: Create `backend/railway.toml`**

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node server.js"
healthcheckPath = "/health"
healthcheckTimeout = 30
```

- [ ] **Step 3: Copy compiled WASM into the repo**

```powershell
New-Item -ItemType Directory -Force "E:\agripartners\backend\contract"
Copy-Item "E:\agripartners\contract\target\wasm32-unknown-unknown\release\agripartners.wasm" `
          "E:\agripartners\backend\contract\agripartners.wasm"
```

Verify the file was copied:
```powershell
Get-Item "E:\agripartners\backend\contract\agripartners.wasm" | Select-Object Name, Length
```

Expected: `agripartners.wasm`, ~127 KB.

- [ ] **Step 4: Verify WASM is not in .gitignore**

```powershell
Get-Content "E:\agripartners\backend\.gitignore" 2>$null | Select-String "wasm|contract"
```

If `*.wasm` appears in `.gitignore`, add an exception:
```
!contract/agripartners.wasm
```

- [ ] **Step 5: Commit**

```powershell
cd E:\agripartners
git add backend/.env.example backend/railway.toml backend/contract/agripartners.wasm
git commit -m "chore: add railway.toml, update env.example, include WASM for deploy"
```

---

## Task 10: Run all tests + Railway deploy

**Files:** None (verification + ops)

- [ ] **Step 1: Run the full test suite**

```powershell
cd E:\agripartners\backend
npx jest --no-coverage 2>&1
```

Expected: all test files PASS. Count should be at least 20 tests total.

If any test fails, fix it before continuing.

- [ ] **Step 2: Install Railway CLI**

```powershell
npm install -g @railway/cli
railway --version
```

- [ ] **Step 3: Login and create project**

```powershell
railway login
```

Browser opens → login with GitHub. Then:

```powershell
cd E:\agripartners\backend
railway init
```

Choose: "Create a new project" → name it `agripartners-backend`.

- [ ] **Step 4: Add Postgres plugin in Railway Dashboard**

Open https://railway.app → your project → **+ New** → **Database** → **PostgreSQL**.

Railway will auto-set `DATABASE_URL` in the project environment.

- [ ] **Step 5: Set remaining environment variables**

In Railway Dashboard → your service → **Variables**, add:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `API_KEY` | your secret key |
| `NEAR_NETWORK` | `testnet` |
| `NEAR_ADMIN_ACCOUNT` | `farab.testnet` |
| `NEAR_ADMIN_PRIVATE_KEY` | `ed25519:...` (your key) |
| `WASM_PATH` | `./contract/agripartners.wasm` |

- [ ] **Step 6: Connect GitHub repo and deploy**

In Railway Dashboard → your service → **Settings** → **Source** → connect `farabek/agripartners` repo → set root directory to `backend`.

Railway will deploy automatically. Watch the build logs.

- [ ] **Step 7: Verify deployment**

After deploy succeeds, Railway shows a URL like `https://agripartners-backend.up.railway.app`.

```powershell
$URL = "https://your-app.up.railway.app"
Invoke-RestMethod "$URL/health"
```

Expected: `{ "status": "ok" }`

```powershell
Invoke-RestMethod "$URL/api/deals"
```

Expected: `[]` (empty array, DB is fresh).

- [ ] **Step 8: Final commit with deploy URL**

Update the project memory with the Railway URL (via Claude Code memory).

---

## Self-Review Checklist (completed inline)

- [x] **Spec coverage:** DB pool ✓ | migrations ✓ | dealService async ✓ | routes async ✓ | /health with db ✓ | server.js migrate() ✓ | railway.toml ✓ | .env.example ✓ | WASM ✓
- [x] **No placeholders:** All steps have actual code
- [x] **Type consistency:** `pool.query()` used consistently, `$1/$2/...` placeholders throughout, `RETURNING *` in createDeal matches test assertion `deal.id`
- [x] **admin.js fix:** Correctly identified and fixed (was incorrectly marked "no changes needed" in first spec draft)
