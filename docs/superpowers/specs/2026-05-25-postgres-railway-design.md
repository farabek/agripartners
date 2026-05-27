# AgriPartners Backend: SQLite → PostgreSQL + Railway Deploy

**Date:** 2026-05-25  
**Scope:** `E:\agripartners\backend\`  
**Variant:** B — migrations + health check + Railway auto-deploy

---

## Context

The current DB layer is broken: `db/index.js` uses async `@libsql/client` (Turso),
while `dealService.js` calls synchronous `better-sqlite3` API (`.prepare().all()`).
This migration fixes the inconsistency and moves to PostgreSQL on Railway.

---

## Architecture

No structural changes to the Express app. Only the DB layer is replaced:

```
server.js
  └── migrate()          ← runs pending SQL migrations before listen()
src/app.js
  └── GET /health        ← Railway health check
src/db/
  ├── index.js           ← exports pg.Pool singleton
  ├── migrate.js         ← reads + runs migration files, tracks in _migrations table
  └── migrations/
      └── 001_initial.sql ← deals + events tables (Postgres syntax)
src/services/
  └── dealService.js     ← all functions async, use pool.query()
src/routes/
  ├── deals.js           ← add async/await to 3 sync handlers
  └── admin.js           ← await dealService calls
```

---

## DB Layer

### `src/db/index.js`

Exports a `pg.Pool` singleton. Reads `DATABASE_URL` from env.

```js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
module.exports = pool;
```

### `src/db/migrate.js`

- Reads all `*.sql` files from `migrations/` sorted by name
- Creates `_migrations(filename TEXT PRIMARY KEY)` table if not exists
- Skips files already recorded in `_migrations`
- Runs each new file in a transaction, records filename on success

### `src/db/migrations/001_initial.sql`

Same schema as current `schema.sql`, adapted for Postgres:

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

---

## Service Layer

All `dealService.js` functions become async. API stays identical for routes.

| Old (broken) | New |
| --- | --- |
| `getDb().prepare(sql).all()` | `const { rows } = await pool.query(sql); return rows;` |
| `getDb().prepare(sql).get(id)` | `const { rows } = await pool.query(sql, [id]); return rows[0] \|\| null;` |
| `getDb().prepare(sql).run(...args)` | `await pool.query(sql, [...args])` |
| `result.lastInsertRowid` | `RETURNING id` clause + `rows[0].id` |

`createDeal()` uses `INSERT ... RETURNING *` to return the created row.

---

## Routes

`deals.js` — three handlers currently call service synchronously:
- `GET /` — add `async`, `await dealService.getAllDeals()`
- `GET /:id` — add `async`, `await dealService.getDealById()`
- `GET /:id/events` — add `async`, `await dealService.getDealEvents()`

`admin.js` — already async, but calls `dealService` synchronously → add `await` to all `dealService.*` calls.

---

## Health Check

Added to `app.js` before other routes:

```js
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});
```

---

## Server Startup

`server.js` awaits migrations before binding the port:

```js
const migrate = require('./src/db/migrate');

async function start() {
  await migrate();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
```

---

## Railway Configuration

**`railway.toml`** (placed in `backend/`):

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node server.js"
healthcheckPath = "/health"
healthcheckTimeout = 30
```

**Environment variables to set in Railway Dashboard:**

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Auto-provided by Railway Postgres plugin |
| `NODE_ENV` | `production` |
| `PORT` | Auto-provided by Railway |
| `API_KEY` | Your secret key |
| `NEAR_NETWORK` | `testnet` |
| `NEAR_ADMIN_ACCOUNT` | `farab.testnet` |
| `NEAR_ADMIN_PRIVATE_KEY` | `ed25519:...` |
| `WASM_PATH` | `./contract/agripartners.wasm` (committed to git, see note below) |

**WASM file:** The compiled `agripartners.wasm` (~127 KB) must be committed to git so Railway can access it. Copy it to `backend/contract/agripartners.wasm` and set `WASM_PATH=./contract/agripartners.wasm`. Add to `.gitignore` exception if needed.

**One-time setup:**
1. `railway login` in terminal
2. Create new project → Add Postgres plugin
3. Set env vars above
4. Connect GitHub repo → enable auto-deploy from `main`

---

## Files Changed

| File | Action |
| --- | --- |
| `package.json` | Remove `@libsql/client`, add `pg` |
| `src/db/index.js` | Replace with pg.Pool |
| `src/db/migrate.js` | New — migration runner |
| `src/db/migrations/001_initial.sql` | New — Postgres schema |
| `src/services/dealService.js` | All async, pool.query() |
| `src/routes/deals.js` | async/await on 3 handlers |
| `src/app.js` | Add /health endpoint |
| `server.js` | await migrate() before listen |
| `.env.example` | Remove TURSO_*, add DATABASE_URL |
| `railway.toml` | New — Railway deploy config |

Total: 7 modified, 3 new.

---

## What Is NOT in Scope

- JWT authentication
- Data migration from SQLite
- Mainnet deployment
- Frontend changes
