# AgriPartners

**Blockchain-powered agricultural investment platform on NEAR Protocol**

[![Live Demo](https://img.shields.io/badge/demo-agripartners.vercel.app-2d6a4f?style=flat-square)](https://agripartners.vercel.app)
[![API](https://img.shields.io/badge/api-agripartners.onrender.com-2d6a4f?style=flat-square)](https://agripartners.onrender.com)
[![NEAR](https://img.shields.io/badge/NEAR-testnet-black?style=flat-square)](https://testnet.nearblocks.io)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

AgriPartners tokenizes livestock investment deals as NEAR smart contracts. Investors get transparent, on-chain returns. Farmers get working capital with **zero upfront cost**. Every payment, cycle, and payout is recorded on-chain.

---

## The Problem

500M+ smallholder livestock farmers in emerging markets have no access to working capital. Banks require collateral they don't have. Investment deals are handled on paper — slow, opaque, and open to fraud.

## The Solution

A NEAR smart contract replaces the paper agreement. Every deal term — profit split, cycle schedule, payout amounts — lives on-chain. Payouts to investor and farmer execute automatically at the end of each cycle.

---

## Investment Model — Fidlot v5.9

| Parameter | Value |
| --- | --- |
| Investment size | $50,000 per deal |
| Split | 60% farmer / 40% investor |
| Platform fee | 20% of investor share only |
| Cycle duration | 5 months |
| Total cycles | 7 |
| Total duration | 35 months |

**Returns:**
- **Investor:** $50,000 → ~$82,000 · ROI **+64%** · APR **~21.9%**
- **Farmer:** $0 invested → $96,250 cash + $18,000 feedlot asset = **$114,250 total**

---

## Architecture

```
agripartners/
├── contract/          # Rust smart contract (NEAR Protocol)
│   └── src/lib.rs     # State machine: Initialized → Funded → CycleActive → Completed
├── backend/           # Node.js REST API
│   └── src/
│       ├── routes/    # deals.js (public) · admin.js (JWT protected)
│       ├── services/  # dealService.js · nearService.js
│       ├── middleware/ # auth.js (JWT verification)
│       ├── near/      # client.js (NEAR RPC)
│       └── db/        # PostgreSQL migrations
├── frontend/          # Vanilla JS dashboard
│   ├── index.html
│   ├── app.js         # Hash router · farmer/investor portals
│   └── style.css
└── docs/              # One-pager, pitch deck, PDF contracts
```

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Smart Contract | Rust · near-sdk 5.7.0 · WASM |
| Blockchain | NEAR Protocol (testnet / mainnet) |
| Backend | Node.js · Express.js · PostgreSQL (Neon) |
| Auth | JWT · roles: farmer / investor / admin |
| Frontend | Vanilla JS · Tailwind CSS · Chart.js |
| Hosting | Render (API) · Vercel (UI) |

---

## Smart Contract

The contract implements a state machine with five states:

```
Initialized → Funded → CycleActive → CycleSettlement → Completed
                                                      ↘ Terminated
```

**Methods:**
- `new(...)` — Initialize contract with all deal parameters
- `fund()` — Investor deposits the investment amount
- `start_cycle()` — Admin starts a new livestock cycle
- `report_cycle(losses_near)` — Admin reports cycle results
- `withdraw()` — Pull-payment for farmer / investor / platform
- `get_status()` → current state + cycle number
- `get_balances()` → pending withdrawals for all parties

**Build:**
```bash
cd contract
cargo build --target wasm32-unknown-unknown --release
wasm-opt -Oz --strip-debug --mvp-features \
  -o target/wasm32-unknown-unknown/release/agripartners.wasm \
     target/wasm32-unknown-unknown/release/agripartners.wasm
```

> Requires Rust **1.86** (pinned). NEAR testnet deployment fails on Rust 1.87+.

---

## Backend API

**Base URL:** `https://agripartners.onrender.com`

### Public endpoints (no auth required)

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/deals` | List all deals |
| GET | `/api/deals/:id` | Deal parameters |
| GET | `/api/deals/:id/status` | On-chain status + cycle |
| GET | `/api/deals/:id/balances` | On-chain balances |
| GET | `/api/deals/:id/events` | Event history |

### Protected endpoints (JWT required)

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/me/deals` | Deals for logged-in user |
| POST | `/api/admin/deals` | Deploy new contract + create deal |
| POST | `/api/admin/deals/:id/fund` | Fund the contract |
| POST | `/api/admin/deals/:id/start-cycle` | Start next cycle |
| POST | `/api/admin/deals/:id/report-cycle` | Report cycle results |

**Login example:**
```bash
curl -X POST https://agripartners.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}'
```

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL (or [Neon](https://neon.tech) free tier)
- Rust 1.86 + `wasm32-unknown-unknown` target

### Backend

```bash
cd backend
cp .env.example .env
# Fill in .env: DATABASE_URL, NEAR_ADMIN_ACCOUNT, NEAR_ADMIN_PRIVATE_KEY, JWT_SECRET
npm install
npm start
```

### Frontend

```bash
# Serve frontend locally (any static server)
npx serve frontend -p 5500
# Open http://localhost:5500
```

### Environment variables

```env
DATABASE_URL=postgresql://...
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=your-account.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:...
JWT_SECRET=your-secret-key
ADMIN_PASSWORD=your-admin-password
```

---

## Running the Demo

The demo script runs a full lifecycle: deploy → fund → 3 cycles → Completed.

```powershell
# Terminal 1: start backend
cd backend; npm start

# Terminal 2: serve frontend
npx serve frontend -p 5500

# Terminal 3: run interactive demo (press Enter at each pause)
.\demo.ps1

# Open browser: http://localhost:5500
```

> **Testnet balance:** deploying a contract costs ~2 NEAR. Replenish at [testnet.mynearwallet.com](https://testnet.mynearwallet.com).

---

## Tests

```bash
# Backend (38 tests)
cd backend && npm test

# Smart contract unit tests (21 tests)
cd contract && cargo test

# Integration tests (Linux/CI only)
cd contract && cargo test --features integration
```

---

## Status

| Component | Status |
| --- | --- |
| Smart contract | ✅ Deployed on testnet |
| Backend API | ✅ Live on Render |
| Frontend dashboard | ✅ Live on Vercel |
| Full lifecycle demo | ✅ Completed |
| Security audit | ⏳ Pending (required for mainnet) |
| Mainnet launch | ⏳ Pending audit |

**Traction:** Real farmer ready to sign 2 deals × $50,000 = **$100,000** pending mainnet launch.

---

## Funding

We are seeking a **$40,000 seed grant** to cover:
- Smart contract security audit — $10,000
- Infrastructure (2 years) — $3,000
- Legal & first deal — $5,000
- Developer salary (6 months) — $18,000
- AI development tools — $1,000
- Operational reserve — $3,000

This unlocks $100,000 in signed deals immediately after mainnet launch.

**Contact:** farhodmuhamadiev4@gmail.com

---

## License

MIT
