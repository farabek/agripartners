# ROI & Returns Phase 3 UI Plan

## Purpose

This document audits how ROI summary data should be exposed to the Investor Portal and Admin Dashboard.

Reviewed scope:

- `backend/src/routes`
- `backend/src/services/dealService.js`
- `frontend/app.js`
- `frontend/index.html`

This is a read-only design audit. It does not change code, API routes, frontend UI, commits, or deployment state.

## Findings

### Existing API responses already containing ROI fields

The current backend already exposes ROI summary fields in one investor response:

- `GET /api/investor/deals/:id`
  - Calls `dealService.enrichDealWithReturnSummary(deal)`.
  - Response includes the original deal plus:
    - `amount`
    - `expected_return`
    - `returned_amount`
    - `outstanding_amount`
    - `roi_percent`

The admin return creation endpoint also returns a summary after a return is recorded:

- `POST /api/admin/deals/:id/returns`
  - Calls `dealService.createDealReturn(...)`.
  - Calls `dealService.getDealReturnSummary(deal)`.
  - Response includes:
    - `repayment`
    - `summary`

The investor returns endpoint exposes the ledger rows:

- `GET /api/investor/deals/:id/returns`
  - Returns rows from `deal_returns`.

### API responses not yet containing ROI fields

The following responses do not currently expose ROI summary fields:

- `GET /api/investor/deals`
  - Returns raw investor deals only.
  - Frontend compensates by calling `GET /api/investor/deals/:id` per deal through `enrichDealsForInvestor`.

- `GET /api/deals/:id`
  - Returns raw deal only.
  - Admin detail uses this route through `showDeal`.

- `GET /api/deals`
  - Returns raw deals only.

- Admin routes do not currently provide:
  - `GET /api/admin/deals/:id/returns`
  - `GET /api/admin/deals/:id/return-summary`
  - `GET /api/admin/deals/:id` with enriched summary

### Missing API fields required by Investor UI

The existing Investor Portal can render the current summary with existing fields, but the safest MVP UI would benefit from explicit fields:

- `projected_roi_pct`
  - Current frontend uses `roi_percent`.
  - `roi_percent` can remain as a compatibility alias.

- `return_status`
  - Needed to display `Not started`, `Partial`, `Complete`, or `Overpaid`.

- `invested_amount`
  - Current service returns `amount`.
  - Keep `amount`, but add `invested_amount` for clarity.

- Optional `is_projected`
  - Helps the UI label ROI as projected until completion.

Minimal investor API requirement:

- Preserve `GET /api/investor/deals/:id` response.
- Add `return_status`, `projected_roi_pct`, and `invested_amount` to the same summary payload.
- Keep `roi_percent`, `amount`, `expected_return`, `returned_amount`, and `outstanding_amount` for compatibility.

### Existing Investor Deal Detail view

Investor detail is already implemented in `frontend/app.js`:

- `showInvestorDeal(id)`
- `fetchInvestorDealBundle(id)`
- `renderInvestorDealDetail(...)`
- `renderInvestmentSummary(deal)`
- `renderRepaymentHistory(returns)`

The current investor detail bundle fetches:

- `GET /api/investor/deals/:id`
- `GET /api/investor/deals/:id/status`
- `GET /api/investor/deals/:id/balances`
- `GET /api/investor/deals/:id/events`
- `GET /api/investor/deals/:id/cycles`
- `GET /api/investor/deals/:id/reports`
- `GET /api/investor/deals/:id/returns`

Current detail view already displays:

- `Investment Summary`
- `Returns`
- Farmer reports
- Cycle status
- Technical deal data
- Investor withdrawal action

Current summary labels:

- `Invested`
- `Expected Return`
- `Returned`
- `Outstanding`
- `ROI` or `Projected ROI`

### Existing Admin Dashboard metrics

There are two admin experiences in `frontend/app.js`:

1. Demo Admin Dashboard
   - Uses static/demo data.
   - Shows:
     - `Returns Recorded`
     - `Outstanding`
     - `Return Status`
   - This path is presentation-oriented and not driven by the backend return ledger.

2. Real Admin Deal Detail
   - Uses `showDeal(id)` and `renderDealDetail(...)`.
   - Fetches raw deal, status, balances, events, and cycles.
   - Shows `Admin Actions`.
   - Includes a `Record Return` form.
   - Calls `POST /api/admin/deals/:id/returns`.
   - Ignores the returned summary after recording except for success/failure messaging.
   - Does not fetch or display admin return summary.
   - Does not fetch or display admin return ledger.

## Investor Portal Changes

### Minimal UI changes

1. Rename detail and card labels where needed:

- `Expected Return` -> `Projected Return`
- `Returns` -> `Returns History`
- Keep `Projected ROI` unless deal status is completed.

2. Display return status when available:

- `Not started`
- `Partial`
- `Complete`
- `Overpaid`

3. Add a compact MVP disclaimer near `Investment Summary` or `Returns History`:

```text
MVP returns are admin-recorded ledger entries and are not automatic on-chain settlement.
```

4. Keep investor withdrawal UI separate from ROI/returns reporting.

5. Preserve current fallback behavior:

- if `projected_roi_pct` is missing, use `roi_percent`;
- if `return_status` is missing, infer from returned and outstanding amounts or hide status.

### Minimal frontend functions affected

- `investorMetrics(deals)`
- `renderInvestorMetrics(metrics)`
- `renderInvestorDealCard(deal)`
- `investorProjectProfile(deal, status)`
- `renderInvestmentSummary(deal)`
- `renderRepaymentHistory(returns)`
- `renderInvestorDealDetail(...)`
- `refreshInvestorDeal(id)`

No `index.html` changes should be required because existing view containers are sufficient.

## Admin Dashboard Changes

### Minimal UI changes

1. Keep the existing `Record Return` form.

2. Add an admin return summary panel to real admin deal detail:

- Invested
- Projected Return
- Returned
- Outstanding
- Projected ROI
- Return Status

3. Add an admin return ledger below the record form:

- Date
- Amount
- Note
- Status if available

4. Add a short warning near the record form:

```text
Recording a return updates the admin ledger only. It does not execute a smart contract transfer.
```

5. After `POST /api/admin/deals/:id/returns`, use the returned `summary` immediately or refresh the new admin summary and ledger endpoints.

### Minimal frontend functions affected

- `showDeal(id)`
- `renderDealDetail(...)`
- `renderAdminActions(deal, status)`
- `recordAdminReturn(event, deal)`
- `refreshDeal(id)`

Demo dashboard functions can remain unchanged for the MVP:

- `renderAdminDemoSummary`
- `renderAdminDemoDealCard`
- `renderAdminDemoReturns`

## API Requirements

### Required for Investor Portal

The current investor detail endpoint is enough for minimal rendering:

- `GET /api/investor/deals/:id`

Recommended response additions:

- `projected_roi_pct`
- `invested_amount`
- `return_status`
- optional `is_projected`

Keep current response fields:

- `amount`
- `expected_return`
- `returned_amount`
- `outstanding_amount`
- `roi_percent`

Optional future endpoint:

- `GET /api/investor/deals/:id/return-summary`
  - Useful for refreshing only ROI summary without reloading the full deal.

### Required for Admin Dashboard

Admin needs read endpoints that do not exist yet:

- `GET /api/admin/deals/:id/return-summary`
  - Returns the same computed summary as investor detail, admin-scoped.

- `GET /api/admin/deals/:id/returns`
  - Returns return ledger rows for admin detail.

Existing endpoint to keep:

- `POST /api/admin/deals/:id/returns`
  - Should continue returning `{ ok, repayment, summary }`.

Optional future endpoint:

- `PATCH /api/admin/deals/:id/returns/:returnId`
  - For void/correction workflow after audit fields exist.

## Testing Strategy

### Backend tests

- Investor detail includes `projected_roi_pct`, `return_status`, and existing compatibility fields.
- Investor cannot access another investor's return summary.
- Admin return summary endpoint returns summary for an existing deal.
- Admin return ledger endpoint returns return rows for an existing deal.
- Admin return creation still returns updated summary.
- Missing deal returns `404`.

### Frontend tests

- Investor dashboard cards render projected return and ROI from API fields.
- Investor detail renders return status when present.
- Investor detail handles missing `return_status` without breaking.
- Admin detail renders summary panel from admin summary endpoint.
- Admin detail renders empty return ledger.
- Admin detail renders return ledger after return creation.
- Record Return still posts to the existing endpoint.

### Manual QA

- Test no returns.
- Test partial return.
- Test complete return.
- Test overpaid return.
- Test custom projected ROI value.
- Confirm mobile layout does not overflow.
- Confirm copy does not imply guaranteed returns or automatic on-chain settlement.

## Implementation Order

1. Extend `getDealReturnSummary` with non-breaking fields:
   - `projected_roi_pct`
   - `invested_amount`
   - `return_status`

2. Add admin read endpoints:
   - `GET /api/admin/deals/:id/return-summary`
   - `GET /api/admin/deals/:id/returns`

3. Add backend tests for the new response fields and admin endpoints.

4. Update Investor Portal labels and return status rendering.

5. Update Admin real deal detail to fetch and render return summary and ledger.

6. Update frontend tests and run visual/manual QA.

## Risk Assessment

### Low risk

- Adding non-breaking summary fields.
- Renaming labels from `Expected Return` to `Projected Return`.
- Adding read-only admin summary and ledger endpoints.
- Displaying a return status badge.

### Medium risk

- Investor list currently enriches deals by making one detail request per deal.
- Admin real detail currently uses public raw deal endpoint and needs admin-specific summary data.
- UI could confuse projected values with guaranteed returns without careful copy.
- Demo dashboard and real admin detail have different data sources.

### High risk

- Removing existing fields such as `roi_percent`, `amount`, `expected_return`, `returned_amount`, or `outstanding_amount`.
- Presenting admin-recorded returns as on-chain proof.
- Combining return recording with smart contract withdrawal behavior in the same UI language.

## Recommended Minimal Scope

Do not redesign the frontend yet.

For Phase 3 MVP, add only:

- non-breaking summary fields in service output;
- admin read endpoints for summary and ledger;
- small investor label/status updates;
- admin summary and ledger panel;
- clear MVP disclaimer copy.
