# ADR-002 — Financial Semantics

## Status

Draft

## Context

AgriPartners displays investment amounts, projected payouts, recorded returns, profit, ROI, outstanding amounts, and deal performance. Some of these values are currently calculated in frontend presentation code, while other values are supplied or derived by backend services.

Before further ROI and Returns development, the product needs a shared financial vocabulary and consistent formulas. Without standardized semantics, the same value may be labeled or interpreted differently across investor, farmer, and admin experiences. This ADR proposes terminology and formulas for product discussion. It does not make the formulas authoritative while its status remains Draft.

## Core Definitions

### Investment Amount

The amount of capital committed to a deal and used as the base amount for projected payout and ROI calculations. Its currency or unit must always be stated.

### Principal

The portion of the Investment Amount that is expected to be repaid to the investor. Principal is capital repayment, not profit.

### Projected Profit

An estimate of the profit expected above the Investment Amount. It is based on Projected ROI and must not be presented as guaranteed or realized income.

### Projected Total Payout

The proposed total amount expected to be paid to the investor, including Principal and Projected Profit.

### Actual Cash Returned

The cumulative amount recorded as paid or returned to the investor. Until reconciliation is implemented, this value may represent accounting records rather than verified transfers.

### Realized Profit

The portion of Actual Cash Returned above the Investment Amount. Under the proposed formula, profit is not considered realized until cumulative cash returned exceeds the invested principal.

### Outstanding Amount

The remaining difference between Projected Total Payout and Actual Cash Returned, floored at zero. This is a projection-based amount and does not by itself establish that payment is due or overdue.

### Projected ROI

The projected profit expressed as a percentage of the Investment Amount. It is an estimate and is not a guaranteed return.

### Realized ROI

Realized Profit expressed as a percentage of the Investment Amount. It should be treated as authoritative only when the underlying returns have an agreed semantic meaning and sufficient reconciliation evidence.

### Return Ledger Entry

An individual accounting record representing a return-related amount associated with a deal. Its precise economic meaning remains unresolved in this ADR.

### Off-chain Return

A return recorded in the AgriPartners database without evidence that the corresponding transfer was executed and confirmed on-chain.

### On-chain Transfer

A blockchain transfer supported by a network, transaction hash, sender, recipient, amount, and confirmed execution status.

### Reconciled Return

A return ledger entry that has been matched to reliable payment evidence, such as a confirmed on-chain transfer, and whose amount, parties, currency, and purpose agree with that evidence.

## Proposed Formula Draft

The following formulas are **proposed** and are not yet an accepted authoritative calculation model:

```text
Projected Profit = Investment Amount × Projected ROI

Projected Total Payout = Investment Amount + Projected Profit

Realized Profit = max(Actual Cash Returned − Investment Amount, 0)

Outstanding Amount = max(Projected Total Payout − Actual Cash Returned, 0)

Realized ROI = Realized Profit / Investment Amount
```

Projected ROI must be converted from percentage form before multiplication. For example, `20%` is represented as `0.20` in the Projected Profit formula.

Realized ROI is undefined when Investment Amount is zero or unavailable. In that case, the product must display `Unavailable` or `Not yet calculated`, not a fabricated zero.

## Important Unresolved Semantic Question

The product has not yet decided what a Return Ledger Entry represents. It may represent:

- principal repayment;
- profit distribution; or
- total payout including both principal and profit.

This question is **unresolved**. A product and business decision is required before backend services can provide authoritative Realized Profit and Realized ROI calculations.

The decision must also define whether one deal may contain different return entry types and, if so, how each entry is classified.

## Source of Truth Principle

Frontend code may display derived values for presentation and clearly label them as calculated or projected. Authoritative financial calculations should eventually live in backend services so that every portal uses the same inputs, formulas, precision, and rounding rules.

Missing or non-authoritative source data must produce `Unavailable` or `Not yet calculated`. Frontend code must not silently replace missing financial values with zero or demo values.

## Investor Communication Principle

Investor-facing financial labels must not imply guaranteed returns unless a contractual obligation and confirmed supporting data justify that statement.

Preferred terms include:

- `Projected`;
- `Expected`;
- `Recorded`;
- `Realized`;
- `Unavailable`.

Avoid terms such as:

- `Guaranteed`;
- `Earned`.

`Guaranteed` or `Earned` may be used only when supported by confirmed contractual and payment data. Recorded off-chain returns must not be described as confirmed on-chain transfers.

## Relationship to ADR-001

[ADR-001 — Live-first Architecture](ADR-001-live-first-architecture.md) defines where operational data comes from: live routes use authoritative backend API data, while demo data remains isolated to explicit pilot routes.

ADR-002 defines what financial fields and labels mean. ADR-001 governs data provenance; ADR-002 governs financial semantics. Both principles must be satisfied before a financial value is presented as authoritative.

## Consequences

### Positive consequences

- Consistent product language across portals and documentation.
- Safer investor-facing reporting.
- A clearer basis for backend financial services.
- Easier and more defensible investor presentations.

### Tradeoffs

- Some existing labels may need to change.
- Some values should remain `Unavailable` until backend services can calculate them authoritatively.
- Future database migrations and API DTO changes may be required after the unresolved semantics are accepted.

## Next Steps

1. Make a product and business decision on Return Ledger Entry semantics.
2. Define a backend portfolio summary service and authoritative portfolio DTO.
3. Move ROI and profit calculations to backend services with explicit precision and rounding rules.
4. Design a reconciliation model connecting off-chain return records with confirmed on-chain transfers.
5. Review and accept or revise this ADR before implementing authoritative financial calculations.
