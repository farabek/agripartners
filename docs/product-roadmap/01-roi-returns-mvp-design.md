# ROI & Returns MVP Design Audit

## Purpose

This document audits the current AgriPartners codebase and proposes the safest MVP path for ROI and investor returns.

Reviewed scope:

- `backend/src/routes`
- `backend/src/services`
- `backend/src/db/schema.sql`
- `backend/src/db/migrations`
- `frontend/app.js`
- `frontend/index.html`

This is a documentation-only design audit. It does not change application code, migrations, contracts, commits, or deployment state.

## Findings

### Existing data available for ROI calculations

The current backend already stores enough deal-level data to calculate a simple projected ROI and return progress:

- `deals.investment_amount`: investor principal in yoctoNEAR.
- `deals.capital_return_near`: planned capital return amount passed to the smart contract at deployment.
- `deals.investor_split_pct`: investor share percentage.
- `deals.farmer_split_pct`: farmer share percentage.
- `deals.escrow_pct`: escrow percentage.
- `deals.performance_fee_pct`: platform or performance fee percentage.
- `deals.total_cycles`: number of production cycles.
- `deals.cycle_duration_days`: expected cycle length.
- `events.profit_near`: profit value recorded when admin reports a cycle.
- `events.losses_near`: loss value recorded when admin reports a cycle.
- `deal_returns.amount_near`: off-chain return records entered by admin.
- `deal_returns.note`: optional context for the return record.
- `deal_returns.created_at`: return record timestamp.

There is already partial ROI/returns implementation in `backend/src/services/dealService.js`:

- `ROI_PERCENT` is hard-coded to `20`.
- `getDealReturnSummary(deal)` calculates invested amount, expected return, returned amount, outstanding amount, and ROI percent.
- `enrichDealWithReturnSummary(deal)` adds those values to a deal payload.
- `getDealReturns(dealId)` lists return rows.
- `createDealReturn(dealId, repayment)` records an admin-entered return.

There is already partial API coverage:

- `GET /api/investor/deals/:id` returns an investor-owned deal enriched with return summary.
- `GET /api/investor/deals/:id/returns` returns recorded return rows.
- `POST /api/admin/deals/:id/returns` records an admin return.

There is already partial frontend coverage in `frontend/app.js`:

- Investor detail fetches deal, status, balances, events, cycles, reports, and returns.
- Investor detail renders an `Investment Summary` with invested, expected return, returned, outstanding, and projected ROI.
- Investor detail renders a `Returns` history.
- Admin deal detail includes a `Record Return` form.

### Whether ROI can be implemented without smart contract changes

Yes, the safest MVP can be implemented without smart contract changes if ROI and returns are treated as an off-chain reporting layer.

The smart contract already stores and exposes lifecycle state and balances through existing backend calls:

- `get_status`
- `get_balances`
- `fund`
- `start_cycle`
- `report_cycle`
- `withdraw`

For MVP purposes, ROI can be calculated from database data and admin-entered return records:

- principal: `deals.investment_amount`
- expected return: either a configured ROI percent or a deal-level target
- returned amount: sum of `deal_returns.amount_near`
- outstanding amount: expected return minus returned amount

Smart contract changes are not required for a first dashboard MVP because the return ledger is informational and admin-controlled. However, any future claim that returns are fully on-chain, investor-withdrawable, or contract-enforced would require smart contract and event/indexing changes.

### Current gaps

The current implementation is useful but not yet a complete product-grade MVP:

- ROI is hard-coded as `20%` in `dealService.js`.
- `deal_returns` stores only `deal_id`, `amount_near`, `note`, and `created_at`.
- Return records have no explicit `recorded_by`, `return_type`, `status`, `tx_hash`, or audit metadata.
- `schema.sql` defines `deal_returns` differently from the Postgres migration style used by `backend/src/db/migrations`.
- The public `GET /api/deals/:id` endpoint does not include return summary.
- The admin dashboard can record returns but does not show a full return ledger or return summary in the admin detail view.
- Investor dashboard cards use enriched details, but the list and detail UX should make clear that values are projected/admin-recorded, not contract-guaranteed.
- There is no dedicated admin edit/delete/correction flow for mistaken return records.

## Proposed Architecture

### MVP principle

Build ROI & Returns MVP as a database-backed reporting feature first.

The MVP should clearly label ROI as projected unless the deal is completed and returns have been recorded. Return records should be presented as admin-recorded entries, not automatic on-chain settlement.

### Calculation model

Use these fields for the initial MVP:

| Value | Source | Notes |
| --- | --- | --- |
| Invested amount | `deals.investment_amount` | Stored in yoctoNEAR. |
| ROI percent | New deal-level DB field or temporary service default | Avoid long-term hard-coded ROI. |
| Expected return | invested amount plus ROI | Computed in service layer. |
| Returned amount | Sum of `deal_returns.amount_near` | Stored as NEAR decimal strings today. |
| Outstanding amount | expected return minus returned amount | Never display below zero. |
| Return status | computed | `not_started`, `partial`, `complete`, `overpaid`. |

### Required DB changes

The safest DB design is additive and does not rewrite existing deal data.

Recommended migration:

1. Add deal-level ROI configuration:

```sql
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS projected_roi_pct NUMERIC(8, 4) NOT NULL DEFAULT 20;
```

2. Expand `deal_returns` for auditability:

```sql
ALTER TABLE deal_returns
  ADD COLUMN IF NOT EXISTS return_type TEXT NOT NULL DEFAULT 'admin_recorded',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'recorded',
  ADD COLUMN IF NOT EXISTS recorded_by TEXT,
  ADD COLUMN IF NOT EXISTS tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
```

3. Add constraints in a follow-up migration after existing data is checked:

```sql
ALTER TABLE deal_returns
  ADD CONSTRAINT deal_returns_status_check
  CHECK (status IN ('recorded', 'voided'));
```

4. Align `backend/src/db/schema.sql` with Postgres migrations so fresh database setup matches production migration behavior.

For the smallest possible MVP, existing `deal_returns` can be reused and only `projected_roi_pct` is required. For a safer MVP, add the audit fields above before exposing the feature more broadly.

### Required API endpoints

Existing endpoints to keep:

- `GET /api/investor/deals/:id`
- `GET /api/investor/deals/:id/returns`
- `POST /api/admin/deals/:id/returns`

Recommended additions:

- `GET /api/investor/deals/:id/return-summary`
  - Returns only ROI summary for the authenticated investor.
  - Useful for refreshing summary without reloading the full deal.

- `GET /api/admin/deals/:id/return-summary`
  - Returns admin-visible ROI summary and ledger totals.

- `GET /api/admin/deals/:id/returns`
  - Lists return records for admin review.

- `PATCH /api/admin/deals/:id/returns/:returnId`
  - Allows admin to update note/status or void a mistaken return.
  - Safer than deleting records.

- `PATCH /api/admin/deals/:id/roi`
  - Allows admin to set `projected_roi_pct` before deal launch or while in early MVP mode.
  - Should be restricted and logged.

### Required Investor Portal UI changes

The Investor Portal should keep the current detail-level `Investment Summary` and `Returns` sections, but tighten the MVP language and list UX.

Recommended Investor Portal changes:

- On investment cards, show:
  - Invested amount.
  - Projected ROI.
  - Expected return.
  - Returned amount.
  - Outstanding amount.
  - Return status.

- On investor deal detail, show:
  - `Investment Summary` with labels:
    - Invested
    - Projected Return
    - Returned
    - Outstanding
    - Projected ROI
  - `Returns History` with date, amount, note, and status.
  - A small disclaimer: returns are admin-recorded during MVP and not a guarantee of on-chain settlement.

- Keep investor withdrawal separate from ROI reporting.

- Avoid showing ROI as final until the deal status is completed or the expected return has been fully recorded.

### Required Admin Dashboard changes

The Admin Dashboard already has a `Record Return` form in the deal detail view. The MVP should make it safer and more visible.

Recommended Admin Dashboard changes:

- Add an admin return summary panel:
  - Invested amount.
  - Projected ROI percent.
  - Expected return.
  - Returned amount.
  - Outstanding amount.
  - Return status.

- Add a return ledger below the `Record Return` form:
  - Date.
  - Amount.
  - Note.
  - Status.
  - Recorded by.

- Add validation copy around the form:
  - Amount is in NEAR.
  - Return record is an admin ledger entry.
  - Recording a return does not itself execute a smart contract transfer.

- Add a void/correction path instead of deleting return rows.

- Add optional ROI percent setting on deal creation or deal admin detail.

## Implementation Phases

### Phase 1: Stabilize the current MVP

- Keep ROI off-chain and database-backed.
- Replace hard-coded `ROI_PERCENT` with deal-level `projected_roi_pct`.
- Add return summary service output with clear fields:
  - `invested_amount`
  - `projected_roi_pct`
  - `expected_return`
  - `returned_amount`
  - `outstanding_amount`
  - `return_status`
- Ensure investor and admin routes use the same summary function.
- Align `schema.sql` with migrations.

### Phase 2: Improve admin controls

- Add admin `GET /returns` and `GET /return-summary`.
- Add return ledger display in admin detail.
- Add void/correction flow.
- Add `recorded_by`, `status`, `return_type`, and optional `tx_hash`.
- Add tests for amount normalization and summary calculations.

### Phase 3: Improve investor UX

- Add return summary to investor list cards.
- Add clearer projected/final ROI labels.
- Add returns disclaimer.
- Add empty, partial, complete, and overpaid states.
- Add refresh behavior for summary and ledger.

### Phase 4: Prepare for on-chain return verification

- Decide whether return records must map to contract withdrawals, event hashes, or external transfer hashes.
- Add optional `tx_hash` display.
- Add reconciliation logic between DB return records and contract balances.
- Defer smart contract changes until the MVP proves which return model is needed.

## Risk Assessment

### Low risk

- Displaying projected ROI from deal and return data.
- Showing admin-recorded return ledger.
- Adding investor-facing summary fields.
- Adding additive DB columns.

### Medium risk

- Keeping ROI hard-coded at `20%`.
- Mixing yoctoNEAR and NEAR decimal strings across tables.
- Letting admins record returns without a correction or void path.
- Presenting projected ROI as if it were guaranteed.
- Fresh database setup drift because `schema.sql` and migrations do not fully match.

### High risk

- Claiming returns are on-chain-enforced when they are admin-recorded.
- Treating `deal_returns` as payment proof without transaction hash or reconciliation.
- Changing smart contracts before the product reporting model is validated.
- Allowing deletion of return rows instead of auditable correction.

## Recommended MVP Decision

Implement ROI & Returns MVP without smart contract changes.

Use a conservative database-backed reporting model:

- projected ROI is deal-level configuration;
- returns are admin-recorded ledger entries;
- investor UI displays projected, returned, and outstanding amounts clearly;
- admin UI controls recording and correction;
- future on-chain verification is a later phase.
