# Technical Overview

## System Summary

AgriPartners Alpha v1 is a four-layer application:

1. a Vite-built browser frontend;
2. a Node.js/Express REST API;
3. a PostgreSQL application database;
4. Rust smart contracts deployed per agricultural deal on NEAR Testnet.

The product uses a hybrid architecture. Contract status, contract balances, and native NEAR transfers are on-chain. User profiles, deal indexing, farmer reports, UI event history, and manually recorded returns are stored in PostgreSQL.

## Technology Inventory

| Layer | Current implementation | Primary source |
| --- | --- | --- |
| Frontend | Vanilla JavaScript, HTML, CSS, Vite 8 | `frontend/` |
| Wallet integration | NEAR Wallet Selector 8.10, MyNearWallet module, `near-api-js` 4.0.3 | `frontend/package.json` |
| Backend | Node.js, Express 4.18, CommonJS | `backend/package.json` |
| Backend NEAR client | `near-api-js` 2.1.4, FastNEAR RPC default | `backend/src/near/client.js` |
| Database | PostgreSQL through `pg` 8.21, ordered SQL migrations | `backend/src/db/` |
| Authentication | Username/password JWT and NEP-413-style wallet-signature JWT | `backend/src/middleware/`, `backend/src/services/walletAuthService.js` |
| Contract | Rust 2021, `near-sdk` declared at 5.5 and locked at 5.7.0 | `contract/Cargo.toml`, `contract/Cargo.lock` |
| Backend hosting model | Render configuration and Railway configuration are both present | `render.yaml`, `backend/railway.toml` |
| Frontend hosting model | Static Vite build; project documentation points to Vercel | `frontend/vite.config.js`, `README.md` |

## Frontend

`frontend/app.js` is a single-page application with hash-based routing for:

- login and wallet authentication;
- onboarding;
- marketplace and deal views;
- investor portal and portfolio views;
- farmer portal, funding confirmation, and reports;
- admin dashboard, deal creation, lifecycle actions, and return records.

The frontend uses NEAR Wallet Selector and MyNearWallet for message signing and contract function-call transactions. It stores the session JWT and user object in browser storage. The API base URL is selected by hostname:

- local browser: `http://localhost:3000`;
- non-local browser: `https://agripartners.onrender.com`.

There is no runtime API URL discovery or environment-based production API base in the current main frontend file.

## Backend

The backend starts by applying ordered SQL migrations. It seeds a default admin only when the users table is empty and either `RUN_SEED=true` or the environment is not production.

The API provides:

- public deal reads;
- legacy username/password authentication;
- wallet challenge and signature verification;
- wallet-linked investor and farmer data;
- profile onboarding;
- admin deal deployment and lifecycle operations;
- NEAR contract status and balance reads;
- PostgreSQL event, report, cycle, and return records.

Required startup variables in `backend/src/app.js` are `API_KEY`, `NEAR_ADMIN_ACCOUNT`, `NEAR_ADMIN_PRIVATE_KEY`, and `JWT_SECRET`. `DATABASE_URL` is required by the PostgreSQL pool in practice. The `API_KEY` is checked at startup, but the API-key middleware is not mounted by the current application.

## Database

PostgreSQL is the operational application store. Current migrations create or extend:

- `_migrations`;
- `deals`;
- `events`;
- `users`;
- `investor_profiles`;
- `farmer_cycle_updates`;
- `user_profiles`;
- `reports`;
- `deal_returns`.

Amounts are commonly stored as text to preserve large integer values such as yoctoNEAR. Deal ROI is stored as a numeric field. Application events may include transaction hashes, but they are database records rather than contract-emitted event logs.

`backend/src/db/schema.sql` still contains SQLite-style definitions and should be treated as legacy. The PostgreSQL migrations are the current schema authority.

## NEAR Integration

The backend defaults to NEAR Testnet and `https://test.rpc.fastnear.com` unless configuration overrides the RPC URL.

Current integration includes:

- wallet message signing and backend signature verification;
- FullAccess key verification through an RPC access-key query;
- contract account creation and WASM deployment;
- contract initialization;
- status and balance views;
- funding, cycle start, cycle reporting, and withdrawal function calls;
- transaction hash capture in PostgreSQL events.

The deployment service creates one contract subaccount per deal using a timestamp-based name under the configured admin account.

## Current Trust Boundary

The architecture is not fully trustless:

- the admin starts and reports cycles;
- the backend holds one or more signing keys;
- PostgreSQL controls profiles, reports, display events, and return records;
- an investor withdrawal signer can withdraw to the investor's account;
- the frontend and API determine role-specific data visibility;
- real-world farm evidence is not verified by the contract.

This is acceptable as an Alpha demonstration if stated clearly, but it is a central design question for beta and Mainnet planning.

## Known Documentation Drift

The root `README.md` is useful orientation but contains claims that should not be used without checking the code. Examples include:

- the README presents broad on-chain recording, while reports and several lifecycle records are off-chain;
- it lists `near-sdk` 5.7.0 while `Cargo.toml` declares 5.5.0 and the lockfile resolves 5.7.0;
- it references an MIT `LICENSE`, but no `LICENSE` file is present in the current repository inventory;
- it documents a public API URL that returned HTTP 404 during this review.

For technical review, use this kit and the source files as the current baseline.
