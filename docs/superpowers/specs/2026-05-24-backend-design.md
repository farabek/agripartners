# AgriPartners — Backend API Design

**Date:** 2026-05-24
**Approach:** B+ (Deal Registry + basic auth)
**Status:** Approved

---

## 1. General Architecture

**Stack:** Node.js + Express.js + SQLite (better-sqlite3) + near-api-js

**Principle:** Layered architecture — each layer does one thing.

```
E:\agripartners\backend\
├── src/
│   ├── routes/
│   │   ├── deals.js       ← CRUD for deals
│   │   └── admin.js       ← start_cycle, report_cycle, deploy
│   ├── services/
│   │   ├── dealService.js ← deal logic
│   │   └── nearService.js ← deploy + transactions + view calls
│   ├── db/
│   │   ├── index.js       ← SQLite initialization
│   │   └── schema.sql     ← table structure
│   ├── near/
│   │   └── client.js      ← NEAR RPC client + key signing
│   ├── middleware/
│   │   └── auth.js        ← API key check for /admin
│   └── app.js             ← Express application
├── .env
├── package.json
└── server.js
```

**Request flow:**

```
HTTP request
  → middleware/auth.js (if /admin — checks X-API-Key)
  → routes/           (routing, no logic)
  → services/         (business logic)
  → db/ or near/      (data)
  → JSON response
```

**Data source separation:**

- Deal parameters, event history → SQLite (DB)
- Current status and balances → NEAR RPC (blockchain, real-time)

---

## 2. Database (SQLite)

```sql
CREATE TABLE deals (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_address     TEXT NOT NULL UNIQUE,
  deal_type            TEXT NOT NULL,
  farmer               TEXT NOT NULL,
  investor             TEXT NOT NULL,
  admin                TEXT NOT NULL,
  platform             TEXT NOT NULL,
  investment_amount    TEXT NOT NULL,
  farmer_split_pct     INTEGER NOT NULL,
  investor_split_pct   INTEGER NOT NULL,
  escrow_pct           INTEGER NOT NULL,
  performance_fee_pct  INTEGER NOT NULL,
  cycle_duration_days  INTEGER NOT NULL,
  total_cycles         INTEGER NOT NULL,
  capital_return_near  TEXT NOT NULL,
  created_at           TEXT NOT NULL
);

CREATE TABLE events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id      INTEGER NOT NULL REFERENCES deals(id),
  event_type   TEXT NOT NULL,
  cycle_num    INTEGER,
  profit_near  TEXT,
  losses_near  TEXT,
  tx_hash      TEXT,
  created_at   TEXT NOT NULL
);
```

**event_type values:** `deployed` | `cycle_started` | `cycle_reported` | `completed` | `terminated`

**Note:** `funded` (investor's fund() call) is not recorded in events — the investor calls this method directly through their wallet, not through the backend. Current "Funded" status is visible via GET /api/deals/:id/status.

**Important:** NEAR amounts are stored as `TEXT` — yoctoNEAR numbers are too large for JavaScript `NUMBER`. Events are an append-only log.

---

## 3. API Endpoints

### Public (no authorization)

| Method | URL | Source | Description |
| --- | --- | --- | --- |
| `GET` | `/api/deals` | DB | List of all deals |
| `GET` | `/api/deals/:id` | DB | Parameters of one deal |
| `GET` | `/api/deals/:id/status` | Blockchain | Status + cycle number |
| `GET` | `/api/deals/:id/balances` | Blockchain | farmer/investor/escrow balances |
| `GET` | `/api/deals/:id/events` | DB | Event history |

### Protected (require `X-API-Key` header)

| Method | URL | Description |
| --- | --- | --- |
| `POST` | `/api/admin/deals` | Deploy new contract + save to DB |
| `POST` | `/api/admin/deals/:id/start-cycle` | Call `start_cycle()` on contract |
| `POST` | `/api/admin/deals/:id/report-cycle` | Call `report_cycle()` with profit NEAR |

### Request bodies

**POST /api/admin/deals:**

```json
{
  "deal_type": "fidlot",
  "farmer": "farmer.testnet",
  "investor": "investor1.testnet",
  "investment_amount": "50000000000000000000000000",
  "farmer_split_pct": 60,
  "investor_split_pct": 40,
  "escrow_pct": 44,
  "performance_fee_pct": 20,
  "total_cycles": 7,
  "cycle_duration_days": 150,
  "capital_return_near": "20400000000000000000000000"
}
```

**POST /api/admin/deals/:id/report-cycle:**

```json
{
  "profit_near": "5000000000000000000000000",
  "losses_near": "0"
}
```

---

## 4. NEAR Integration

**Library:** `near-api-js`

### near/client.js — initialization on startup

```
1. Reads NEAR_ADMIN_PRIVATE_KEY from .env
2. Creates InMemoryKeyStore with this key
3. Connects to NEAR RPC (testnet or mainnet)
4. Exports functions: deployContract, callMethod, viewMethod
```

### Three types of operations

**Contract deploy:**

```
Reads WASM → creates subaccount like "uuid.agripartners.testnet"
→ deploys WASM → calls new() with parameters
→ returns contract_address like "ap-{nanoid}.agripartners.testnet"
```

**Admin transactions (start_cycle, report_cycle):**

```
Builds transaction → signs with NEAR_ADMIN_PRIVATE_KEY
→ sends to NEAR RPC → returns tx_hash
→ after report_cycle checks new contract status
→ if status Completed or Terminated — appends corresponding event
→ tx_hash saved to events table
```

**View calls (get_status, get_balances):**

```
Calls contract view function (free, no signature)
→ returns JSON to client
```

### Environment variables (.env)

```
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=agripartners.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:...
WASM_PATH=../contract/target/wasm32-unknown-unknown/release/agripartners.wasm
API_KEY=supersecret123
PORT=3000
```

---

## 5. Deferred to v2

- JWT authorization with roles (farmer/investor/admin)
- Email/Telegram notifications for cycle events
- Analytics and statistics across all deals
- Full admin panel with UI
- Blockchain polling to sync state to DB

---

## 6. Testing

- Start server locally (`npm start`)
- Check all public endpoints via curl or Postman
- Check /admin protection — request without key should return 401
- Deploy test contract via POST /api/admin/deals
- Run cycle: start_cycle → report_cycle → check events
- Check get_status and get_balances return data from blockchain
