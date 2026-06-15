# ROI & Returns Technical Inventory

## Purpose

This document inventories the ROI and returns implementation already present in the AgriPartners backend.

Reviewed scope:

- `backend/src/services/dealService.js`
- `backend/src/routes`
- `backend/src/db/schema.sql`
- `backend/src/db/migrations`

This is a read-only technical inventory. It does not change code, database schema, migrations, commits, or deployment state.

## Current State

The codebase already contains a small off-chain returns implementation.

The current model is:

- Deals store investment principal and lifecycle configuration.
- Admins can record return rows for a deal.
- Investors can view return rows for their own deals.
- Investor deal detail responses include a computed return summary.
- ROI is currently hard-coded at `20%` in `dealService.js`.

The implementation is database-backed and does not require smart contract changes for the current MVP behavior.

## Existing Components

### ROI-related tables

No table is dedicated only to ROI configuration.

Existing tables that provide ROI calculation inputs:

| Table | Fields | Use |
| --- | --- | --- |
| `deals` | `investment_amount` | Principal used as invested amount. |
| `deals` | `capital_return_near` | Planned capital return stored on deal creation. |
| `deals` | `investor_split_pct` | Investor split percentage, useful for future ROI logic. |
| `deals` | `farmer_split_pct` | Farmer split percentage, useful for lifecycle economics. |
| `deals` | `escrow_pct` | Escrow percentage, useful for deal economics. |
| `deals` | `performance_fee_pct` | Performance fee percentage, useful for net return logic. |
| `deals` | `total_cycles`, `cycle_duration_days` | Timing and cycle context. |
| `events` | `profit_near`, `losses_near` | Admin-reported profit/loss values from cycle reporting. |

### Returns-related tables

The current dedicated returns table is `deal_returns`.

Defined in `backend/src/db/migrations/009_deal_returns.sql`:

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | `SERIAL PRIMARY KEY` | Return row identifier. |
| `deal_id` | `INTEGER NOT NULL REFERENCES deals(id)` | Links return to deal. |
| `amount_near` | `TEXT NOT NULL` | Return amount as NEAR decimal text. |
| `note` | `TEXT` | Optional admin note. |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Return record timestamp. |

Also present in `backend/src/db/schema.sql`, but with SQLite-style definitions:

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `deal_id INTEGER NOT NULL`
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`

This is a schema drift risk because runtime database access uses `pg` and migrations are Postgres-style.

### Existing API endpoints related to returns

Investor route:

- `GET /api/investor/deals/:id`
  - Uses `dealService.enrichDealWithReturnSummary(deal)`.
  - Returns deal fields plus computed return summary.
  - Investor-owned access is enforced through `getInvestorDealById(accountId, dealId)`.

- `GET /api/investor/deals/:id/returns`
  - Uses `dealService.getDealReturns(deal.id)`.
  - Returns return ledger rows for an investor-owned deal.

Admin route:

- `POST /api/admin/deals/:id/returns`
  - Looks up deal by id.
  - Calls `dealService.createDealReturn(deal.id, { amount_near, note })`.
  - Calls `dealService.getDealReturnSummary(deal)`.
  - Responds with `{ ok: true, repayment, summary }`.

No admin `GET /returns`, admin `GET /return-summary`, update, void, or correction endpoint currently exists.

### Existing services related to ROI and returns

Primary service: `backend/src/services/dealService.js`.

Existing return service functions:

- `getDealReturns(dealId)`
  - Reads rows from `deal_returns`.
  - Orders by `created_at ASC`.

- `createDealReturn(dealId, repayment)`
  - Normalizes `amount_near`.
  - Inserts `deal_id`, `amount_near`, and `note`.
  - Returns the inserted row.

- `getDealReturnSummary(deal)`
  - Reads return rows for a deal.
  - Calculates invested amount, expected return, returned amount, outstanding amount, and ROI percent.

- `enrichDealWithReturnSummary(deal)`
  - Merges computed summary into a deal response.

Existing amount helper functions:

- `parseNearToYocto(value)`
- `formatYoctoToNear(yocto)`
- `normalizeReturnAmount(value)`

### Existing admin functionality for recording returns

Backend:

- `POST /api/admin/deals/:id/returns` records an admin-entered return.
- The endpoint accepts:
  - `amount_near`
  - `note`
- Validation is delegated to `createDealReturn`.
- Invalid `amount_near` returns a `400`.

Current limitations:

- No `recorded_by`.
- No `status`.
- No `return_type`.
- No `tx_hash`.
- No void or correction flow.
- No admin list endpoint for return records.

### Existing investor functionality for viewing returns

Backend:

- `GET /api/investor/deals/:id/returns` lists return rows.
- `GET /api/investor/deals/:id` includes computed summary fields.

Current investor summary fields returned by `getDealReturnSummary`:

- `amount`
- `expected_return`
- `returned_amount`
- `outstanding_amount`
- `roi_percent`

Access control:

- Investor endpoints only return a deal when `deals.investor` matches the authenticated wallet account.

### Existing ROI calculation logic

ROI summary is calculated in `getDealReturnSummary(deal)`:

```js
const investedYocto = BigInt(deal.investment_amount || '0');
const expectedYocto = investedYocto * BigInt(100 + ROI_PERCENT) / 100n;
const returnedYocto = returns.reduce(
  (sum, repayment) => sum + BigInt(parseNearToYocto(repayment.amount_near)),
  0n
);
const outstandingYocto = expectedYocto > returnedYocto ? expectedYocto - returnedYocto : 0n;
```

The summary returns formatted NEAR decimal strings.

### Hard-coded ROI assumptions

The current hard-coded ROI assumption is:

```js
const ROI_PERCENT = 20;
```

Effects:

- Every deal is treated as having a `20%` expected ROI.
- `expected_return` is always `investment_amount * 1.2`.
- `roi_percent` is always `20`.
- Deal-specific economics, cycle outcomes, investor split, losses, fees, and `capital_return_near` are not used in the current ROI calculation.

## Missing Components

Missing backend components:

- Deal-level ROI configuration field, such as `projected_roi_pct`.
- Return status field, such as `recorded` or `voided`.
- Return audit fields, such as `recorded_by`, `updated_at`, `tx_hash`, and `return_type`.
- Admin endpoint to list return records.
- Admin endpoint to fetch return summary.
- Admin endpoint to void or correct return records.
- Tests for ROI calculations and return amount normalization.

Missing calculation components:

- Per-deal ROI.
- Return status calculation: `not_started`, `partial`, `complete`, `overpaid`.
- Explicit handling of overpayment.
- Use of `capital_return_near`, splits, fees, profits, or losses in ROI logic.
- Reconciliation between return records and on-chain balances or transaction hashes.

Missing schema consistency:

- `schema.sql` should be aligned with Postgres migrations.
- `deal_returns.deal_id` in `schema.sql` should include the same foreign key relationship as the migration.

## Recommended MVP Scope

The safest MVP scope is an off-chain, database-backed ROI and returns ledger.

Include:

- Keep `deal_returns` as the source of admin-recorded return entries.
- Replace hard-coded `ROI_PERCENT` with a deal-level projected ROI field.
- Keep investor return viewing scoped to authenticated investor-owned deals.
- Add admin return list and summary endpoints.
- Add auditable correction or void behavior instead of delete behavior.
- Label all investor-facing ROI as projected unless completion criteria are met.

Do not include in the MVP:

- Smart contract changes.
- On-chain return enforcement.
- Automatic payout proof.
- Return deletion.
- Complex profit/loss accounting.
- Investor self-recorded returns.

## Safe Implementation Order

1. Add tests around current `getDealReturnSummary`, `parseNearToYocto`, and `normalizeReturnAmount`.
2. Add an additive migration for `deals.projected_roi_pct`.
3. Update `getDealReturnSummary` to use deal-level ROI with `20` as backward-compatible default.
4. Add return status calculation.
5. Add additive return audit fields to `deal_returns`.
6. Add admin `GET /api/admin/deals/:id/returns`.
7. Add admin `GET /api/admin/deals/:id/return-summary`.
8. Add admin void/correction endpoint.
9. Update Investor Portal labels to distinguish projected and recorded values.
10. Update Admin Dashboard to show return summary and ledger.

## Implementation Recommendation

Do not change smart contracts for the MVP.

The current implementation is already close to a useful MVP, but it should be stabilized before more UI is built on top:

- remove the hard-coded ROI assumption;
- add deal-level projected ROI;
- add auditable return metadata;
- add admin read/correction endpoints;
- align schema and migrations;
- keep the feature clearly labeled as admin-recorded return reporting.
