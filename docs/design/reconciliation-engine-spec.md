# Reconciliation Engine Design Specification

## 1. Purpose

This specification defines the target Reconciliation Engine for AgriPartners Alpha v1.1 Phase 19.4. It is a design document only. It does not authorize or implement a migration, backend API change, application code change, or test change.

Reconciliation is required before Realized Profit and Realized ROI can become authoritative because a typed return entry and a payment reference are still not enough to prove that value was actually returned to the correct investor. The platform must know the economic type of the entry, the payment lifecycle state, and whether payment evidence matches the expected amount, currency, recipient, network, execution status, deal, and return entry.

This design extends the typed return ledger model from Sprint 19.3B and the admin/investor typed return UI from Sprint 19.3C. It follows ADR-001 live-first architecture and ADR-002 financial semantics: live routes must rely on authoritative backend data, and recorded off-chain returns must not be relabeled as verified, earned, realized, or reconciled without accepted evidence and audit rules.

## 2. Current State

Current Alpha state:

- Return entries can be typed as principal, profit, or fee, with correction reserved for a future policy.
- `payment_status` exists on return entries.
- New and historical rows default or backfill to `payment_status = 'recorded'`.
- `transaction_hash` exists only as an evidence/reference field.
- `transaction_hash` is not proof of payment, receipt, successful chain execution, or reconciliation.
- Admin creation paths do not allow clients to set trusted payment statuses or reconciliation fields directly.
- Investor and admin UI can display type, status, and transaction-reference information.
- No server-controlled status transition workflow exists yet.
- No reconciliation proof validation exists yet.
- Realized Profit and Realized ROI remain unavailable or not authoritative.

The current data therefore supports a typed recorded ledger, not authoritative realized performance.

## 3. Status Lifecycle

The target lifecycle is:

```text
recorded -> approved -> paid -> reconciled
```

Alpha/Beta v1 should require each transition to occur in order. Skipping directly from `recorded` to `paid` or `reconciled` should not be allowed.

Future terminal or exception states may be useful:

- `rejected`
- `voided`
- `correction_required`

These exception states are future and out of scope unless a later implementation explicitly adds them to the database, service layer, API, authorization, UI, and audit model. They must not be treated as supported just because they appear in this design.

## 4. Status Semantics

### `recorded`

`recorded` means an admin recorded an off-chain return ledger entry. The entry may be typed, but it has not been approved for payment processing.

`recorded` is not proof of payment, investor receipt, chain execution, or realized profit.

### `approved`

`approved` means an admin or authorized reviewer accepted the entry for payment processing. Approval confirms that the entry is allowed to move into the payment workflow.

`approved` is still not proof of payment. It does not mean funds moved and it does not support authoritative realized metrics.

### `paid`

`paid` means payment has been claimed or marked as paid by an authorized actor. The entry may have evidence such as a transaction hash or payment note.

`paid` is not fully reconciled. It may be wrong, duplicated, incomplete, sent to the wrong recipient, failed on-chain, or otherwise unsupported until reconciliation validation passes.

### `reconciled`

`reconciled` means payment evidence has been matched against the expected amount, recipient, currency, network, execution status, deal association, and return entry association under an accepted reconciliation policy.

Only reconciled profit entries can later support authoritative Realized Profit and Realized ROI. Reconciled principal entries can later support authoritative principal-returned metrics. Fee entries do not become investor returns.

## 5. Allowed Transitions

Allowed Alpha/Beta v1 transitions:

- `recorded -> approved`
- `approved -> paid`
- `paid -> reconciled`

The transition service should reject:

- transitions from an unknown current status;
- transitions to an unsupported target status;
- skipped transitions such as `recorded -> paid`;
- direct client writes to trusted status fields;
- transitions without an authenticated authorized actor;
- transitions that would overwrite or erase audit history.

Future optional transitions:

- `recorded -> rejected`
- `approved -> rejected`
- `paid -> correction_required`

Those optional transitions require explicit product, database, API, authorization, and UI decisions before implementation.

## 6. Authorization Model

The target authorization model is:

- Admin can record return entries.
- Admin can approve entries when business rules allow approval by the same role.
- Only an authorized admin or reviewer can mark an entry as paid.
- Only an authorized admin or reviewer can reconcile an entry.
- Investor can read status and visible evidence/reference fields for owned returns only.
- Investor cannot transition statuses or edit evidence.
- Farmer visibility remains out of scope unless explicitly approved.

Implementation may later split `admin`, `reviewer`, and `reconciler` permissions. Until that split is accepted, the design should still keep reconciliation as a trusted operation rather than a general admin form field.

## 7. Evidence Model

Minimum evidence fields:

| Field | Meaning |
| --- | --- |
| `transaction_hash` | Candidate on-chain transaction or payment reference. |
| `evidence_note` | Human explanation of the payment evidence. |
| `evidence_source` | Source system or channel, such as NEAR RPC, admin upload, bank record, or manual review. |
| `evidence_recorded_at` | Timestamp when evidence was recorded in AgriPartners. |
| `evidence_recorded_by` | Authenticated actor that recorded the evidence. |

`transaction_hash` alone is not proof. A hash can be mistyped, refer to a failed transaction, belong to another payment, use the wrong network, send the wrong amount, or pay the wrong recipient.

Evidence may be attached before reconciliation, but it must be validated before a return can move to `reconciled`. The system should preserve evidence as recorded data and separately preserve reconciliation validation results.

## 8. Reconciliation Validation

The reconciliation workflow should eventually verify:

- expected amount matches observed amount;
- expected currency or token matches observed currency or token;
- expected recipient matches observed recipient;
- expected network matches observed network;
- transaction exists on the stated network;
- transaction execution succeeded and is final enough for the accepted policy;
- deal association is correct;
- return entry association is correct;
- evidence has not already been used to reconcile another incompatible return entry;
- payment evidence has not been altered since validation without reopening reconciliation.

For NEAR evidence, later implementation should define which RPC, indexer, or explorer source is authoritative, what finality level is required, how receipts are interpreted, and how token transfers differ from native NEAR transfers.

## 9. Audit Trail

The engine needs append-only status history. A likely future table is `return_status_events`.

Minimum fields:

| Field | Meaning |
| --- | --- |
| `id` | Event identifier. |
| `return_id` | Return entry whose status changed. |
| `from_status` | Previous status. |
| `to_status` | New status. |
| `changed_by` | Authenticated actor that performed the transition. |
| `changed_at` | Server timestamp of the transition. |
| `note` | Optional human transition note. |
| `evidence_metadata_snapshot` | Snapshot of evidence metadata and validation context available at transition time. |

Events must be append-only. The system should never rely only on the current `deal_returns.payment_status` value for audit, because that value cannot explain who changed the status, when, why, or with what evidence.

## 10. Database Implications

A future implementation should use additive migration only. Likely changes:

- add evidence fields to `deal_returns` or create a separate return evidence table;
- add `return_status_events`;
- preserve current typed ledger fields;
- preserve existing `deal_returns` identifiers and historical rows;
- avoid destructive migration, renames, or inferred historical reconciliation;
- add constraints only after data preflight confirms compatibility.

If evidence is modeled in a separate table, it should support immutable evidence records and a unique policy for evidence usage. If evidence stays on `deal_returns`, status events still need snapshots so later evidence edits cannot rewrite past decisions.

## 11. API Design

Future admin endpoints:

```text
POST /api/admin/returns/:returnId/approve
POST /api/admin/returns/:returnId/mark-paid
POST /api/admin/returns/:returnId/reconcile
GET /api/admin/returns/:returnId/status-events
```

Expected API rules:

- Each transition endpoint loads the current return entry from the backend source of truth.
- Each transition verifies the actor authorization before changing state.
- Each transition validates the current status and allowed next status.
- `mark-paid` may accept evidence fields, but it should not imply reconciliation.
- `reconcile` must require accepted evidence and validation results.
- `status-events` returns append-only history for admin review.

Investor access should remain read-only through existing owned returns endpoints. Investors may see status labels, evidence references, and safe status history excerpts only for returns they are authorized to view.

## 12. Financial Calculation Rules

Financial rules:

- `recorded`, `approved`, and `paid` entries should not make Realized Profit or Realized ROI authoritative.
- Only reconciled `profit` entries may count toward authoritative Realized Profit.
- Realized ROI may be calculated only from authoritative Realized Profit and a valid Investment Amount.
- `principal` entries affect principal returned only after reconciliation.
- `fee` entries do not count as investor returns.
- `correction` entries remain out of scope until a correction policy defines direction, target entry, audit chain, and aggregation rules.
- Untyped legacy rows never become authoritative realized profit.
- Recorded Off-chain Returns may continue to exist as an Alpha planning/presentation metric, but it must not be renamed or treated as realized performance.

The reconciliation policy should be accepted before backend financial summary DTOs include authoritative realized values.

## 13. UI Implications

Admin UI should eventually include:

- status badges for `recorded`, `approved`, `paid`, and `reconciled`;
- transition buttons based on the current status and actor permission;
- evidence input for transaction hash, source, note, and supporting metadata;
- validation feedback before reconciliation;
- status history with actor, timestamp, transition, note, and evidence snapshot context.

Investor UI should include:

- read-only status labels;
- transaction reference or evidence display when safe to show;
- clear labels that distinguish recorded, paid, and reconciled states;
- no action buttons for status transitions;
- no language implying realized profit or ROI before reconciliation supports it.

Farmer UI remains out of scope for return payment status unless explicitly approved.

## 14. Risks

Key risks:

- premature Realized ROI display;
- recorded or paid entries being misread as reconciled;
- fake, mistyped, or unrelated transaction hashes;
- duplicate evidence used across multiple entries;
- wrong recipient;
- wrong amount;
- wrong currency or network;
- failed or reverted transaction treated as paid;
- manual status abuse;
- no audit trail for status changes;
- historical rows being misinterpreted as typed, paid, or realized;
- UI labels using verified or realized language too early.

The reconciliation engine exists to reduce these risks before AgriPartners presents realized performance as authoritative.

## 15. Rollout Plan

Recommended sequence:

1. Publish this design specification.
2. Add an additive migration for status events and evidence fields or evidence table.
3. Implement backend status transition services.
4. Add admin API endpoints for approve, mark-paid, reconcile, and status-events.
5. Add admin UI for status transitions, evidence entry, validation feedback, and status history.
6. Add investor read-only status and evidence/reference visibility.
7. Add later blockchain verification for NEAR and any other accepted networks.
8. Enable authoritative Realized Profit and Realized ROI only after typed entries, reconciliation rules, audit trail, and ADR-002 acceptance are complete.

Each rollout step should be independently deployable and should preserve live-first behavior. Demo data must not mask missing or failed reconciliation data.

## 16. Open Questions

- Who can reconcile: any admin, a restricted reviewer, or a separate reconciler role?
- Is approval separate from payment in all business workflows?
- Which network evidence is accepted for Alpha/Beta v1?
- How should NEAR transaction success be verified?
- Which RPC, indexer, or explorer source is authoritative?
- Can one payment reconcile multiple return entries?
- Can one return be partially paid?
- Should farmers see payment status?
- Should evidence be immutable after `paid`, after `reconciled`, or always append-only?
- What status history should investors see?
- What finality threshold is required before reconciliation?
