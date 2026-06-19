# Testnet Evidence Packet

## Overview

This document packages the evidence currently available for AgriPartners Alpha v1 implementation, testing, and NEAR Testnet use. It is intended for technical reviewers who need to distinguish reproducible evidence from implementation claims and future plans.

Current status:

- product stage: **Alpha v1**;
- blockchain environment: **NEAR Testnet**;
- production/Mainnet status: **not deployed or claimed**;
- evidence snapshot date: **2026-06-19**.

Evidence labels used below:

- **Verified locally:** reproduced with a command during preparation of this packet.
- **Verified in source:** directly supported by current repository code or tests.
- **Documented:** stated by current project documentation but not independently reproduced from a public identifier.
- **Planned:** not implemented in the current repository.

## Repository Summary

### Repository identity

- repository: [github.com/farabek/agripartners](https://github.com/farabek/agripartners);
- remote: `https://github.com/farabek/agripartners.git`;
- local branch observed: `main`;
- remote branch observed: `origin/main`;
- no additional local or remote branches were reported by `git branch -a`;
- evidence baseline commit observed: `42b62e4ef872c51a1ebc15ded37cb40fcc8c66aa`.

The commit identifier records the baseline inspected for this packet. The new developer-review documents may remain uncommitted and are not represented by that hash.

### Project structure

| Path | Responsibility |
| --- | --- |
| `frontend/` | Vite browser application, Wallet Selector integration, investor/farmer/admin portals |
| `backend/` | Express API, PostgreSQL migrations, authentication, NEAR client, tests |
| `contract/` | Rust NEAR contract, unit tests, sandbox integration tests |
| `docs/` | Product, Testnet, demo, launch, investor, and developer-review documentation |
| `demo.ps1` | Interactive API-driven lifecycle demonstration |
| `backend/scripts/pilot-deal-2-complete.js` | Scripted pilot lifecycle helper |
| `render.yaml` | Render backend deployment model |
| `backend/railway.toml` | Railway backend deployment model |

### Source-of-truth order

When documents disagree, reviewers should use this order:

1. current source code and migrations;
2. current manifests and lockfiles;
3. automated tests;
4. this developer-review package;
5. older root and presentation documentation.

## Test Results

### Backend test suite

Command rerun on 2026-06-19:

```text
cd backend
npm test -- --runInBand
```

Verified result:

| Metric | Result |
| --- | ---: |
| Test suites | 20 passed / 20 total |
| Tests | 226 passed / 226 total |
| Snapshots | 0 |
| Reported runtime | 9.285 seconds |

Coverage areas represented by the test files include routes, authorization, wallet signature verification, PostgreSQL services, NEAR client configuration, contract-call construction, investor and farmer flows, reports, returns, and frontend source behavior.

Most NEAR service tests use mocks. They verify arguments and application behavior, not live Testnet execution.

### Frontend production build

Command rerun on 2026-06-19:

```text
cd frontend
npm run build:wallet-poc
```

Verified result:

- status: passed;
- Vite version: 8.0.16;
- modules transformed: 408;
- main application and wallet-auth proof-of-concept entries built;
- reported build time: 464 milliseconds.

Warnings stated that transitive NEAR dependencies referenced Node `crypto`, `http`, `https`, and `util` modules that Vite externalized for browser compatibility. Build success does not replace deployed browser-flow testing.

### Rust contract tests

Verified source inventory:

- 22 unit tests in `contract/src/lib.rs`;
- 4 sandbox integration tests in `contract/tests/integration.rs`.

Current-host result:

- `cargo test` did not reach test execution on Windows;
- compilation was blocked by `near-vm-runner 0.28.0` importing Unix-only `rustix::fs` APIs;
- the integration test file is explicitly disabled on Windows.

This is an environment/toolchain limitation, not a passing contract test result. Linux CI evidence is required before external review.

## Verified Features

| Feature | Status | Evidence source |
| --- | --- | --- |
| Wallet Authentication | Implemented; backend-tested; deployed flow not rerun in this packet | `frontend/app.js`; `backend/src/services/walletAuthService.js`; `walletAuthService.test.js`; `frontend.auth-flow.test.js` |
| Investor Portal | Implemented; backend and frontend behavior tested | `frontend/app.js`; `backend/src/routes/investor.js`; `investor.routes.test.js`; `frontend.investor-portal.test.js` |
| Farmer Portal | Implemented; backend and frontend behavior tested | `frontend/app.js`; `backend/src/routes/farmer.js`; `farmer.routes.test.js`; `frontend.farmer-dashboard.test.js` |
| Marketplace | Implemented in frontend; dedicated current screenshot remains incomplete | `frontend/app.js`; `docs/investor-portal.md`; `docs/demo-assets/01-demo-assets-inventory.md` |
| Admin Dashboard | Implemented; route and frontend behavior tested | `frontend/app.js`; `backend/src/routes/admin.js`; `admin.routes.test.js`; `frontend.admin-portal.test.js` |
| Funding Progress | Implemented in product views; current dedicated screenshot missing | `frontend/app.js`; `docs/demo-assets/01-demo-assets-inventory.md`; investor/admin frontend tests |
| ROI and Returns | Implemented as UI calculations and PostgreSQL return records; not wholly on-chain | `backend/src/routes/admin.js`; `backend/src/routes/investor.js`; `backend/src/services/dealService.js`; `frontend.investor-portal.test.js`; `docs/product-roadmap/05-roi-returns-final-audit.md` |
| Portfolio Dashboard | Implemented; frontend tests pass; screenshot inventory marks refresh as needed | `frontend/app.js`; `frontend.investor-portal.test.js`; `docs/product-roadmap/07-investor-portfolio-dashboard-audit.md`; demo inventory |
| Farmer Reports | Implemented off-chain in PostgreSQL; route and UI tests pass | migration `007_farmer_reports.sql`; `farmer.routes.test.js`; `frontend.farmer-reports.test.js` |
| Cycle Tracking | Hybrid implementation: contract cycle state plus PostgreSQL report/update state | `contract/src/lib.rs`; `backend/src/services/dealService.js`; admin, farmer, and investor route tests |
| Event History | Implemented as PostgreSQL events that may reference NEAR transaction hashes; not contract-emitted events | migration `001_initial.sql`; `backend/src/services/dealService.js`; deal and portal tests |

### Interpretation

The feature table verifies implementation and automated application behavior. It does not prove that every feature is currently reachable through the public deployment or that every business event is on-chain.

## NEAR Testnet Evidence

### Testnet accounts found in current sources

| Account | Source | Evidence meaning |
| --- | --- | --- |
| `farab.testnet` | `render.yaml`, wallet-auth recipient and local admin allowlist, `demo.ps1` | Configured/demo account name; not a transaction record by itself |
| `farmer-ap.testnet` | default in `backend/scripts/pilot-deal-2-complete.js` | Script default; current account control and activity not independently verified |
| `investor-ap.testnet` | default in `backend/scripts/pilot-deal-2-complete.js` | Script default; current account control and activity not independently verified |
| `agripartners-demo.testnet` | `contract/demo.sh` | Demonstration script value; not confirmed as the canonical current deployment |
| `farmer.testnet`, `investor.testnet`, `agripartners.testnet` | `contract/demo.sh` | Demonstration placeholders; not accepted as live evidence |

Account names used only in automated test fixtures are not treated as public Testnet deployment evidence.

### Contract evidence

**Implemented in source:**

- backend deployment creates `ap<timestamp>.<NEAR_ADMIN_ACCOUNT>`;
- deployment transfers account funding, adds a key, deploys WASM, and initializes the contract;
- the contract implements funding, cycle state, settlement accounting, balances, and withdrawals;
- scripts print returned contract addresses and transaction hashes when executed;
- PostgreSQL events can store transaction hashes.

**Not present in the current evidence package:**

- canonical deployed contract ID;
- deployment transaction hash;
- funding transaction hash;
- cycle start/report transaction hashes;
- withdrawal transaction hash;
- explorer links;
- captured `get_params`, `get_status`, and `get_balances` results;
- WASM checksum linked to a source commit.

Therefore public on-chain evidence is **incomplete**. This packet does not invent or infer contract IDs from test fixtures.

### Demonstrated workflows

**Implemented and represented by scripts or documentation:**

1. create a deal and deploy its contract;
2. fund the deal;
3. start a cycle;
4. report cycle profit and loss;
5. view status and balances;
6. repeat cycles until completion or termination;
7. withdraw farmer, investor, or platform balances;
8. store transaction references in application event history.

**Documented product demonstration:**

- completed Fidlot profile;
- active Hissar profile;
- investor, farmer, and admin views;
- funding, reporting, ROI, returns, and portfolio presentation.

Without canonical transaction links, these are implementation and documentation evidence rather than independently replayable live-chain proof.

### Planned, not implemented as production evidence

- NEAR Mainnet deployment;
- audited production contract;
- stable-value or fungible-token settlement;
- contract upgrade and migration process;
- decentralized real-world attestation;
- pooled multi-investor contracts;
- production key management and incident recovery;
- complete on-chain farmer reports and return ledger.

## API Verification

### Major endpoint groups

| Group | Examples | Authentication |
| --- | --- | --- |
| Health | `GET /health` | Public |
| Public deals | `GET /api/deals`, status, balances, events | Public |
| Legacy auth | `POST /api/auth/login`, `/register` | Login public; registration admin JWT |
| Wallet auth | `POST /api/wallet-auth/challenge`, `/verify` | Public challenge/verification flow |
| Profile | `/api/profile/me`, `/onboarding` | Wallet JWT |
| Investor | `/api/investor/deals`, profile, cycles, reports, returns, withdrawal | Wallet JWT and investor ownership checks |
| Farmer | `/api/farmer/deals`, funding confirmation, report submission | Wallet JWT and farmer ownership checks |
| Admin | deal deployment, lifecycle, funding, returns, withdrawals | Admin JWT or allowlisted wallet JWT |
| Legacy user | `GET /api/me/deals` | Legacy JWT |

### Verified workflows

Backend tests passed for:

- username/password login and role JWT behavior;
- wallet challenge, signature, nonce, and FullAccess key checks;
- wallet-scoped investor and farmer access;
- profile onboarding and updates;
- admin authorization;
- deal reads and ownership restrictions;
- report and return operations;
- NEAR client configuration and contract-call construction.

### Public API observation

On 2026-06-19:

- `https://agripartners.onrender.com/health` returned HTTP 404;
- `https://agripartners.onrender.com/api/deals` returned HTTP 404;
- `https://agripartners.vercel.app` returned HTTP 200.

The backend is therefore not verified as publicly operational at the URL currently hardcoded by the frontend and documented in the root README.

## Demo Evidence

| Evidence set | Location | Current status |
| --- | --- | --- |
| Launch Kit | `docs/LAUNCH_KIT.md` | Primary navigation document |
| Demo Assets Inventory | `docs/demo-assets/01-demo-assets-inventory.md` | Records available and missing assets |
| Demo Flow | `docs/presentation-readiness/02-demo-flow.md` | Ready as walkthrough guidance |
| Demo Script | `docs/presentation-readiness/06-demo-script.md` | Ready as presentation guidance |
| Pitch Deck | `docs/pitch-deck/README.md` and `docs/investor-package/` | Available |
| Investor Brief | `docs/investor-pack/investor-brief.md` | Available |
| Screenshots | `docs/screenshots/` | Investor, farmer, admin, and demo images available |
| Interactive lifecycle script | `demo.ps1` | Available; requires configured local backend and Testnet credentials |

Verified demo-asset limitations from the inventory:

- no dedicated current Marketplace screenshot;
- Portfolio Dashboard screenshot needs refresh;
- no dedicated Funding Progress screenshot;
- several filenames contain `.png.png`;
- no public recorded demo walkthrough link;
- latest UI state is not fully represented by the screenshot set.

## Known Limitations

- Alpha v1 only.
- NEAR Testnet only.
- No Mainnet deployment evidence.
- No smart contract audit.
- No public canonical contract and transaction evidence set.
- Rust contract tests were not executable on the current Windows host because of dependency/platform incompatibility.
- The documented public backend returned HTTP 404 during verification.
- The frontend production build passes but emits browser-externalization warnings from transitive NEAR dependencies.
- Farmer reports and manual returns are stored off-chain.
- Application event history is PostgreSQL-based and is not a NEP-297 contract event stream.
- Backend signer keys and centralized admin actions remain part of the trust model.
- Wallet-auth nonces are in process memory.
- CORS is unrestricted and rate limiting is absent.
- Contract deployment and PostgreSQL indexing are not atomic.
- No documented contract upgrade, pause, dispute, or transfer-failure recovery process.
- No verified legal, KYC/AML, custody, securities, or jurisdictional production readiness.
- Root README claims and deployment links require reconciliation with current implementation.

## Reproduction Guide

### 1. Clone

```bash
git clone https://github.com/farabek/agripartners.git
cd agripartners
git checkout main
```

For exact evidence comparison, record `git rev-parse HEAD` before testing.

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure backend

The current runtime requires a PostgreSQL database and these effective variables:

```text
DATABASE_URL
API_KEY
NEAR_ADMIN_ACCOUNT
NEAR_ADMIN_PRIVATE_KEY
JWT_SECRET
```

Production seed also requires `ADMIN_PASSWORD`. Optional signer, RPC, and deployment variables are referenced in the source. Do not use production credentials for review.

There is no current `.env.example` in the repository inventory even though the root README refers to one. Create a local untracked `.env` manually and never commit secrets.

### 4. Run backend tests

```bash
cd backend
npm test -- --runInBand
```

The Jest tests configure their own test environment and mock external dependencies where appropriate.

### 5. Run backend

With PostgreSQL and safe Testnet credentials configured:

```bash
cd backend
npm start
```

Startup applies ordered migrations. Outside production it also seeds a default admin when the users table is empty.

Expected local health endpoint:

```text
http://localhost:3000/health
```

### 6. Install and run frontend

```bash
cd frontend
npm install
npm run dev:wallet-poc
```

Vite starts on `127.0.0.1:5173` according to the package script. The build contains both `index.html` and `wallet-auth-poc.html` entry points.

### 7. Build frontend

```bash
cd frontend
npm run build:wallet-poc
```

Review build warnings and test wallet flows in the generated browser bundle.

### 8. Run contract tests on Linux

The current near-workspaces setup is not supported by this Windows verification environment. Use Linux or a Linux CI runner:

```bash
cd contract
cargo test
```

The root README says the project requires Rust 1.86, but no `rust-toolchain` file was found. Pin and publish the actual successful CI toolchain before treating the result as reproducible.

### 9. Build contract WASM on Linux

```bash
cd contract
rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release
```

Record the source commit and SHA-256 checksum of the resulting WASM. Verify that the backend deployment artifact matches it.

### 10. Produce Testnet evidence

Using disposable Testnet accounts and no real funds:

1. deploy one contract;
2. record the contract ID and deployment hash;
3. call `get_params`, `get_status`, and `get_balances`;
4. execute funding, one cycle, and authorized withdrawals;
5. record all explorer links and expected state transitions;
6. export a redacted API event record;
7. add the evidence with source revision and WASM hash.

This final step is a required gap; it was not performed by preparation of this documentation packet.

## Technical Readiness Assessment

| Area | Assessment | Evidence |
| --- | --- | --- |
| Architecture | Moderate Alpha readiness | Clear hybrid component model; trust and reconciliation boundaries need review |
| Backend | Good local Alpha readiness | 20/20 suites and 226/226 tests passed; public deployment unavailable at documented URL |
| Frontend | Good build readiness | Production build passed; live UI responded; API and wallet flows need deployed end-to-end verification |
| Blockchain integration | Implemented, evidence incomplete | Contract and NEAR service code exist; canonical Testnet IDs and transactions are absent |
| Documentation | Good review readiness | Launch, demo, product, and developer-review materials exist; some older claims drift from code |
| Testing | Strong backend, partial contract | Backend suite passes; frontend builds; Rust tests need Linux CI result |
| Overall | Moderate Alpha readiness; low Mainnet readiness | Suitable for technical review, not production financial use |

## Reviewer Checklist

### Repository and build

- [ ] Confirm branch and source commit.
- [ ] Install backend and frontend dependencies from lockfiles.
- [ ] Run all 226 backend tests.
- [ ] Build both frontend entry points.
- [ ] Run Rust unit and sandbox tests in Linux CI.
- [ ] Rebuild WASM and compare its checksum to the backend artifact.

### Architecture

- [ ] Confirm which data is authoritative on-chain and in PostgreSQL.
- [ ] Review non-atomic contract deployment and database indexing.
- [ ] Review contract/database reconciliation requirements.
- [ ] Review public versus wallet-scoped deal endpoints.
- [ ] Review deployment configuration and select one canonical backend platform.

### Authentication and security

- [ ] Review NEP-413 payload construction and FullAccess key requirement.
- [ ] Review process-local nonce storage and JWT browser storage.
- [ ] Review admin allowlist behavior.
- [ ] Review CORS, rate limiting, validation, and logging.
- [ ] Review backend private-key custody and direct wallet alternatives.

### Contract

- [ ] Verify every role and state transition.
- [ ] Test accounting invariants and rounding.
- [ ] Review investor withdrawal signer design.
- [ ] Review failed transfer recovery.
- [ ] Review solvency across profit, loss, escrow, and capital return cases.
- [ ] Decide whether NEP-297 events are required.
- [ ] Define audit, upgrade, pause, and dispute strategy.

### Testnet evidence

- [ ] Verify canonical contract ID on an explorer.
- [ ] Verify deployment and lifecycle transaction hashes.
- [ ] Compare `get_params` with PostgreSQL deal data.
- [ ] Compare `get_status` and `get_balances` with UI/API output.
- [ ] Verify farmer, investor, and platform withdrawal recipients.
- [ ] Confirm the documented backend health endpoint works.

### Product boundaries

- [ ] Confirm farmer reports and return records are described as off-chain.
- [ ] Confirm demo metrics are not presented as production adoption.
- [ ] Confirm Testnet, unaudited, and Alpha limitations appear in external materials.
- [ ] Identify the minimum reusable NEAR ecosystem contribution.

## Evidence Completeness Assessment

Evidence completeness is **partial**.

Strong evidence:

- repository structure and implementation;
- backend automated test result;
- frontend production build;
- route, database, wallet, and contract source;
- demo and presentation assets.

Incomplete evidence:

- passing Linux contract test and WASM build record;
- canonical Testnet contract registry;
- explorer-linked transaction history;
- source-to-WASM provenance;
- working public backend;
- deployed wallet-flow verification;
- audit and security review.

## Remaining Gaps Before External Technical Review

1. restore or replace the public backend and verify `/health` plus one read endpoint;
2. run contract unit and sandbox tests in Linux CI;
3. publish one canonical disposable Testnet lifecycle with explorer links;
4. publish the source commit and WASM checksum used for that deployment;
5. verify the deployed wallet-auth, investor, farmer, and admin paths;
6. reconcile root README claims and URLs with current behavior;
7. prepare a short threat model covering signers, withdrawals, database trust, and real-world reports;
8. remove secrets and personal data from every shared artifact.

After those steps, the packet will support a substantially stronger NEAR DevHub review.
