# Typed Return Model Design and Migration Specification

## 1. Purpose

This specification defines an Alpha-safe path from the current untyped return ledger to typed return entries. It is a design document only; it does not authorize or implement a database migration, API change, or application change.

Typed entries are required before Realized Profit and Realized ROI can become authoritative because the current ledger records only an amount. It cannot establish whether that amount represents returned principal, profit, a fee, or a correction. Typing alone is also insufficient: an entry must satisfy an accepted payment and reconciliation policy before it can support authoritative realized metrics.

This design follows ADR-001 live-data authority and ADR-002 financial semantics. Live routes must not substitute demo data, and current ledger rows remain Recorded Off-chain Returns until stronger evidence exists.

## 2. Current Model

The current `deal_returns` table contains:

| Field | Current meaning |
| --- | --- |
| `id` | Return ledger row identifier. |
| `deal_id` | Deal to which the recorded activity belongs. |
| `amount_near` | Return-related amount stored as a decimal NEAR string. |
| `note` | Optional free-form administrative context. |
| `created_at` | Time at which the row was recorded. |

Each current row means **Recorded Off-chain Return**. It records return-related payout activity in AgriPartners but does not prove approval, payment, investor receipt, on-chain execution, reconciliation, or a principal/profit split.

Notes are non-authoritative human context. They must not be parsed to infer type or payment state.

## 3. Target Alpha-safe Model

The proposed migration preserves all current fields and adds:

| Field | Proposed database shape | Alpha requirement |
| --- | --- | --- |
| `entry_type` | `TEXT NULL` | Economic purpose; nullable for historical rows. |
| `payment_status` | `TEXT NOT NULL DEFAULT 'recorded'` | Payment lifecycle state. |
| `currency` | `TEXT NOT NULL DEFAULT 'NEAR'` | Explicit monetary unit. |
| `recorded_by` | `TEXT NULL` | Authenticated actor that created the row. |
| `transaction_hash` | `TEXT NULL` | Optional payment-evidence reference only. |
| `reconciled_at` | `TIMESTAMPTZ NULL` | Time at which reconciliation was completed. |
| `reconciled_by` | `TEXT NULL` | Trusted actor that completed reconciliation. |
| `reconciliation_metadata` | `JSONB NULL` | Structured reconciliation evidence and audit context. |

`recorded_by` remains nullable so the migration does not invent an actor for historical rows. New rows must receive it from authenticated server context.

## 4. Field Semantics

### `entry_type`

Allowed values are:

- `principal`: repayment of invested capital;
- `profit`: return above invested capital;
- `fee`: an amount classified as a fee, not an investor payout;
- `correction`: a future immutable adjustment to another ledger entry.

Historical rows keep `entry_type = NULL`. Their DTO must expose `legacyUntyped = true`. A null type continues to mean Recorded Off-chain Return of unknown economic composition.

New Alpha rows should be typed as `principal`, `profit`, or `fee` when an administrator has an explicit basis for classification. Correction writes remain disabled under section 10. A temporarily permitted untyped new row remains non-authoritative for realized metrics.

### `payment_status`

Allowed values are:

- `recorded`: entered in the AgriPartners ledger, with no claim that payment occurred;
- `approved`: approved through a future trusted workflow, but not necessarily paid;
- `paid`: marked paid through a future trusted workflow, but not necessarily reconciled;
- `reconciled`: matched to accepted payment evidence under the reconciliation policy.

New Alpha rows default to `recorded`. A client cannot directly create a `paid` or `reconciled` row. Status transitions are server-controlled and are outside the initial typed-entry rollout.

### `currency`

The currency or unit of `amount_near`. Alpha supports `NEAR` only, and the field defaults to `NEAR`. The explicit field prevents future multi-currency values from being combined accidentally.

### `recorded_by`

The authenticated account responsible for recording the row. The server derives it from the verified admin session; request input is never trusted for this field.

### `transaction_hash`

An optional reference to a candidate on-chain transaction or other payment record. A hash does not prove successful execution, expected parties or amount, or reconciliation.

### Reconciliation fields

- `reconciled_at` records when reconciliation was completed.
- `reconciled_by` identifies the trusted reconciler.
- `reconciliation_metadata` stores structured evidence such as network, expected and observed parties, observed amount and currency, evidence identifiers, and validation results.

These fields remain null until a trusted reconciliation workflow exists. Clients cannot set them directly.

## 5. Migration Strategy

Use one future additive migration with no destructive changes:

1. Add all proposed columns without renaming or removing current columns.
2. Keep `entry_type` nullable and leave every historical value null.
3. Set or backfill `payment_status = 'recorded'` for existing rows.
4. Set or backfill `currency = 'NEAR'` for existing rows.
5. Leave actor, transaction, and reconciliation fields null for existing rows unless an explicit, auditable source already exists.
6. Add constraints only after a preflight confirms historical values satisfy them.

The migration must not infer type, actor, a payment state beyond `recorded`, or reconciliation from amount, note text, row order, deal status, events, contract balances, or transaction-like strings.

If historical `amount_near` values violate the proposed positive-decimal constraint, rollout must stop for explicit data review. The migration must not silently rewrite them. A staged `NOT VALID` constraint followed by validation is acceptable when needed to inspect legacy data safely.

## 6. Database Constraints

The future migration should propose checks for:

- `entry_type IS NULL OR entry_type IN ('principal', 'profit', 'fee', 'correction')`;
- `payment_status IN ('recorded', 'approved', 'paid', 'reconciled')`;
- `amount_near` is a valid decimal NEAR amount with no more than 24 fractional digits and is greater than zero;
- `currency = 'NEAR'` for Alpha;
- when `payment_status = 'reconciled'`, both `reconciled_at` and `reconciled_by` are non-null;
- when `payment_status <> 'reconciled'`, reconciliation fields are null unless a later workflow defines intermediate evidence.

The amount check must account for the existing `TEXT` storage and be preceded by a data preflight so malformed values cannot cause an unexpected cast failure. Application validation remains necessary but does not replace database integrity checks.

`entry_type` must not be made `NOT NULL` while historical untyped rows remain.

## 7. API Compatibility

The initial API evolution should be additive:

- Existing admin and investor GET routes keep their paths and current response fields.
- Return row responses add the new fields and `legacyUntyped`.
- Existing admin POST payloads with only `amount_near` and `note` remain valid during the compatibility window.
- A new POST payload may accept `entry_type` from the supported Alpha write set.
- The server derives `recorded_by` from the authenticated admin identity.
- The server sets `payment_status = 'recorded'` and `currency = 'NEAR'`.
- Request input cannot set trusted actor, reconciliation, or payment-status fields.

Omitted `entry_type` must not be inferred. It creates an untyped Recorded Off-chain Return until product decides to prohibit new untyped rows.

No route is removed or repurposed. Demo pilot routes remain isolated and must not backfill live ledger failures.

## 8. DTO Shape

Admin and investor return-row DTOs use the same semantics. Authorization determines which rows may be returned; it does not change their meaning.

```json
{
  "id": 42,
  "deal_id": 7,
  "amount_near": "12.50",
  "note": "Recorded principal repayment",
  "created_at": "2026-06-22T10:00:00.000Z",
  "entry_type": "principal",
  "legacyUntyped": false,
  "payment_status": "recorded",
  "currency": "NEAR",
  "recorded_by": "admin.example.near",
  "transaction_hash": null,
  "reconciled_at": null,
  "reconciled_by": null,
  "reconciliation_metadata": null
}
```

For a historical row, `entry_type` is `null` and `legacyUntyped` is `true`. Serialization preserves nulls rather than fabricating values other than the migration-backed status and currency defaults.

## 9. Financial Aggregation Rules

### Alpha

Alpha preserves the Recorded Off-chain Returns metric while making exclusions explicit:

```text
Recorded Off-chain Returns =
  sum(legacy untyped entries)
  + sum(entry_type = principal)
  + sum(entry_type = profit)
```

Only `NEAR` rows participate. During Alpha, the recorded total may include eligible rows regardless of lifecycle status because it describes ledger activity, not verified payment. The UI must retain the Recorded Off-chain Returns label.

Fee entries must not be included in Recorded Off-chain Returns and must not reduce Projected Outstanding. Correction entries must not be created or aggregated until correction policy is accepted.

```text
Projected Outstanding =
  max(Projected Total Payout - Recorded Off-chain Returns, 0)
```

Realized Profit remains unavailable unless product and business owners accept both typed-profit rules and qualifying reconciliation statuses. Realized ROI remains unavailable. Neither value may be inferred from total recorded returns.

### Future Beta

For entries satisfying the future accepted payment and reconciliation policy:

```text
Principal Returned = sum(amount where entry_type = principal and status qualifies)

Profit Returned = sum(amount where entry_type = profit and status qualifies)

Realized Profit = Profit Returned

Realized ROI = Profit Returned / Investment Amount
```

Realized ROI is unavailable when Investment Amount is zero or unavailable. The qualifying status set is unresolved and must not be assumed by implementation.

## 10. Correction Policy

Correction writes are out of scope for Alpha until the model includes:

- `corrects_return_id`, referencing the immutable entry being corrected;
- an accepted correction direction or signed-amount rule;
- immutable audit rules that prohibit editing or deleting the original entry and preserve the correction chain.

Free-form notes, negative amounts, or unattached `correction` rows are not substitutes. The database may reserve `correction`, but application write paths must reject it until this policy exists.

## 11. Reconciliation Policy

A `transaction_hash` alone is not proof of reconciliation. A future reconciliation workflow must validate at least:

- network and transaction existence;
- successful and final execution state;
- sender and recipient identities;
- amount and currency or token;
- absence of duplicate evidence use;
- relationship between payment, deal, investor, and typed economic purpose;
- trusted actor and timestamp for the reconciliation decision.

Only that workflow may set reconciled status, actor, time, and trusted metadata. Statuses qualifying for realized metrics remain subject to ADR-002 acceptance.

## 12. Security and Authorization

- An authenticated, authorized admin may create a `recorded` entry for an existing deal.
- An investor may read entries only for a deal owned by that authenticated investor.
- Farmer visibility into the investor return ledger remains out of scope.
- Clients cannot set `recorded_by`, `reconciled_by`, `reconciled_at`, `reconciliation_metadata`, or a trusted status.
- Clients cannot promote an entry to `approved`, `paid`, or `reconciled` through creation.
- Authorization checks occur before returning data or accepting a write.

## 13. Testing Plan

The future implementation requires executable tests covering:

- migration against current legacy rows and additive rollback behavior;
- safe historical defaults, null type, and `legacyUntyped = true`;
- new typed principal, profit, and fee rows;
- invalid entry types and payment statuses;
- malformed or non-positive `amount_near` values;
- `recorded_by` derivation from authenticated identity;
- rejection of client-supplied trusted statuses and reconciliation fields;
- investor ownership enforcement;
- fee exclusion from Recorded Off-chain Returns and Projected Outstanding reduction;
- disabled correction creation;
- Realized Profit and Realized ROI remaining unavailable;
- compatibility of existing POST payloads and GET response fields;
- null and legacy DTO rendering;
- unchanged, isolated demo pilot behavior.

## 14. Rollout Plan

1. Add and validate one additive migration with safe historical backfills.
2. Extend the service DTO while preserving current response fields.
3. Keep the frontend compatible with additive responses and unavailable realized metrics.
4. Add admin type selection for supported Alpha types; keep correction disabled.
5. Add investor display for type, recorded status, and legacy-untyped records.
6. Later add explicit status transitions and evidence validation.
7. Enable authoritative Realized Profit and Realized ROI only after reconciliation rules and ADR-002 decisions are accepted.

Each step should be independently deployable. Live-route failures remain visible and never fall back to demo ledger data.

## 15. Open Questions

- Should untyped creation be allowed after Alpha?
- Should fee entries appear in investor ledger?
- Should `payment_status` `approved`/`paid` be implemented in Alpha or later?
- How should corrections be represented?
- Should farmer see investor return ledger?
