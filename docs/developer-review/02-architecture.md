# Architecture

## Component Model

```text
User browser
  |
  | HTTPS / wallet redirect
  v
Vite frontend
  |-- MyNearWallet / Wallet Selector --------------------+
  |                                                       |
  | Bearer JWT + JSON REST                                | signed message or transaction
  v                                                       v
Express API -----------------------> PostgreSQL       NEAR Testnet
  |                                      |                ^
  | near-api-js                          | profiles       |
  | view/call/deploy                     | deals          |
  +--------------------------------------+ events          |
                                         reports         |
                                         returns         |
                                                          |
                            one Rust contract per deal ---+
```

## Major Components

### Browser application

Responsibilities:

- role-specific presentation;
- wallet connection and NEP-413 message signing;
- JWT session storage;
- API requests;
- direct wallet-signed contract calls for selected user actions;
- transaction and lifecycle presentation.

### Express API

Responsibilities:

- authentication and authorization;
- profile, deal, report, cycle, event, and return APIs;
- contract deployment and admin-signed calls;
- NEAR view calls;
- database migrations and development seed;
- role-scoped data access.

### PostgreSQL

Responsibilities:

- indexing deployed deal contracts;
- mapping deals to farmer and investor wallet accounts;
- legacy users and role records;
- onboarding and investor profiles;
- farmer funding confirmations and reports;
- application event history;
- manually recorded return ledger and derived ROI summaries.

### NEAR contract

Responsibilities:

- immutable deal parameters after initialization;
- lifecycle state;
- exact native NEAR funding amount;
- profit split, platform fee, escrow contribution, and loss handling;
- pull-payment balances;
- native NEAR withdrawals.

## Deal Creation Flow

1. An authorized admin submits deal parameters to `POST /api/admin/deals`.
2. The backend creates a new subaccount under `NEAR_ADMIN_ACCOUNT`.
3. It transfers 2 NEAR to the subaccount, adds a generated FullAccess key, deploys WASM, and calls `new`.
4. The backend inserts the contract address and duplicated deal metadata into PostgreSQL.
5. It records a `deployed` database event with the deployment transaction hash.
6. The API returns the deal and transaction identifiers.

This is not atomic across NEAR and PostgreSQL. A successful chain deployment followed by a failed database insert can leave an unindexed contract. No reconciliation job is implemented.

## Lifecycle Data Flow

### On-chain

- `Initialized`, `Funded`, `CycleActive`, `CycleSettlement`, `Completed`, or `Terminated` status;
- current cycle number;
- farmer, investor, platform, and escrow balances;
- funding deposit;
- reported profit deposit and declared loss amount;
- withdrawal transfers.

### Off-chain

- user and investor profiles;
- deal titles and descriptions;
- application event history and transaction hash index;
- farmer confirmation that cycle funding was received;
- farmer report title, body, amount used, and evidence URL;
- manually entered return records and ROI summaries;
- UI-facing pilot and portfolio presentation.

### Duplicated or derived data

Deal participants and economic parameters exist in the contract and database. Contract status and balances are read from NEAR at request time. Event and return views mix on-chain transaction references with off-chain business records.

## Wallet Authentication Flow

1. Frontend requests `POST /api/wallet-auth/challenge`.
2. Backend creates a random 32-byte nonce with a five-minute lifetime and stores it in an in-memory map.
3. MyNearWallet signs a NEP-413-style message for the fixed recipient `farab.testnet` on Testnet.
4. Frontend posts account, public key, signature, nonce, and callback URL to `/api/wallet-auth/verify`.
5. Backend reconstructs candidate payloads, verifies the Ed25519 signature, and checks that the key is a FullAccess key for the account through NEAR RPC.
6. Backend consumes the nonce and issues a one-day JWT with type `wallet-auth-poc`.
7. Protected wallet routes derive identity from the JWT `account_id`.
8. The profile endpoint routes a new wallet to onboarding and an existing wallet to its farmer or investor portal.

Current limitations:

- nonces are process-local and disappear on restart;
- multi-instance deployment would require shared nonce storage or sticky routing;
- network and recipient are hardcoded for the Testnet proof of concept;
- only FullAccess keys are accepted;
- auth service logging is too verbose for production;
- CORS is unrestricted;
- JWTs are stored in browser-accessible storage.

## Legacy Authentication Flow

1. Username and password are submitted to `/api/auth/login`.
2. Password is verified with bcrypt.
3. Backend issues a seven-day role JWT.
4. Legacy `/api/me` and admin routes use this token.
5. Admin can register additional users through `/api/auth/register`.

Admin routes also accept an allowlisted Testnet wallet JWT. The local development code includes `farab.testnet`; production requires `ADMIN_WALLET_ALLOWLIST`.

## Withdrawal Paths

The current code contains more than one signing pattern:

- farmer UI uses a direct wallet-signed `withdraw` call;
- investor API withdrawal calls the backend service;
- the contract allows the investor or configured `investor_withdraw_signer` to trigger payment to the investor;
- admin/platform flows use backend signing;
- `withdrawContractAs` currently ignores its `accountId` argument and uses the admin account.

The intended role of each signer should be simplified and documented before beta.

## Current Deployment Model

### Repository configuration

- frontend: static Vite build, documentation points to Vercel;
- backend: both Render and Railway configuration exist;
- database: external PostgreSQL through `DATABASE_URL`;
- blockchain: NEAR Testnet with FastNEAR RPC by default;
- WASM: a compiled artifact is copied to `backend/contract/agripartners.wasm` for deployment.

### Observed on 2026-06-19

- `https://agripartners.vercel.app` returned HTTP 200;
- `https://agripartners.onrender.com/health` returned HTTP 404;
- `https://agripartners.onrender.com/api/deals` returned HTTP 404.

The frontend is hardcoded to the documented Render URL outside local development. Therefore the public UI may load while API-backed flows fail. Deployment ownership and the canonical production-like backend URL need to be resolved before external technical review.

## Architecture Risks to Review

- non-atomic chain/database writes;
- centralized admin and backend signer keys;
- unclear investor signer delegation;
- process-local authentication nonces;
- duplicate contract and database state without reconciliation;
- off-chain reports and returns without attestation;
- public deal endpoints exposing all indexed deal metadata;
- no rate limiting, request schema framework, or documented audit logging;
- no queue or retry model for RPC and transaction failures;
- no formal contract upgrade or migration strategy.
