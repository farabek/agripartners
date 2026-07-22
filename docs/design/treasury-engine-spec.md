# Treasury Engine Architecture Specification

> **Target-architecture override:** Blockchain transfers to a Farmer, Uzbekistan Feedlot Operator,
> or other Uzbekistan participant are prohibited. Cryptocurrency stops at AgriPartners OÜ in
> Estonia. Local disbursements and returns use fiat bank or payment transfer only. Any contrary
> mechanism below is **Legacy Testnet Alpha — historical technical demonstration, not the target
> production financial architecture**.

## 1. Purpose

This specification defines the target Treasury Engine architecture for AgriPartners Alpha v1.1 Phase 20. It is a design document only. It does not authorize or implement a migration, backend API change, application code change, frontend change, or test change.

The Treasury Engine exists to govern all movement of investor capital through the platform. It provides the accounting layer that records where capital is expected to be, why it moved, who authorized the movement, and how that movement relates to deals, investors, farmers, returns, fees, and blockchain execution evidence.

Treasury accounting and blockchain transfers must remain separate concepts:

- Platform accounting records the authoritative business state of capital movement.
- Blockchain transfers execute or evidence movement on a network.
- A blockchain transaction hash is execution evidence, not a replacement for platform accounting.

This follows ADR-001 live-first architecture and ADR-002 financial semantics. Live financial views must be backed by authoritative backend data, and transaction references must not be relabeled as verified, earned, realized, or reconciled without accepted reconciliation rules.

## 2. Treasury Principles

Treasury design is governed by these principles:

- The platform never loses accounting state.
- Every movement of capital is traceable.
- Treasury is ledger-first: the ledger records the intended and observed accounting movement before any UI or calculation treats it as authoritative.
- Blockchain is an execution layer, not the accounting source of truth.
- Blockchain data can support evidence and reconciliation, but it does not replace treasury entries.
- Treasury entries are immutable accounting history.
- Corrections must be additive, auditable entries rather than edits to historical records.
- Demo data must not mask missing, failed, or unreconciled treasury data.

The Treasury Engine should make it possible to answer:

- What amount moved?
- In which currency or token?
- From which logical account to which logical account?
- Which deal, investor, farmer, and business event caused it?
- Who authorized or recorded it?
- Which blockchain transaction, if any, executed or evidenced it?
- Has the movement been reconciled?

## 3. Money Flow

The target lifecycle is:

```text
Investor
-> Treasury
-> Farmer Funding
-> Farmer Operations
-> Farmer Returns
-> Treasury
-> Investor Distribution
```

### Investor -> Treasury

The investor commits or transfers capital into the platform treasury flow.

- Accounting event: investor funds are recorded as received or pending receipt.
- Blockchain transaction: optional network transfer into a treasury wallet or deal contract.
- Business event: investment commitment, funding confirmation, or deal participation.

### Treasury -> Farmer Funding

The platform allocates capital from treasury-controlled funds into a farmer funding workflow.

- Accounting event: capital moves from reserved or investor funds into active investment or farmer funding accounts.
- Blockchain transaction: optional transfer to a farmer, contract, escrow, or operating wallet.
- Business event: deal funding, cycle start, or farmer funding release.

### Farmer Funding -> Farmer Operations

The farmer uses capital for approved operating activity.

- Accounting event: funded capital remains assigned to active investment or operating use.
- Blockchain transaction: may be absent if operations are off-chain.
- Business event: cycle activity, report submission, evidence upload, operational update.

### Farmer Operations -> Farmer Returns

The farmer generates return activity such as repayment, profit share, fee obligation, or correction.

- Accounting event: expected return is recorded, classified, or reserved.
- Blockchain transaction: optional transfer back toward treasury.
- Business event: cycle settlement, repayment claim, return record, profit report.

### Farmer Returns -> Treasury

Returned capital or profit enters treasury-controlled accounting.

- Accounting event: pending returns or available returns increase.
- Blockchain transaction: optional transfer into treasury wallet or contract.
- Business event: return received, marked paid, or moved into reconciliation workflow.

### Treasury -> Investor Distribution

The platform distributes eligible principal or profit to investors.

- Accounting event: available returns move to investor distribution or investor receivable accounts.
- Blockchain transaction: optional payout to investor wallet.
- Business event: distribution approval, payout execution, reconciliation.

Accounting events, blockchain transactions, and business events may occur at different times. The Treasury Engine must not collapse them into one event type.

## 4. Treasury Accounts

Treasury accounts are logical accounting concepts. They are not necessarily separate blockchain wallets, bank accounts, smart contracts, or database tables.

Suggested logical accounts:

| Account | Meaning |
| --- | --- |
| `Investor Funds` | Capital received or expected from investors before it is reserved or deployed. |
| `Reserved Capital` | Capital allocated to a specific deal or obligation but not yet actively deployed. |
| `Active Investments` | Capital deployed into an active farmer/deal workflow. |
| `Pending Returns` | Return amounts expected or claimed but not yet available for investor distribution. |
| `Available Returns` | Returned capital or profit available for approved distribution after required checks. |
| `Platform Fees` | Amounts classified as fees owed to or retained by the platform. |
| `Treasury Wallet` | Logical representation of funds held in a treasury-controlled wallet or contract. |

One physical wallet may back multiple logical accounts. One logical account may later span multiple wallets, networks, or currencies. The ledger must record the accounting movement independently of that physical implementation.

## 5. Ledger Model

Treasury ledger entries should be immutable, append-only records. Each entry represents an accounting movement between logical treasury accounts.

Minimum fields:

| Field | Meaning |
| --- | --- |
| `id` | Treasury ledger entry identifier. |
| `debit_account` | Logical account debited by the movement. |
| `credit_account` | Logical account credited by the movement. |
| `amount` | Positive amount moved. |
| `currency` | Explicit currency or token unit, such as `NEAR` in Alpha. |
| `related_deal_id` | Deal associated with the movement, when applicable. |
| `related_investor` | Investor account associated with the movement, when applicable. |
| `related_farmer` | Farmer account associated with the movement, when applicable. |
| `blockchain_reference` | Optional transaction hash, receipt, contract call, or explorer reference. |
| `business_event_type` | Business reason for the movement, such as funding, return, distribution, fee, or correction. |
| `recorded_by` | Authenticated actor or system component that recorded the ledger entry. |
| `recorded_at` | Server timestamp when the ledger entry was recorded. |
| `metadata` | Optional structured context such as network, wallet, contract, or source document. |

Ledger entries must not be edited to repair mistakes. Corrections should be new entries that reference the affected entry and explain the correction policy.

The ledger should support double-entry style accounting semantics: every movement has a source and destination account. Reporting can then derive balances by summing debits and credits instead of relying on mutable account totals alone.

## 6. Relationship to Typed Return Ledger

The typed return ledger classifies return activity by economic purpose:

- `principal`: return of investor capital;
- `profit`: return above investor capital;
- `fee`: platform or other fee amount, not an investor return;
- `correction`: future additive adjustment under an accepted correction policy.

Treasury movements and typed return entries are related but not identical:

- A treasury ledger entry records movement between logical accounts.
- A typed return entry records a return ledger item associated with a deal.
- A single treasury movement may later support one or more typed return entries if policy allows batching.
- A single typed return entry may require multiple treasury movements if partial payment is later supported.
- Fee movements must not be counted as investor principal or profit.
- Untyped legacy return rows must not become authoritative realized profit through treasury accounting alone.

The Treasury Engine should provide the accounting substrate that typed return entries can reference when they become eligible for payment and reconciliation workflows.

## 7. Relationship to Reconciliation

Reconciliation validates treasury movements, but it does not replace them.

The Treasury Engine records the accounting movement. The Reconciliation Engine checks whether evidence supports the claimed movement. For example, reconciliation may verify:

- amount;
- currency;
- recipient;
- network;
- transaction success;
- deal association;
- return entry association;
- duplicate evidence usage.

A reconciled return or treasury movement still needs its ledger history. Reconciliation status is an audit and validation layer over ledger entries, not a substitute for ledger entries.

## 8. Relationship to NEAR

AgriPartners currently uses NEAR Testnet for pilot smart contract and wallet workflows. Mainnet support is a future production step.

Treasury treatment of NEAR:

- Alpha supports `NEAR` as the explicit monetary unit in current return ledger work.
- NEAR Testnet transaction hashes may be stored as execution references.
- A transaction hash is evidence/reference only until validated by accepted reconciliation rules.
- Mainnet rollout must define network identity, finality requirements, wallet custody, signer policy, contract interaction rules, and explorer/RPC source of truth.

The Treasury Engine should be network-aware but not network-dependent. It should be able to record treasury intent and accounting state even when blockchain execution is pending, failed, unavailable, or off-chain.

## 9. Future APIs

The following APIs are future design candidates only. They are not part of this specification's implementation scope.

```text
GET  /api/admin/treasury/balance
GET  /api/admin/treasury/ledger
POST /api/admin/treasury/transfers
POST /api/admin/treasury/transfers/:transferId/approve
POST /api/admin/treasury/transfers/:transferId/execute
POST /api/admin/treasury/transfers/:transferId/reconcile
GET  /api/admin/treasury/reconciliation
GET  /api/investor/treasury/ledger
GET  /api/investor/treasury/distributions
```

Future API rules should include:

- admin authorization for operational treasury actions;
- investor ownership checks for investor-visible treasury rows;
- append-only ledger writes;
- explicit status and reconciliation states;
- no client-supplied trusted actor fields;
- no direct mutation of historical ledger entries.

## 10. Security Model

Treasury security requires:

- append-only ledger history;
- role separation between recorder, approver, executor, and reconciler when the product is ready;
- authenticated server-derived actor fields;
- auditability for every capital movement;
- immutable accounting history;
- explicit correction entries instead of destructive edits;
- no silent fallback to demo data;
- no client-controlled trusted status or reconciliation fields;
- least-privilege access to treasury balances, transfers, and evidence.

The Treasury Engine should make manual abuse visible through audit history. It should not rely only on current balances or current statuses to explain capital movement.

## 11. Rollout Plan

Recommended phased implementation:

1. Architecture: publish this specification and align it with ADR-001, ADR-002, typed returns, and reconciliation.
2. Ledger schema: add an additive treasury ledger model with logical accounts, currency, actors, timestamps, related entities, and optional blockchain references.
3. Treasury services: implement append-only ledger writes and balance derivation.
4. Admin tools: add admin views for treasury ledger, balance, transfer intent, approval, execution, and correction workflows.
5. Investor visibility: expose read-only investor-facing treasury/distribution records for owned deals only.
6. Blockchain execution: integrate controlled NEAR execution paths for approved treasury movements.
7. Automated reconciliation: validate blockchain execution evidence against treasury ledger and typed return expectations.

Authoritative Realized Profit and Realized ROI should remain unavailable until typed returns, treasury ledger rules, reconciliation, and ADR-002 acceptance all support them.

## 12. Open Questions

- How should multi-currency support be modeled?
- Which stablecoins, if any, should be supported?
- Should treasury reserves be modeled per deal, per investor, or globally?
- How should platform fee accounting be separated from investor returns?
- Should cross-chain support be part of the first treasury ledger model or deferred?
- Can one deal use multiple treasury wallets?
- Can one treasury wallet support multiple logical accounts?
- What custody and signer policy is required for mainnet?
- What approvals are required before treasury execution?
- How should partial funding, partial returns, and batched distributions be represented?
- Which treasury views should investors see?
- Should farmers see treasury payment status or only operational funding status?
