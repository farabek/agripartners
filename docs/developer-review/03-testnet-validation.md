# Testnet Validation

## Validation Standard

This document separates four kinds of evidence:

1. implementation found in source code;
2. automated local tests;
3. build verification;
4. independently reproducible public Testnet evidence.

These are not interchangeable. A mocked API test does not prove a live Testnet transaction, and a project narrative does not replace a contract ID and transaction hash.

## Implemented Testnet Features

### Wallet identity

- Testnet Wallet Selector configuration;
- MyNearWallet message signing;
- random nonce challenge;
- NEP-413-style payload reconstruction and signature verification;
- Testnet FullAccess key lookup;
- one-day wallet JWT;
- wallet-linked farmer and investor authorization.

### Contract lifecycle

- per-deal contract account creation;
- WASM deployment and initialization;
- exact native NEAR funding;
- admin cycle start;
- payable cycle reporting;
- status and balance views;
- farmer, investor, and platform withdrawal paths;
- transaction hash storage in database events.

### Product workflows

- investor deal and portfolio views;
- farmer deal visibility;
- farmer funding confirmation;
- farmer report submission;
- admin deal creation and lifecycle controls;
- off-chain return ledger and summary;
- on-chain status and balance display.

## Automated Verification Performed

### Backend

Command:

```text
cd backend
npm test -- --runInBand
```

Result on 2026-06-19:

- 20 test suites passed;
- 226 tests passed;
- no snapshots;
- runtime approximately 8.7 seconds.

The suite covers route authorization, wallet signature logic, database services, NEAR client configuration, NEAR service calls, role flows, frontend source invariants, reports, returns, and dashboard behavior. Most NEAR service tests use mocks; they verify call construction rather than live chain execution.

### Frontend build

Command:

```text
cd frontend
npm run build:wallet-poc
```

Result on 2026-06-19:

- build passed;
- 408 modules transformed;
- both the main application and wallet-auth proof-of-concept entry points were produced.

Vite warned that Node `http`, `https`, `crypto`, and `util` modules used by transitive NEAR packages were externalized for browser compatibility. The build succeeded, but wallet flows should still be tested in the deployed browser bundle.

### Contract tests

The repository contains:

- 22 Rust unit tests in `contract/src/lib.rs`;
- 4 near-workspaces sandbox tests in `contract/tests/integration.rs`.

The integration test file is explicitly disabled on Windows. On the current Windows host, `cargo test` and `cargo check --lib` were blocked while compiling `near-vm-runner 0.28.0` because it imported Unix-only `rustix::fs` APIs. No contract test assertion ran in that attempt.

Required follow-up: run unit and sandbox integration tests in Linux CI using the pinned Rust and WASM toolchain, then publish the exact command and result.

## Public Deployment Check

Read-only checks on 2026-06-19 found:

| Target | Result |
| --- | --- |
| Documented frontend | HTTP 200 |
| Documented backend `/health` | HTTP 404 |
| Documented backend `/api/deals` | HTTP 404 |

This means the currently documented public stack cannot be treated as an independently verified end-to-end deployment.

## Reproducible On-Chain Evidence

The current technical documentation does not provide a canonical list containing:

- deployed Testnet contract IDs;
- deployment transaction hashes;
- funding transaction hashes;
- cycle transaction hashes;
- withdrawal transaction hashes;
- expected view results for each contract;
- timestamp and source commit for the evidence.

The code can create these artifacts, and database events can store transaction hashes, but reviewers cannot reproduce current Testnet claims from the repository alone.

## Current Limitations

- Testnet only; no Mainnet evidence.
- Native NEAR amounts only; no stablecoin or fungible-token settlement.
- No contract audit or published threat model.
- No public canonical deployment registry.
- No working documented public backend at review time.
- Contract tests are not currently proven in cross-platform CI.
- Farmer reports and manual return records remain off-chain.
- Contract administration and some transaction signing are centralized.
- Wallet-auth nonce storage is not suitable for horizontally scaled deployment.
- Real-world data is not independently attested.
- Contract and database writes are not reconciled automatically.

## Minimum Validation Packet for DevHub

Before sending the review request, create a read-only evidence table with:

| Evidence | Required value |
| --- | --- |
| Source revision | Git commit SHA used for deployment |
| WASM provenance | Build command and SHA-256 hash |
| Network | `testnet` |
| Contract | Canonical contract ID |
| Deployment | Explorer transaction URL |
| Funding | Explorer transaction URL and expected amount |
| Lifecycle | Start/report transaction URLs and expected status |
| Withdrawal | Explorer transaction URL and expected recipient |
| Views | Captured `get_status`, `get_balances`, and `get_params` results |
| API | Working health and read endpoint |
| Test result | Linux CI links for backend, frontend, unit, and sandbox tests |

## Validation Readiness Assessment

**Implementation evidence:** moderate to strong for an Alpha.

**Automated backend evidence:** strong.

**Frontend build evidence:** good, with browser compatibility warnings to retest.

**Contract test evidence on this host:** incomplete.

**Public end-to-end evidence:** weak.

**Mainnet evidence:** absent.

The next technical milestone should be reproducibility, not additional feature breadth.
