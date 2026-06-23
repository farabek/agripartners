# Treasury Operating Modes Specification

## 1. Purpose

This specification defines the operating modes for the AgriPartners Treasury Engine and the migration path from Alpha shadow accounting to authoritative Treasury. It is documentation only. It does not authorize backend changes, frontend changes, database migrations, API changes, or tests.

Treasury operating modes are required because AgriPartners must introduce treasury accounting without disrupting live-first workflows, overstating financial authority, or confusing recorded off-chain activity with verified settlement. The modes let the platform compare treasury ledger output against existing business workflows before Treasury becomes the required source of accounting truth.

This specification follows ADR-001 live-first architecture, ADR-002 financial semantics, the Treasury Engine Architecture Specification, the Treasury Accounting Model Specification, and the Reconciliation Engine Design Specification.

## 2. Treasury Operating Modes

### OFF

`OFF` means Treasury is disabled for workflow writes.

Behavior:

- business workflows continue unchanged;
- no treasury transactions are created;
- no treasury ledger entries are created;
- existing admin, investor, farmer, return, funding, and withdrawal behavior remains unchanged;
- financial formulas continue to use their existing backend sources;
- Treasury read views may show historical data if it already exists, but no new workflow-generated entries are written.

`OFF` is appropriate before a workflow has a safe ledger mapping, idempotency policy, and failure-handling policy.

### SHADOW

`SHADOW` means Treasury creates append-only ledger entries for selected workflows, but Treasury is not yet the source of truth.

Behavior:

- Treasury transactions and ledger entries may be created;
- Treasury entries are used for validation, reconciliation, comparison, auditing, and testing;
- business workflows continue to rely on existing business tables and services;
- Treasury failure must be logged, observable, and reviewable;
- Treasury failure should not change financial formulas, UI behavior, withdrawals, payouts, balances, or investor-facing authority;
- Treasury must not cause Realized Profit or Realized ROI to become authoritative;
- recorded off-chain return entries remain non-authoritative until reconciliation policy says otherwise.

Shadow mode must never change:

- financial formulas;
- UI labels or balances;
- withdrawal behavior;
- payout behavior;
- investor balances;
- return list response compatibility;
- existing admin and investor workflows.

Shadow mode is the expected Alpha operating mode.

### ENFORCED

`ENFORCED` means Treasury is authoritative for workflows that have been promoted into enforced operation.

Behavior:

- the business workflow requires successful Treasury transaction creation;
- Treasury failures prevent completion of the business workflow;
- double-entry integrity is mandatory;
- idempotency is mandatory for workflow-generated treasury entries;
- workflow writes and treasury writes should be transactionally consistent when they share the same database;
- failures must roll back or block the business operation rather than leaving partial accounting state;
- financial formulas, payout eligibility, and investor-visible balances may depend on Treasury only after explicit product and reconciliation acceptance.

Enforced mode is not appropriate until reconciliation validation, blockchain settlement verification where required, and extended shadow-mode validation have been completed.

## 3. Mode Transition Strategy

Recommended progression:

```text
Alpha v1.1
OFF
  |
  v
Alpha Treasury
SHADOW
  |
  v
Beta
ENFORCED
```

### Entry Criteria For OFF

`OFF` is the default for workflows that do not yet have:

- accepted treasury account mapping;
- idempotency key design;
- failure handling;
- observability;
- tests;
- reconciliation requirements.

### Entry Criteria For SHADOW

A workflow may enter `SHADOW` when it has:

- accepted non-authoritative treasury mapping;
- append-only ledger creation;
- idempotency keys;
- source references such as `source_type`, `source_id`, and `idempotency_key`;
- explicit failure logging and administrator visibility;
- tests proving existing workflow behavior remains compatible;
- clear labels preventing the entry from being treated as verified, realized, or investor payable.

The Sprint 20.2D return recording integration is the first suitable shadow workflow because it maps admin-recorded off-chain returns to `RECORDED_OFFCHAIN_RETURNS` and `TREASURY_SUSPENSE` without claiming verified settlement.

### Entry Criteria For ENFORCED

A workflow may enter `ENFORCED` only when it has:

- proven shadow-mode consistency over a defined confidence period;
- reconciliation validation for payment-sensitive workflows;
- blockchain settlement verification where blockchain execution is involved;
- idempotent write behavior;
- transactional consistency or an accepted recovery process;
- administrator monitoring and alerting;
- accepted accounting policy for the workflow;
- tests covering failure, retry, rollback, and duplicate prevention.

## 4. Workflow Classification

The table below classifies existing and planned money workflows by recommended mode.

| Workflow | Alpha v1.1 | Alpha Treasury | Beta target | Notes |
| --- | --- | --- | --- | --- |
| Return recording | `SHADOW` | `SHADOW` | `ENFORCED` after validation | Current safe mapping is debit `RECORDED_OFFCHAIN_RETURNS`, credit `TREASURY_SUSPENSE`. It must not imply verified payment. |
| Return approval | `OFF` | `SHADOW` later | `ENFORCED` later | Approval is a business workflow, not payment proof. Requires accepted payable policy before enforcement. |
| Return marked paid | `OFF` | `SHADOW` later | `ENFORCED` after reconciliation readiness | Evidence is a reference only until validated. |
| Return reconciliation | `OFF` | `SHADOW` after validation exists | `ENFORCED` only after accepted validation | Reconciliation validates Treasury; it does not replace ledger history. |
| Investor funding | `OFF` | `SHADOW` after tx/reference policy | `ENFORCED` after settlement verification | Blockchain references need validation before authority. |
| Contract deployment/funding | `OFF` | `SHADOW` after product mapping | `ENFORCED` only if it represents actual capital movement | Deployment alone should not imply investor capital movement. |
| Farmer funding | `OFF` | `SHADOW` after disbursement policy | `ENFORCED` after settlement/receipt policy | Farmer confirmation is a business event unless accounting policy says otherwise. |
| Farmer withdrawal | `OFF` | `SHADOW` after recipient/amount verification | `ENFORCED` after blockchain validation | Requires clear recipient, amount, and network evidence. |
| Investor withdrawal | `OFF` | `SHADOW` after payout mapping | `ENFORCED` after payout reconciliation | Should not become authoritative before settlement verification. |
| Admin dev fund-as / withdraw-as | `OFF` | `OFF` or isolated test shadow | Out of production scope | Dev-only flows must not pollute production Treasury history. |
| Treasury adjustments | `OFF` | `SHADOW` with strict audit metadata | `ENFORCED` after correction policy | Adjustments must be additive and reviewable. |
| Platform fee recognition | `OFF` | `SHADOW` after fee policy | `ENFORCED` after accepted accounting policy | Fees must never be counted as investor principal or profit. |

## 5. Error Handling

### OFF

Expected behavior:

- do not attempt treasury transaction creation;
- do not log false treasury errors;
- preserve existing workflow behavior.

### SHADOW

Expected behavior:

- log Treasury failure with workflow context;
- preserve the business workflow when product policy allows;
- alert administrators or mark the workflow as needing review;
- record enough context to repair or replay the treasury entry;
- mark Treasury desynchronization explicitly;
- never silently hide shadow failure.

Required failure context:

- `treasury_mode`;
- `source_type`;
- `source_id`;
- `idempotency_key`;
- related deal, investor, or farmer;
- error message and error class;
- timestamp;
- whether retry is safe.

Shadow failure must not create investor-visible realized metrics, balances, payouts, or reconciliation claims.

### ENFORCED

Expected behavior:

- reject or roll back the business workflow when Treasury creation fails;
- preserve double-entry accounting integrity;
- avoid partial rows where business state claims success but Treasury failed;
- return an explicit backend error;
- preserve idempotent retry behavior.

When business and Treasury writes share a database, they should be in one transaction. When they cross systems, the workflow needs an accepted recovery, retry, or compensation model before enforcement.

## 6. Observability

Treasury mode must be observable in logs, metrics, and administrator review surfaces.

Recommended fields:

| Field | Purpose |
| --- | --- |
| `treasury_mode` | Shows whether the workflow ran in `off`, `shadow`, or `enforced`. |
| `workflow` | Business workflow name, such as `admin_return_recording`. |
| `source_type` | Source category, such as `deal_return`. |
| `source_id` | Source row or event identifier. |
| `idempotency_key` | Duplicate-prevention key. |
| `transaction_id` | Created treasury transaction, when available. |
| `related_deal_id` | Deal context. |
| `related_investor` | Investor context, when applicable. |
| `related_farmer` | Farmer context, when applicable. |
| `synchronization_status` | `synced`, `failed`, `pending_retry`, or `manual_review_required`. |
| `reconciliation_status` | Reconciliation lifecycle status, when applicable. |
| `blockchain_reference` | Execution reference only, not proof by itself. |

Monitoring should identify:

- failed shadow writes;
- idempotency conflicts;
- unbalanced transaction rejections;
- unknown account codes;
- duplicate source references;
- ledger entries without expected source metadata;
- reconciliation mismatches;
- workflows still running in `OFF` when expected to be in `SHADOW`.

## 7. Migration Plan

AgriPartners should not use a big-bang Treasury migration.

Recommended path:

```text
SHADOW
  |
  v
parallel validation
  |
  v
confidence period
  |
  v
authoritative Treasury
```

### Shadow

Enable shadow writes for one workflow at a time. Start with low-risk, non-authoritative workflows such as admin return recording. Preserve existing API behavior and financial formulas.

### Parallel Validation

Compare Treasury ledger output against existing business tables, return status events, blockchain references, and reconciliation observations. Differences should be reviewed rather than hidden.

### Confidence Period

Run the workflow long enough to prove:

- no duplicate treasury entries;
- no silent shadow failures;
- no unexplained desynchronization;
- correct idempotent retry behavior;
- correct reconciliation behavior where applicable.

### Authoritative Treasury

Promote a workflow to enforced mode only after product, accounting, engineering, and reconciliation acceptance. Promotion should be workflow-specific, reversible through configuration, and backed by monitoring.

## 8. Future Feature Flags

Recommended base configuration:

```text
TREASURY_MODE=off
TREASURY_MODE=shadow
TREASURY_MODE=enforced
```

Recommended expansion:

```text
TREASURY_MODE=shadow
TREASURY_RETURN_RECORDING_MODE=shadow
TREASURY_INVESTOR_FUNDING_MODE=off
TREASURY_INVESTOR_WITHDRAWAL_MODE=off
TREASURY_FARMER_FUNDING_MODE=off
TREASURY_PLATFORM_FEES_MODE=off
```

### Global Mode

A global mode is simple and useful for environment defaults. It is best for early Alpha.

Risk: a single global flag may accidentally promote workflows that are not ready.

### Workflow-Specific Mode

Workflow-specific modes are safer for gradual rollout. They allow return recording to run in `SHADOW` while investor withdrawals remain `OFF`.

Risk: inconsistent mode combinations can confuse operations unless documented and monitored.

### Environment-Specific Mode

Recommended environment defaults:

| Environment | Recommended mode |
| --- | --- |
| Local development | `off` or `shadow` |
| Test | `shadow` |
| Alpha demo | `shadow` for approved workflows only |
| Production Alpha | `shadow` for approved workflows only |
| Beta | `enforced` only for workflows that meet entry criteria |

## 9. Risks

### Enforcing Too Early

Risks:

- blocking valid business workflows because Treasury mappings are incomplete;
- treating transaction hashes as settlement proof;
- making Realized Profit or Realized ROI authoritative prematurely;
- failing payouts or withdrawals without an accepted recovery process.

### Inconsistent Workflow Modes

Risks:

- return recording in `SHADOW` while payout workflows are `OFF` may produce ledger history that looks incomplete;
- admin reports may compare workflows with different authority levels;
- operators may assume all Treasury rows carry the same status.

Mitigation: every Treasury row should include source metadata and synchronization/reconciliation status.

### Partial Migration

Risks:

- legacy rows may not have Treasury entries;
- backfilled entries may be mistaken for original accounting records;
- historical return rows may be overinterpreted.

Mitigation: use explicit backfill metadata and avoid retroactive authority without review.

### Duplicate Accounting

Risks:

- retries can create duplicate Treasury transactions;
- separate workflow integrations may record the same business event twice;
- one blockchain reference may be reused across incompatible events.

Mitigation: use idempotency keys, source references, and duplicate evidence validation.

### Silent Shadow Failures

Risks:

- business workflows appear healthy while Treasury is desynchronized;
- later enforcement fails because shadow issues were never fixed;
- audit history becomes incomplete.

Mitigation: log failures, alert administrators, mark desynchronization, and test retry paths.

## 10. Final Recommendation

AgriPartners should remain in `SHADOW` mode throughout Alpha for workflows that have accepted Treasury mappings. Workflows without accepted mappings should remain `OFF`.

Treasury should move to `ENFORCED` only after:

- reconciliation validation is complete;
- blockchain settlement verification exists where required;
- idempotency and duplicate prevention have been proven;
- Treasury and legacy workflows have matched consistently over an extended validation period;
- administrator observability exists for failures, desynchronization, and reconciliation status;
- product and accounting owners accept the workflow-specific mapping.

Until then, Treasury ledger entries are valuable for validation, comparison, reconciliation, auditing, and confidence building, but they must not change financial formulas, payouts, balances, UI behavior, or Realized Profit / Realized ROI authority.
