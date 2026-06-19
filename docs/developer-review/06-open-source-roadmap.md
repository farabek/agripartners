# Open Source Roadmap

## Current Position

AgriPartners exposes application, API, database migration, NEAR integration, contract, and test code in one repository. This is enough for an initial technical review, but the project is not yet packaged as a mature open-source project.

The root README shows an MIT license badge, but no `LICENSE` file was found in the current repository inventory. There is also no contribution guide, code of conduct, public security policy, issue template, pull-request template, or repository CI workflow.

## Contribution Principles

Recommended principles:

- keep production finance claims separate from Alpha and Testnet behavior;
- require tests for contract accounting and authorization changes;
- never commit private keys, JWT secrets, database credentials, or personal pilot data;
- prefer small, independently reviewable contributions;
- document on-chain and off-chain effects for every lifecycle change;
- treat legal, compliance, and custody decisions as explicit design inputs;
- make public-good components reusable outside AgriPartners where practical.

## High-Value Contribution Areas

### 1. Reproducible contract pipeline

- Linux CI for formatting, linting, unit tests, WASM build, and sandbox tests;
- pinned Rust toolchain;
- deterministic build instructions;
- published WASM hash and source revision;
- artifact provenance check for `backend/contract/agripartners.wasm`.

### 2. Contract safety

- accounting invariants and property-based tests;
- withdrawal promise-failure recovery;
- structured NEP-297 events;
- signer and role simplification;
- pause, dispute, and emergency design review;
- upgrade and migration strategy;
- external audit preparation.

### 3. Testnet evidence tooling

- canonical deployment registry;
- read-only verification script for contract parameters, status, and balances;
- explorer links generated from event records;
- end-to-end lifecycle test against a disposable Testnet account;
- chain/database consistency report.

### 4. API quality

- OpenAPI specification;
- shared request schemas;
- consistent response and error model;
- API versioning;
- integration tests with PostgreSQL and NEAR sandbox;
- idempotency keys for state-changing operations;
- transaction retry and reconciliation strategy.

### 5. Authentication and key management

- shared expiring nonce store;
- restricted CORS and rate limiting;
- secure logging policy;
- removal or deprecation plan for legacy authentication;
- hardware-backed or managed signing approach;
- direct wallet signing where appropriate;
- least-privilege access keys instead of broad FullAccess assumptions where feasible.

### 6. Real-world evidence

- reusable attestation schema for farm milestones;
- evidence hashing and provenance;
- reviewer or oracle role design;
- privacy-preserving treatment of farmer documents;
- dispute and correction workflow;
- separation of public metadata from confidential business records.

### 7. Developer experience

- actual open-source license file;
- `CONTRIBUTING.md` and `SECURITY.md`;
- environment template matching current runtime requirements;
- one-command local PostgreSQL setup;
- architecture decision records;
- seeded demo that never relies on private production data;
- documented supported operating systems.

## Proposed Milestones

### Milestone 1: Reviewable Alpha

Target outcome: any NEAR developer can clone, test, build, and inspect one contract lifecycle.

- add license and contribution policy;
- add Linux CI;
- make all backend and contract tests pass in CI;
- publish OpenAPI draft;
- publish one reproducible Testnet deployment;
- fix canonical backend deployment and health endpoint;
- document exact environment variables;
- reconcile README claims with implementation.

### Milestone 2: Secure Testnet Beta

Target outcome: limited external testers can use the system with clear trust and failure boundaries.

- complete threat model;
- redesign signer custody;
- add shared nonce storage, rate limiting, and restricted CORS;
- add contract events and reconciliation;
- implement withdrawal failure handling;
- add end-to-end wallet and sandbox tests;
- formalize report evidence and data privacy;
- add monitoring, backups, and incident runbook.

### Milestone 3: Mainnet Design Candidate

Target outcome: architecture is ready for audit and jurisdiction-specific legal review.

- freeze contract scope for audit;
- complete invariant and economic testing;
- decide native NEAR versus fungible-token settlement;
- define upgrade and emergency governance;
- complete external audit and remediation;
- document KYC, AML, custody, investor eligibility, and securities assumptions;
- validate real-world attestation approach;
- demonstrate sustained pilot usage and operational ownership.

### Milestone 4: Ecosystem-Reusable Components

Target outcome: contributions create value beyond one application.

- extract reusable RWA lifecycle event schema;
- publish farm or real-world milestone attestation interfaces;
- contribute wallet, indexing, or verification improvements upstream;
- document reference architecture for hybrid NEAR RWA applications;
- evaluate Chain Abstraction only where it solves a validated user problem.

## Suggested Good First Issues

These are recommendations, not existing issue assignments:

1. add `LICENSE`, `CONTRIBUTING.md`, and `SECURITY.md`;
2. add CI for backend tests and frontend build;
3. make contract tests run in Linux CI;
4. generate a WASM checksum and source-revision manifest;
5. draft OpenAPI for public and wallet-auth routes;
6. add a Testnet read-only verification script;
7. standardize API errors;
8. add NEP-297 lifecycle events;
9. replace verbose wallet-auth logs with structured redacted logs;
10. document and test chain/database reconciliation.

## Technical Priority Order

1. reproducibility;
2. security and signer trust;
3. contract accounting and failure handling;
4. public Testnet evidence;
5. API consistency and observability;
6. real-world data verification;
7. feature expansion.

The project will gain more ecosystem value from reliable evidence and reusable infrastructure than from adding another dashboard feature before the current trust model is reviewed.
