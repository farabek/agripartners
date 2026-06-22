# ADR-002 — Financial Semantics

## Status

Proposed

This ADR is ready for product and business review, but it is not yet accepted. The proposed definitions below must be approved before Realized Profit or Realized ROI becomes authoritative product data.

## Context

AgriPartners displays investment amounts, projected payouts, recorded returns, profit, ROI, outstanding amounts, and deal performance. Some values are currently calculated in frontend presentation code, while other values are supplied or derived by backend services.

The Alpha implementation stores return ledger entries in `deal_returns` with only `amount_near`, `note`, and `created_at`. These records are not typed as principal or profit and are not reconciled with an on-chain transfer or contract withdrawal. The platform therefore needs an explicit distinction between what the current ledger can safely claim and the typed, reconciled return model required for authoritative realized performance.

## Proposed Decision

- Current `deal_returns` records are **Recorded Off-chain Returns**.
- They represent recorded payout activity associated with a deal, but do not by themselves prove that payment was approved, executed, received, or reconciled.
- Current entries do not provide an authoritative principal/profit split.
- Realized Profit and Realized ROI must remain unavailable or be explicitly labeled provisional until typed and sufficiently reconciled return entries exist.
- The target architecture is a typed return ledger in which every entry identifies its economic purpose.

The proposed return entry types are:

- `principal`;
- `profit`;
- `fee`;
- `correction`.

This decision classifies existing Alpha records without retroactively inventing types or payment evidence that the current data does not contain.

## Core Definitions

### Investment Amount

The amount of capital committed to a deal and used as the base amount for projected payout and ROI calculations. Its currency or unit must always be stated.

### Principal

The portion of the Investment Amount expected to be repaid to the investor. Principal is capital repayment, not profit.

### Projected ROI

The projected profit expressed as a percentage of the Investment Amount. It is an estimate and is not a guaranteed return.

### Projected Profit

An estimate of profit above the Investment Amount, calculated from Projected ROI. It must not be presented as guaranteed or realized income.

### Projected Total Payout

The projected amount expected to be returned to the investor, including the projected return of Principal and Projected Profit.

### Recorded Off-chain Return

An amount recorded in the AgriPartners database as return-related payout activity without sufficient evidence that the corresponding payment was executed and reconciled. In Alpha, each `deal_returns` row is a Recorded Off-chain Return.

### Projected Outstanding

The remaining difference between Projected Total Payout and Recorded Off-chain Returns, floored at zero. It is projection-based and does not by itself establish that an amount is due or overdue.

### Typed Return Ledger Entry

A future return record whose `entry_type` identifies the amount as principal, profit, fee, or correction. Its payment and reconciliation status remain separate from its economic type.

### On-chain Transfer

A blockchain transfer supported by a network, transaction hash, sender, recipient, amount, and confirmed execution status.

### Reconciled Return

A typed return entry matched to reliable payment evidence whose amount, parties, currency, purpose, and execution status agree with that evidence.

### Realized Profit

Profit actually returned to the investor according to typed return records and the required reconciliation policy. Alpha Recorded Off-chain Returns do not provide enough information to calculate authoritative Realized Profit.

### Realized ROI

Realized Profit expressed as a percentage of the Investment Amount. It is authoritative only when Realized Profit is supported by typed and sufficiently reconciled return data.

## Current Alpha Semantics

In Alpha:

- `deal_returns.amount_near` is a Recorded Off-chain Return amount denominated in NEAR.
- The sum of these entries may be used as a **Recorded Off-chain Returns** total.
- That total may be used to calculate Projected Outstanding for presentation and planning.
- An entry does not identify whether it is principal, profit, fee, or a correction.
- An entry does not silently become proof of an on-chain payment or investor receipt.
- Investor-facing presentation must identify the total as recorded and off-chain.
- Realized Profit and Realized ROI are unavailable or explicitly provisional.

Existing notes may provide human context, but free-form text must not be parsed or treated as an authoritative return type.

### Current Alpha Formulas

```text
Projected Profit = Investment Amount × Projected ROI

Projected Total Payout = Investment Amount + Projected Profit

Recorded Off-chain Returns = sum(deal_returns.amount_near)

Projected Outstanding = max(Projected Total Payout − Recorded Off-chain Returns, 0)

Realized Profit = Unavailable or Provisional

Realized ROI = Unavailable or Provisional
```

Projected ROI must be converted from percentage form before multiplication. For example, `20%` is represented as `0.20` in the Projected Profit formula.

Missing Investment Amount or Projected ROI must produce `Unavailable` or `Not yet calculated`; it must not be silently replaced with zero or an undocumented default.

## Target Beta Semantics

The target Beta ledger separates economic meaning from payment lifecycle.

Each return entry should have:

- an entry type: `principal`, `profit`, `fee`, or `correction`;
- a payment status such as `recorded`, `approved`, `paid`, or `reconciled`;
- an explicit currency or unit;
- actor and audit metadata;
- optional transaction hash or other payment evidence;
- reconciliation metadata when matched to payment evidence.

The product and business acceptance of this ADR must define which payment statuses qualify an entry for authoritative realized calculations. A record marked only `recorded` must not automatically qualify as paid or reconciled.

### Target Beta Formulas

For entries that satisfy the approved payment and reconciliation policy:

```text
Principal Returned = sum(amount where entry_type = principal)

Profit Returned = sum(amount where entry_type = profit)

Realized Profit = Profit Returned

Realized ROI = Profit Returned / Investment Amount

Outstanding Principal = max(Investment Amount − Principal Returned, 0)

Outstanding Projected Profit = max(Projected Profit − Profit Returned, 0)
```

Realized ROI is unavailable when Investment Amount is zero or unavailable. Fee and correction handling must follow explicit rules; correction entries must not be included without a defined direction and target type.

## Source of Truth Principle

Live financial data must follow [ADR-001 — Live-first Architecture](ADR-001-live-first-architecture.md): operational views use authoritative backend API data and explicit pilot routes remain isolated.

Financial formulas, precision, rounding, semantic availability, and portfolio aggregation should be backend-authoritative. Frontend code should display the financial summary DTO rather than independently reinterpret return records.

Missing or non-authoritative data must produce `Unavailable`, `Not yet calculated`, or an explicit provisional state. It must not be replaced with demo data, a fabricated zero, or an undocumented default.

## Investor Communication Rules

Preferred Alpha labels include:

- `Recorded Off-chain Returns`;
- `Projected Outstanding`;
- `Projected Total Payout`;
- `Projected ROI`;
- `Provisional`;
- `Not yet authoritative`;
- `Unavailable`.

Avoid these labels unless typed and sufficiently reconciled data supports them:

- `Verified`;
- `Earned`;
- `Realized`.

`Guaranteed` must not be used for projected returns. Recorded Off-chain Returns must not be described as verified payments, confirmed on-chain transfers, or realized profit. A completed deal lifecycle must not cause Projected ROI to be relabeled as Realized ROI.

## Migration Note

A future migration may extend return entries with:

- `entry_type`;
- `payment_status`;
- `transaction_hash`;
- `actor`;
- `currency`;
- reconciliation metadata.

Historical Alpha entries must remain untyped unless they are classified through an explicit, auditable review. The migration must not infer principal or profit from entry order, amount, note text, or deal status.

## Consequences

### Positive consequences

- Existing Alpha records receive a precise, defensible meaning without rewriting historical data.
- Investor communication distinguishes recorded activity from verified payment.
- Projected calculations can become backend-authoritative before reconciliation is implemented.
- Typed Beta entries provide a clear path to authoritative Realized Profit and Realized ROI.
- Contract withdrawals and off-chain accounting can later be reconciled without conflating them now.

### Tradeoffs

- Some existing investor-facing labels must change.
- Realized performance remains unavailable or provisional during Alpha.
- A later schema migration and API evolution are required for typed and reconciled returns.
- Historical entries may remain permanently untyped when evidence is insufficient.

## Acceptance Questions

Before changing this ADR to `Accepted`, product and business owners must confirm:

1. Which payment statuses qualify principal and profit for realized calculations?
2. Whether reconciliation is mandatory for authoritative Realized Profit and Realized ROI.
3. How `fee` and `correction` entries affect investor totals.
4. Whether Projected Total Payout always assumes full Investment Amount as Principal or must use deal-specific contractual principal.

## Next Implementation Recommendation

Proceed with **Sprint 19.2B — Backend Financial Summary DTO** using Current Alpha-safe semantics:

1. calculate Projected Profit and Projected Total Payout in the backend;
2. expose Recorded Off-chain Returns and Projected Outstanding with exact units;
3. return Realized Profit and Realized ROI as unavailable or explicitly provisional;
4. include calculation-basis and ledger-semantics metadata;
5. keep typed-entry migration and payment reconciliation out of Sprint 19.2B.
