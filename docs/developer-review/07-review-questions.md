# Review Questions for NEAR DevHub

## Review Objective

AgriPartners is seeking technical direction for a secure Testnet beta and a clearer contribution path within the NEAR ecosystem. It is not asking reviewers to approve production readiness or funding.

## Focused Questions

### 1. On-chain boundary

Is the current division appropriate: financial lifecycle and balances on-chain, with profiles, farmer reports, return records, and UI events in PostgreSQL? Which data or commitments would create meaningful additional trust if moved on-chain or anchored by hashes?

### 2. Contract scope

Is one contract per agricultural deal a reasonable Alpha architecture? At what scale should the project consider a factory, shared contract, account abstraction pattern, or indexed registry?

### 3. Accounting model

Do the profit split, platform fee, farmer escrow contribution, loss handling, capital return, and pull-payment rules preserve solvency and expected incentives? Which invariants and adversarial cases should be tested before audit?

### 4. Withdrawal safety

The contract clears the internal available balance before issuing a transfer promise and has no callback recovery path. What is the preferred NEAR pattern for safe withdrawal failure handling and idempotent retries?

### 5. Signer architecture

Which actions should be direct wallet calls, backend-signed calls, multisig-controlled calls, or delegated access-key calls? Is the current `investor_withdraw_signer` pattern appropriate, and how should backend key custody be redesigned?

### 6. Events and indexing

Should the contract emit NEP-297 events for funding, cycle transitions, settlement, termination, and withdrawals? Which NEAR indexer or data-access approach would best replace or reconcile the current database event feed?

### 7. Authentication

Is the NEP-413-style challenge flow aligned with current NEAR wallet-auth best practices? Should the service require FullAccess keys, and what changes are needed for shared nonce storage, session security, and production wallet compatibility?

### 8. Testnet-to-Mainnet path

What are the minimum technical gates before Mainnet consideration: Linux CI, sandbox coverage, audit, managed keys, event standards, monitoring, stable-value settlement, upgrade design, or other requirements?

### 9. Real-world data

What NEAR-native or ecosystem patterns are suitable for attesting farmer milestones and evidence without publishing confidential documents? Are there relevant oracle, attestation, identity, or privacy projects to evaluate?

### 10. Ecosystem contribution

Which component would create the most value for NEAR beyond AgriPartners itself: a reusable RWA lifecycle standard, agriculture evidence schema, contract template, reconciliation tool, wallet flow, or open-source reference architecture?

## Requested Review Output

A useful first response would identify:

- the three highest-risk technical assumptions;
- the recommended on-chain/off-chain boundary;
- the preferred signer model;
- one Testnet validation standard to meet;
- one NEAR ecosystem project or maintainer to consult;
- one reusable open-source contribution worth extracting.

## Materials for the Reviewer

- [Developer Review Kit](README.md)
- `contract/src/lib.rs`
- `contract/tests/integration.rs`
- `backend/src/services/nearService.js`
- `backend/src/services/walletAuthService.js`
- `backend/src/routes/`
- `backend/src/db/migrations/`
- `frontend/app.js`
- `docs/presentation-readiness/05-near-use-case.md`
- `docs/near-testnet.md`

## Questions Deliberately Out of Scope

This technical review does not ask DevHub to decide:

- whether the project is a regulated security or lending product;
- whether pilot economics are commercially attractive;
- whether Mainnet deployment is legally permitted;
- whether AgriPartners should receive a grant;
- whether current demo metrics prove market traction.

Those questions require separate legal, commercial, and ecosystem processes.
