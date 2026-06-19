# AgriPartners Alpha v1 Developer Review Kit

Snapshot date: 2026-06-19

This package gives NEAR ecosystem developers and technical reviewers a concise, code-grounded view of AgriPartners Alpha v1. It is designed for a 15-20 minute first review.

AgriPartners is an agricultural investment workflow with investor, farmer, and admin interfaces. The current implementation combines a browser application, an Express API, PostgreSQL application state, and one NEAR smart contract per deal.

## Scope and Claims

This kit describes what is present in the repository. It does not claim:

- Mainnet deployment;
- audited smart contracts;
- production financial operations;
- verified regulatory readiness;
- that every application event is stored on-chain;
- that the documented public backend is currently operational.

Where older project documentation and code differ, this kit treats current source code, manifests, migrations, and tests as the stronger evidence.

## Recommended Reading Order

| Time | Document | Purpose |
| ---: | --- | --- |
| 2 min | [Technical Overview](01-technical-overview.md) | Stack, responsibilities, and current boundaries |
| 3 min | [Architecture](02-architecture.md) | Components, data flow, authentication, and deployment |
| 3 min | [Testnet Validation](03-testnet-validation.md) | What was verified and what remains unverified |
| 3 min | [Smart Contract Status](04-smart-contract-status.md) | Implemented contract behavior and risks |
| 3 min | [API Overview](05-api-overview.md) | Routes, authorization, and role flows |
| 2 min | [Open Source Roadmap](06-open-source-roadmap.md) | Contribution areas and milestones |
| 2 min | [Review Questions](07-review-questions.md) | Focused questions for NEAR DevHub reviewers |

## Bilingual Testnet Evidence Packet

- [English Testnet Evidence Packet](08-testnet-evidence-packet.md)
- [Russian Testnet Evidence Packet](18-testnet-evidence-packet-ru.md)

## Repository Entry Points

- Frontend: `frontend/index.html`, `frontend/app.js`, `frontend/style.css`
- Wallet proof of concept: `frontend/wallet-auth-poc.html`, `frontend/wallet-auth-poc-app.js`
- Backend: `backend/server.js`, `backend/src/app.js`
- API routes: `backend/src/routes/`
- PostgreSQL migrations: `backend/src/db/migrations/`
- NEAR integration: `backend/src/near/client.js`, `backend/src/services/nearService.js`
- Smart contract: `contract/src/lib.rs`
- Contract tests: `contract/src/lib.rs`, `contract/tests/integration.rs`
- Backend tests: `backend/tests/`

## Verification Snapshot

Checks performed on 2026-06-19:

| Check | Result |
| --- | --- |
| Backend Jest suite | Passed: 20 suites, 226 tests |
| Frontend Vite production build | Passed; dependency externalization warnings were emitted |
| Rust contract test command on Windows | Blocked during dependency compilation by `near-vm-runner` using Unix-only `rustix::fs` APIs |
| Contract tests present in source | 22 unit tests and 4 sandbox integration tests |
| Documented frontend URL | Responded with HTTP 200 |
| Documented backend `/health` and `/api/deals` URLs | Responded with HTTP 404 |
| Public Testnet contract IDs and transaction hashes in current technical docs | Not available for independent replay or inspection |

The Rust failure is an environment/toolchain compatibility result, not evidence that a contract assertion failed. Contract tests should be rerun in the supported Linux CI environment before review.

## Technical Readiness Assessment

| Area | Assessment | Reason |
| --- | --- | --- |
| Developer review readiness | Good | Code, tests, boundaries, and known gaps can be reviewed in one package. |
| Alpha implementation readiness | Moderate | Core portal, API, database, wallet-auth, and contract paths exist; backend tests and frontend build pass. |
| Reproducible Testnet validation | Limited | Current docs do not publish a canonical contract registry or transaction evidence, and the documented API URL returns 404. |
| Security readiness | Early | No audit, centralized backend signers, permissive CORS, verbose wallet-auth logging, and no documented threat model. |
| Mainnet readiness | Low | Audit, legal review, key management, observability, deployment recovery, and end-to-end evidence remain incomplete. |
| Open-source readiness | Early | Public code exists, but the referenced MIT license file, contribution guide, CI workflow, issue templates, and API specification are absent. |

## Recommended Reviewer Outcome

The most useful first review is not a grant or Mainnet approval. It is a technical direction review covering:

1. the on-chain/off-chain boundary;
2. signer and wallet architecture;
3. contract accounting and withdrawal safety;
4. reproducible Testnet evidence;
5. the smallest credible path to a secure beta.

## Source Basis

This package was derived from the current repository, including:

- runtime manifests and lockfiles;
- backend route, service, middleware, and migration files;
- frontend wallet and API integration code;
- Rust contract and tests;
- deployment configuration;
- `README.md`, `docs/near-testnet.md`, and presentation-readiness documentation.

No project code, contract logic, or database state was changed while creating this package.
