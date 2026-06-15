# ROI & Returns MVP Implementation Plan

## Purpose

Этот документ определяет exact implementation steps для замены hard-coded `20%` ROI assumption на deal-level projected ROI.

Inputs:

- `docs/product-roadmap/01-roi-returns-mvp-design.md`
- `docs/product-roadmap/02-roi-returns-technical-inventory.md`

Это planning only. Документ не меняет code, migrations, commits, pushes, smart contracts или deployed environments.

## Recommended MVP Scope

Реализовать ROI & Returns как off-chain, database-backed reporting feature.

MVP includes:

- Add `deals.projected_roi_pct` with backward-compatible default `20`.
- Replace `ROI_PERCENT = 20` with deal-level ROI lookup.
- Keep `deal_returns` as admin-recorded return ledger.
- Add computed return status.
- Add admin read-only return summary and return ledger endpoints.
- Tighten Investor Portal and Admin Dashboard labels so ROI is clearly projected unless completed.

MVP excludes:

- Smart contract changes.
- On-chain return enforcement.
- Automatic payout proof.
- Return deletion.
- Complex profit/loss accounting.
- Investor self-recorded returns.

## Phase 1: Database Changes

### Objective

Добавить deal-level projected ROI, сохранив existing behavior для всех текущих deals.

### Files affected

- `backend/src/db/migrations/010_projected_roi_pct.sql`
- `backend/src/db/schema.sql`

### Planned changes

1. Добавить новую migration:

```sql
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS projected_roi_pct NUMERIC(8, 4) NOT NULL DEFAULT 20;
```

2. Обновить `schema.sql`, чтобы fresh database setup включал `projected_roi_pct`.

3. Сохранить default `20`, чтобы existing deals работали так же, как сейчас.

4. Не менять smart contract deployment arguments в этой phase.

### Risk level

Low.

Migration является additive и сохраняет current behavior через default value.

### Rollback strategy

- Code rollback: service code должен уметь fallback to `20`, если column unavailable.
- DB rollback, если нужен в non-production environment:

```sql
ALTER TABLE deals
  DROP COLUMN IF EXISTS projected_roi_pct;
```

Не удалять column в production, если какой-либо code path уже зависит от нее.

### Testing strategy

- Run migrations на local или staging database.
- Verify existing deals receive `projected_roi_pct = 20`.
- Verify new deal creation still succeeds.
- Verify `SELECT projected_roi_pct FROM deals LIMIT 1` works.
- Confirm no smart contract deployment behavior changes.

### Estimated effort

Small: 0.5 day.

## Phase 2: Backend Service Changes

### Objective

Перенести ROI calculation из hard-coded constant в deal-level data.

### Files affected

- `backend/src/services/dealService.js`
- Backend service tests, если они есть или будут добавлены

### Planned changes

1. Replace direct use of `ROI_PERCENT` with a function such as `getProjectedRoiPct(deal)`.

2. Use `deal.projected_roi_pct` when present.

3. Fall back to `20` only for backward compatibility.

4. Update `getDealReturnSummary(deal)` to return:

- `amount`
- `invested_amount`
- `projected_roi_pct`
- `expected_return`
- `returned_amount`
- `outstanding_amount`
- `return_status`
- `roi_percent` as a temporary compatibility alias

5. Add return status calculation:

- `not_started`: returned amount is zero.
- `partial`: returned amount is greater than zero and less than expected return.
- `complete`: returned amount equals expected return.
- `overpaid`: returned amount is greater than expected return.

6. Keep formatting behavior stable for existing frontend consumers.

### Risk level

Medium.

Calculation является central для investor-facing и admin-facing financial summaries. Основные риски: formatting, unit handling и backward compatibility.

### Rollback strategy

- Revert service changes and keep using existing `ROI_PERCENT = 20`.
- Keep DB column in place because it is additive and harmless.
- If frontend depends on new fields, temporarily keep compatibility fields in the response.

### Testing strategy

- Unit test `getDealReturnSummary` with:
  - no returns;
  - partial returns;
  - exact expected return;
  - overpayment;
  - missing `projected_roi_pct`;
  - decimal ROI values;
  - invalid return amount values.
- Verify existing response fields still exist.
- Verify `expected_return` changes when `projected_roi_pct` changes.
- Verify `outstanding_amount` does not go below zero.

### Estimated effort

Medium: 1 day.

## Phase 3: API Endpoint Changes

### Objective

Expose deal-level ROI and return summaries consistently to investor and admin clients.

### Files affected

- `backend/src/routes/investor.js`
- `backend/src/routes/admin.js`
- `backend/src/services/dealService.js`
- Backend route tests, если они есть или будут добавлены

### Planned changes

1. Keep existing endpoints:

- `GET /api/investor/deals/:id`
- `GET /api/investor/deals/:id/returns`
- `POST /api/admin/deals/:id/returns`

2. Add investor summary endpoint:

- `GET /api/investor/deals/:id/return-summary`

3. Add admin summary endpoint:

- `GET /api/admin/deals/:id/return-summary`

4. Add admin ledger endpoint:

- `GET /api/admin/deals/:id/returns`

5. Consider an admin ROI update endpoint only after Phase 1 and Phase 2 are stable:

- `PATCH /api/admin/deals/:id/roi`

6. Keep access control aligned with existing routes:

- investor routes require the authenticated wallet to match `deal.investor`;
- admin routes require admin authorization.

### Risk level

Medium.

Основные риски: authorization gaps и inconsistent response shapes между investor и admin routes.

### Rollback strategy

- New endpoints can be removed or hidden without affecting existing endpoints.
- Keep existing `GET /api/investor/deals/:id` summary behavior as the compatibility path.
- Keep `POST /api/admin/deals/:id/returns` unchanged until new reads are verified.

### Testing strategy

- Route tests for investor-owned deal access.
- Route tests for investor access denied on non-owned deals.
- Route tests for admin summary and ledger reads.
- Route tests for return creation followed by summary update.
- Verify `PATCH /roi`, if implemented, rejects invalid values and updates summary.

### Estimated effort

Medium: 1 day.

## Phase 4: Investor Portal UI Changes

### Objective

Show deal-level projected ROI and return status clearly without implying guaranteed on-chain returns.

### Files affected

- `frontend/app.js`
- `frontend/index.html` only if new static containers are needed
- `frontend/style.css` if visual states need styling

### Planned changes

1. Keep the current Investor Portal detail sections:

- `Investment Summary`
- `Returns`

2. Update labels:

- `ROI` becomes `Projected ROI` unless deal is complete.
- `Expected Return` becomes `Projected Return` where appropriate.
- `Returns` becomes `Returns History` if the section shows ledger records.

3. Add `return_status` display:

- `Not started`
- `Partial`
- `Complete`
- `Overpaid`

4. Add concise disclaimer copy:

```text
MVP returns are admin-recorded ledger entries and are not automatic on-chain settlement.
```

5. Ensure investor cards use deal-level `projected_roi_pct` instead of assuming `20`.

6. Keep investor withdrawal UI separate from ROI/returns reporting.

### Risk level

Low to medium.

Самый большой риск - user misunderstanding. Technical risk ограничен, если response compatibility fields сохранены.

### Rollback strategy

- Revert UI label and summary-card changes.
- Continue showing current `Investment Summary` fields from `GET /api/investor/deals/:id`.
- Hide `return_status` if unavailable.

### Testing strategy

- Manual UI test with no returns.
- Manual UI test with partial return.
- Manual UI test with complete return.
- Manual UI test with projected ROI other than `20`.
- Verify mobile layout does not overflow.
- Verify investor cannot view another investor's return details.

### Estimated effort

Medium: 1 day.

## Phase 5: Admin Dashboard Changes

### Objective

Give admins a clear control surface for projected ROI and recorded returns.

### Files affected

- `frontend/app.js`
- `frontend/style.css` if new ledger/status styling is needed
- `backend/src/routes/admin.js` if `PATCH /roi`, admin summary, or admin ledger endpoints are included
- `backend/src/services/dealService.js` if admin update helpers are needed

### Planned changes

1. Keep the existing `Record Return` form.

2. Add admin return summary panel:

- invested amount;
- projected ROI percent;
- projected return;
- returned amount;
- outstanding amount;
- return status.

3. Add admin return ledger:

- date;
- amount;
- note;
- status;
- recorded by, when available.

4. Add projected ROI edit control only if Phase 3 includes `PATCH /api/admin/deals/:id/roi`.

5. Add validation copy near the form:

```text
Recording a return updates the admin ledger only. It does not execute a smart contract transfer.
```

6. Defer void/correction UI until audit fields exist.

### Risk level

Medium.

Admin UI changes affect operational workflows and financial reporting. Main risks are mistaken return entry, unclear ledger status, and ROI edits after investor-facing materials were shown.

### Rollback strategy

- Hide the new summary panel and ledger while keeping the existing `Record Return` form.
- Disable ROI editing without removing `projected_roi_pct`.
- Keep admin return recording endpoint unchanged.

### Testing strategy

- Manual admin test: create return and verify summary updates.
- Manual admin test: projected ROI update changes expected return.
- Validation test: invalid ROI values are rejected.
- Validation test: invalid return amounts are rejected.
- Regression test: existing fund, start cycle, report profit, withdraw actions still work.

### Estimated effort

Medium: 1-1.5 days.

## Estimated Effort

Total MVP estimate: 4.5 to 5 days.

Suggested split:

- Phase 1: 0.5 day.
- Phase 2: 1 day.
- Phase 3: 1 day.
- Phase 4: 1 day.
- Phase 5: 1-1.5 days.

Add 0.5 to 1 extra day if automated tests are missing and must be created from scratch.

## Risk Assessment

### Low risk

- Additive `projected_roi_pct` database column.
- Backward-compatible default of `20`.
- Investor display label changes.
- Read-only summary endpoints.

### Medium risk

- Replacing hard-coded ROI in shared service logic.
- Decimal ROI handling.
- Mixed NEAR decimal and yoctoNEAR values.
- Admin projected ROI edits.
- Admin return ledger display.

### High risk

- Removing compatibility fields too early.
- Presenting projected ROI as guaranteed ROI.
- Treating admin-recorded returns as on-chain payment proof.
- Allowing destructive deletion of return records.

## Recommended Implementation Sequence

Build in this order:

1. Database column with default.
2. Service-level ROI replacement and tests.
3. Read-only summary endpoints.
4. Investor label and status updates.
5. Admin summary and ledger.
6. Admin ROI editing only after read paths are stable.

This sequence keeps the MVP reversible, avoids smart contract changes, and preserves current behavior while replacing the hard-coded `20%` assumption.
