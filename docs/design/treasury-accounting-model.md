# Treasury Accounting Model Specification

> **Target-architecture override:** `Farmer withdrawal` and NEAR-denominated Farmer-disbursement
> terminology below describes **Legacy Testnet Alpha — historical technical demonstration, not the
> target production financial architecture**. Target accounting separates Investor Funding,
> Estonia-layer crypto-to-fiat conversion, cleared fiat, Operator Fiat Disbursement, Uzbekistan
> Feedlot Operator confirmation, Project expenses, fiat proceeds returned, reconciliation, and
> Investor Settlement.

## 1. Purpose

This specification defines the Treasury Accounting Model for AgriPartners Alpha v1.1 Phase 20. It is a design document only. It does not authorize or implement database migrations, backend APIs, application code, frontend changes, or tests.

AgriPartners needs a treasury accounting model before implementing treasury ledger tables because capital movement must have a precise accounting language before it becomes software state. The platform already distinguishes recorded off-chain returns from verified payments and authoritative realized metrics. Treasury accounting extends that discipline to the full capital lifecycle: investor deposits, capital reservation, farmer funding, operational use, returns, distributions, fees, losses, and adjustments.

The model defines how future treasury tables should preserve balanced, append-only accounting history. It also separates platform accounting from blockchain execution so that transaction hashes remain evidence/reference data rather than the accounting source of truth.

## 2. Core Accounting Principle

Treasury accounting should follow double-entry accounting:

```text
Every treasury movement creates balanced debit and credit entries.
```

Required invariant:

```text
sum(debits) = sum(credits)
```

The invariant applies per treasury transaction and per currency. A transaction involving `NEAR` must balance in `NEAR`; a transaction involving `USD` must balance in `USD`. Multi-currency movements require explicit exchange-rate and currency conversion policy before implementation.

Double-entry accounting prevents treasury state from depending on mutable balance fields alone. Balances should be derived from ledger entries, while cached balances, if ever added, should be treated as derived data.

## 3. Logical Accounts

Logical treasury accounts are accounting accounts, not necessarily separate blockchain wallets, bank accounts, smart contracts, or database schemas.

Suggested Alpha/Beta account set:

| Account | Meaning |
| --- | --- |
| `Investor Cash` | Investor capital received, expected, or held as an investor liability before allocation. |
| `Platform Treasury Cash` | Treasury-controlled cash or token balance under platform custody. |
| `Reserved Investment Capital` | Investor capital reserved for a specific deal but not yet deployed. |
| `Active Deal Capital` | Capital actively assigned to a funded deal or cycle. |
| `Farmer Funding Disbursed` | Capital sent or marked as disbursed to a farmer or farmer operating flow. |
| `Recorded Off-chain Returns` | Return-related activity recorded by the platform before full payment/reconciliation authority. |
| `Investor Payable Returns` | Amounts owed or ready to be distributed to investors after policy checks. |
| `Platform Fee Revenue` | Fees recognized as platform revenue under accepted fee policy. |
| `Treasury Suspense / Unreconciled` | Temporary holding account for ambiguous, pending, or unreconciled treasury movements. |
| `Loss / Adjustment` | Explicit loss, write-off, or correction account with audit metadata. |

The account catalog should be explicit and controlled. Free-form account names should not be accepted in production write paths.

## 4. Account Types

Each logical account should be classified by account type:

| Account type | Example accounts | Notes |
| --- | --- | --- |
| `Asset` | `Platform Treasury Cash`, `Reserved Investment Capital`, `Active Deal Capital` | Represents controlled or deployed economic resources. |
| `Liability` | `Investor Cash`, `Investor Payable Returns` | Represents amounts owed to investors or held on their behalf. |
| `Equity/Revenue` | `Platform Fee Revenue` | Represents platform-earned revenue or future equity-style buckets. |
| `Expense/Loss` | `Loss / Adjustment` | Represents recognized losses, write-offs, or costs. |
| `Contra/Adjustment` | `Treasury Suspense / Unreconciled`, correction accounts | Represents temporary, reversing, or audit-adjustment buckets. |

The exact type of `Farmer Funding Disbursed` may depend on product and legal accounting decisions. It may be modeled as an asset, expense, receivable, or contra account in future implementation.

## 5. Treasury Transaction Model

A treasury transaction is a business-level movement. It groups the balanced ledger entries that represent one treasury event.

Minimum future transaction fields:

| Field | Meaning |
| --- | --- |
| `transaction_id` | Treasury transaction identifier. |
| `transaction_type` | Business movement type, such as deposit, reserve, disbursement, return, payout, fee, loss, or adjustment. |
| `currency` | Currency or token unit, such as `NEAR`, `USD`, `USDT`, or a future stablecoin. |
| `amount` | Positive transaction amount in the transaction currency. |
| `related_deal_id` | Deal associated with the transaction, when applicable. |
| `related_investor` | Investor account associated with the transaction, when applicable. |
| `related_farmer` | Farmer account associated with the transaction, when applicable. |
| `blockchain_reference` | Optional transaction hash, receipt, contract call, or explorer reference. |
| `created_by` | Authenticated actor or system component that created the transaction. |
| `created_at` | Server timestamp when the transaction was created. |
| `metadata` | Optional structured context such as network, wallet, source document, approval note, or evidence reference. |

The transaction row should not itself replace balanced ledger entries. It is the parent business record for those entries.

## 6. Treasury Ledger Entry Model

Treasury ledger entries are the immutable debit and credit rows under a treasury transaction.

Minimum future ledger entry fields:

| Field | Meaning |
| --- | --- |
| `entry_id` | Ledger entry identifier. |
| `transaction_id` | Parent treasury transaction. |
| `account_code` | Controlled logical account code. |
| `direction` | `debit` or `credit`. |
| `amount` | Positive amount. |
| `currency` | Currency or token unit. |
| `related_deal_id` | Deal context copied or derived from the transaction when applicable. |
| `related_investor` | Investor context copied or derived from the transaction when applicable. |
| `related_farmer` | Farmer context copied or derived from the transaction when applicable. |
| `created_at` | Server timestamp when the ledger entry was created. |

Ledger entries should be append-only. Corrections should be represented as new transactions and ledger entries that explicitly reference the original transaction or entry in metadata or a future correction relationship.

## 7. Required Invariant

Every treasury transaction must balance:

```text
total debit amount = total credit amount
```

The invariant must be enforced per currency:

```text
total debits in NEAR = total credits in NEAR
total debits in USD = total credits in USD
total debits in USDT = total credits in USDT
```

The system should reject:

- unbalanced transactions;
- mixed-currency transactions without explicit conversion policy;
- negative ledger entry amounts;
- missing debit or credit side;
- unknown account codes;
- client-supplied trusted actor fields.

## 8. Business Event Mappings

The following examples are conceptual mappings. Exact account names and debit/credit direction should be reviewed by accounting/product owners before implementation.

### A. Investor Deposits Into Treasury

Investor transfers funds into platform custody.

| Direction | Account |
| --- | --- |
| Debit | `Platform Treasury Cash` |
| Credit | `Investor Cash` / investor liability account |

### B. Investor Capital Reserved For Deal

Investor capital is allocated to a specific deal but not yet disbursed.

| Direction | Account |
| --- | --- |
| Debit | `Reserved Investment Capital` |
| Credit | `Investor Cash` / investor liability account |

### C. Farmer Funding Disbursed

Capital is released or marked as deployed into farmer funding.

| Direction | Account |
| --- | --- |
| Debit | `Farmer Funding Disbursed` / `Active Deal Capital` |
| Credit | `Platform Treasury Cash` |

### D. Farmer Return Recorded

Farmer return activity is recorded before final reconciliation.

| Direction | Account |
| --- | --- |
| Debit | `Platform Treasury Cash` or `Treasury Suspense / Unreconciled` |
| Credit | `Investor Payable Returns` |

If payment evidence is incomplete, `Treasury Suspense / Unreconciled` should be preferred until reconciliation policy resolves the movement.

### E. Investor Payout

Treasury pays or marks distribution to investor.

| Direction | Account |
| --- | --- |
| Debit | `Investor Payable Returns` |
| Credit | `Platform Treasury Cash` |

### F. Platform Fee Recognized

Platform fee is recognized from a return pool or payable amount.

| Direction | Account |
| --- | --- |
| Debit | `Investor Payable Returns` or return pool account |
| Credit | `Platform Fee Revenue` |

Fee policy must ensure fees are not counted as investor principal or investor profit.

### G. Loss Or Adjustment

Losses and corrections require explicit audit metadata.

| Direction | Account |
| --- | --- |
| Debit/Credit | `Loss / Adjustment` |
| Counterparty | The affected treasury account |

Loss and adjustment entries must include reason, actor, timestamp, related deal/investor/farmer when applicable, and reference to the affected transaction or entry when possible.

## 9. Relationship To Deals

Treasury transactions should connect to deal lifecycle activity:

- Deal funding: investor capital moves from investor cash/reserved capital into active deal capital.
- Cycle funding: active capital may move into farmer funding disbursed for a specific cycle.
- Return ledger entries: typed return rows may reference or be supported by treasury transactions.
- Investor withdrawals: investor distribution or payout transactions reduce investor payable returns and treasury cash.
- Farmer withdrawals: farmer funding transactions reduce treasury cash and increase farmer funding disbursed or active deal capital.

Deal status alone must not imply treasury movement. Treasury movement requires explicit ledger entries and, later, reconciliation where evidence is required.

## 10. Relationship To Blockchain

Blockchain transactions are execution evidence, not the accounting source of truth.

A blockchain transaction hash may show that something happened on a network, but it does not by itself prove:

- the accounting classification;
- the business purpose;
- the correct deal association;
- the correct investor or farmer association;
- whether the transaction should count as principal, profit, fee, loss, or correction;
- whether the movement has been reconciled.

The Treasury Accounting Model must support off-chain, pending, failed, and multi-step execution flows without losing accounting state.

## 11. Relationship To Reconciliation

Reconciliation verifies whether blockchain, bank, or other evidence matches treasury ledger expectations.

Reconciliation should compare expected ledger details against observed evidence:

- amount;
- currency;
- sender or source;
- recipient or destination;
- network or payment rail;
- execution status;
- deal association;
- investor/farmer association;
- duplicate evidence usage.

Reconciliation does not replace the treasury ledger. It validates or challenges ledger expectations and may lead to a reconciled status, suspense movement, or correction entry.

## 12. Multi-Currency Readiness

The model should be ready for:

- `NEAR`;
- `USD`;
- `USDT`;
- future stablecoins.

No multi-currency implementation is authorized by this document. Future implementation must define:

- account balances per currency;
- currency-specific precision;
- token contract identifiers where applicable;
- exchange-rate policy;
- reporting currency;
- whether cross-currency transactions are allowed or must be split into explicit conversion transactions.

Until that policy exists, balances in different currencies must not be summed as if they were the same unit.

## 13. Minimum Alpha Implementation

A minimal future Alpha implementation should include:

- `treasury_accounts` reference table;
- `treasury_transactions` table;
- `treasury_ledger_entries` table;
- backend ledger service that writes balanced append-only transactions;
- balance query service that derives balances from ledger entries;
- tests for account validation, balance invariants, append-only behavior, and multi-currency separation.

The implementation should be additive and should not rewrite existing `deal_returns`, `return_status_events`, or financial summary behavior.

## 14. Things Explicitly Out Of Scope

Out of scope for this accounting model specification:

- real bank integration;
- mainnet USDT execution;
- automated reconciliation;
- exchange-rate accounting;
- tax accounting;
- multi-entity legal accounting;
- custody provider integration;
- investor-facing realized profit/ROI authority changes.

## 15. Risks

Key risks:

- unbalanced ledger transactions;
- mixing accounting state with blockchain execution state;
- treating off-chain returns as verified payments;
- treating transaction hashes as accounting truth;
- fee misclassification;
- multi-currency confusion;
- irreversible corrections without audit trail;
- mutable balance fields diverging from append-only entries;
- investor-visible totals combining currencies incorrectly;
- legacy rows being treated as authoritative treasury history without review.

## 16. Rollout Plan

Recommended sequence:

1. Publish this design specification.
2. Add an additive schema migration for treasury account, transaction, and ledger entry tables.
3. Implement backend ledger service with double-entry balancing.
4. Add admin treasury visibility for ledger and derived balances.
5. Add investor treasury visibility for owned deals and distributions.
6. Integrate treasury expectations with reconciliation workflows.
7. Integrate blockchain execution evidence after accounting and reconciliation rules are accepted.

Each step should preserve ADR-001 live-first behavior and ADR-002 financial semantics. Realized Profit and Realized ROI should remain unavailable or explicitly non-authoritative until typed returns, treasury accounting, reconciliation, and business acceptance all support them.

## 17. Open Questions

- Should each investor have a virtual cash account?
- Should each deal have its own subledger?
- How should platform fees be modeled and recognized?
- How should losses be modeled?
- How should FX, USD, and USDT be handled?
- Is farmer funding an asset, expense, receivable, or another product-specific accounting category?
- Should `Treasury Suspense / Unreconciled` be mandatory for all unverified payments?
- Can one blockchain transaction support multiple treasury transactions?
- Can one treasury transaction map to multiple blockchain transactions?
- What approval roles are required for treasury writes?
- What parts of treasury history should investors see?
