# ROI & Returns MVP Final Audit

## Purpose

This document verifies that ROI & Returns MVP Phases 1-3 are complete and stable.

Reviewed scope:

- `backend/src/db/migrations/010_projected_roi_pct.sql`
- `backend/src/db/schema.sql`
- `backend/src/services/dealService.js`
- `backend/src/routes/admin.js`
- `frontend/app.js`
- `backend/tests`

No smart contracts, database schema beyond the approved Phase 1 migration, or deployment configuration were changed as part of this audit.

## Audit Result

Status: Ready for authenticated UI review and controlled staging validation.

Readiness score: 94 / 100

The MVP is functionally complete for the planned Phase 1-3 scope:

- Deal-level projected ROI is stored in the database.
- Backend return summaries use `deals.projected_roi_pct`.
- Investor responses expose ROI and return summary fields.
- Admin read endpoints expose return summaries and return ledger rows.
- Investor Portal displays projected ROI, projected return, returned amount, outstanding return, and return status.
- Admin Dashboard displays a Return Summary panel and Returns Ledger table.
- Tests pass.

## Verification Checklist

### 1. `projected_roi_pct` exists and is used

Verified.

- Migration exists: `backend/src/db/migrations/010_projected_roi_pct.sql`
- Schema includes `projected_roi_pct NUMERIC(8, 4) NOT NULL DEFAULT 20`
- Service reads `deal.projected_roi_pct`
- Frontend reads `deal.projected_roi_pct` with `roi_percent` as backward-compatible fallback

### 2. `ROI_PERCENT` hard-code is removed

Verified.

No `ROI_PERCENT` constant or direct hard-coded ROI calculation was found in the reviewed code paths.

Note: `DEFAULT_PROJECTED_ROI_PCT = '20'` remains as a compatibility fallback for legacy or missing deal data. This is acceptable because the active calculation prefers `deal.projected_roi_pct`.

### 3. `expected_return` uses deal-level projected ROI

Verified.

`dealService.getDealReturnSummary(deal)` calculates:

- `investedYocto`
- `projectedRoiPct = deal.projected_roi_pct ?? DEFAULT_PROJECTED_ROI_PCT`
- `expectedYocto = investedYocto * (100 + projectedRoiPct) / 100`

Tests cover the default 20% case and a custom 12.5% deal-level ROI case.

### 4. `returned_amount` and `outstanding_amount` are correct

Verified.

- `returned_amount` is calculated from summed `deal_returns.amount_near`.
- `outstanding_amount` is calculated as `expected_return - returned_amount`.
- Outstanding is floored at `0.00` when returned amount equals or exceeds expected return.

### 5. `return_status` logic is correct

Verified.

Backend logic:

- `returned_amount <= 0` -> `no_returns`
- `returned_amount > 0` and `< expected_return` -> `partial`
- `returned_amount >= expected_return` -> `completed`

Frontend Investor Detail also derives a fallback status from returned and expected amounts when `return_status` is missing, which protects demo and legacy records.

### 6. Investor Portal displays ROI and returns

Verified.

Investor Deal Detail displays:

- Projected ROI
- Projected Return
- Returned Amount
- Outstanding Return
- Return Status
- Returns History
- Disclaimer: "Projected returns are estimates and are not guaranteed."

### 7. Admin Dashboard displays returns summary and ledger

Verified.

Admin Deal Detail includes:

- Return Summary panel
- Returns Ledger table
- Existing Record Return form

The Record Return flow is preserved and refreshes the summary and ledger after a successful record.

### 8. Tests pass

Verified.

Command:

```bash
npm test
```

Result:

- 20 test suites passed
- 208 tests passed

Additional frontend build check:

```bash
npm run build:wallet-poc
```

Result: passed, with existing Vite browser-compatibility warnings from NEAR dependencies.

### 9. No smart contract changes

Verified.

No contract files are modified in the current diff.

### 10. No unintended files changed

Verified with caveat.

Current modified files are the expected ROI MVP implementation/test files from Phase 3 and the new audit documents. Two earlier Phase 3 UI plan documents remain untracked from the prior planning step.

No unrelated frontend, backend, contract, or test directories were modified by this audit beyond creating this documentation.

## Issues Found

No blocking issues found.

Minor residual notes:

- `DEFAULT_PROJECTED_ROI_PCT = '20'` remains intentionally as a fallback for legacy records.
- The Investor UI has fallback status derivation for demo/legacy records; backend remains the source of truth for persisted deal summaries.
- Vite build continues to emit NEAR dependency browser-compatibility warnings for Node built-ins. Build succeeds.

## Risk Assessment

Overall risk: Low.

Primary residual risks:

- Existing deployed data must have the migration applied before relying on `projected_roi_pct`.
- Authenticated UI review should confirm the final Investor/Admin presentation with real accounts and seeded returns.
- Return recording remains an admin ledger action and does not execute a smart contract transfer; this is correctly disclosed in the Admin UI.

## Recommended Next Step

Run authenticated staging validation:

1. Open a completed deal with full returned amount in Investor Portal.
2. Confirm Return Status shows `Completed`.
3. Open an active deal with no returns and confirm `No returns`.
4. Record a partial admin return and confirm Investor/Admin summaries update to `Partial return`.
5. Confirm no smart contract transaction is implied by ledger-only return recording.
