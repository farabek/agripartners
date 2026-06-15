# ROI & Returns Technical Inventory

## Purpose

Этот документ описывает ROI и returns implementation, уже присутствующую в backend AgriPartners.

Проверенный scope:

- `backend/src/services/dealService.js`
- `backend/src/routes`
- `backend/src/db/schema.sql`
- `backend/src/db/migrations`

Это read-only technical inventory. Он не меняет code, database schema, migrations, commits или deployment state.

## Current State

В codebase уже есть небольшая off-chain returns implementation.

Текущая модель:

- Deals хранят investment principal и lifecycle configuration.
- Admins могут записывать return rows для deal.
- Investors могут просматривать return rows для своих deals.
- Investor deal detail responses включают computed return summary.
- ROI сейчас hard-coded как `20%` в `dealService.js`.

Implementation является database-backed и не требует smart contract changes для текущего MVP behavior.

## Existing Components

### ROI-related tables

Отдельной таблицы только для ROI configuration нет.

Existing tables, которые дают input для ROI calculations:

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

Текущая dedicated returns table - `deal_returns`.

Она определена в `backend/src/db/migrations/009_deal_returns.sql`:

| Field | Type | Purpose |
| --- | --- | --- |
| `id` | `SERIAL PRIMARY KEY` | Return row identifier. |
| `deal_id` | `INTEGER NOT NULL REFERENCES deals(id)` | Links return to deal. |
| `amount_near` | `TEXT NOT NULL` | Return amount as NEAR decimal text. |
| `note` | `TEXT` | Optional admin note. |
| `created_at` | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Return record timestamp. |

Также присутствует в `backend/src/db/schema.sql`, но с SQLite-style definitions:

- `id INTEGER PRIMARY KEY AUTOINCREMENT`
- `deal_id INTEGER NOT NULL`
- `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`

Это schema drift risk, потому что runtime database access использует `pg`, а migrations написаны в Postgres-style.

### Existing API endpoints related to returns

Investor route:

- `GET /api/investor/deals/:id`
  - Использует `dealService.enrichDealWithReturnSummary(deal)`.
  - Возвращает deal fields плюс computed return summary.
  - Доступ к investor-owned deal проверяется через `getInvestorDealById(accountId, dealId)`.

- `GET /api/investor/deals/:id/returns`
  - Использует `dealService.getDealReturns(deal.id)`.
  - Возвращает return ledger rows для investor-owned deal.

Admin route:

- `POST /api/admin/deals/:id/returns`
  - Ищет deal by id.
  - Вызывает `dealService.createDealReturn(deal.id, { amount_near, note })`.
  - Вызывает `dealService.getDealReturnSummary(deal)`.
  - Возвращает `{ ok: true, repayment, summary }`.

Admin `GET /returns`, admin `GET /return-summary`, update, void или correction endpoint сейчас отсутствуют.

### Existing services related to ROI and returns

Primary service: `backend/src/services/dealService.js`.

Existing return service functions:

- `getDealReturns(dealId)`
  - Читает rows из `deal_returns`.
  - Сортирует по `created_at ASC`.

- `createDealReturn(dealId, repayment)`
  - Normalizes `amount_near`.
  - Inserts `deal_id`, `amount_near` и `note`.
  - Возвращает inserted row.

- `getDealReturnSummary(deal)`
  - Читает return rows для deal.
  - Calculates invested amount, expected return, returned amount, outstanding amount и ROI percent.

- `enrichDealWithReturnSummary(deal)`
  - Merges computed summary into a deal response.

Existing amount helper functions:

- `parseNearToYocto(value)`
- `formatYoctoToNear(yocto)`
- `normalizeReturnAmount(value)`

### Existing admin functionality for recording returns

Backend:

- `POST /api/admin/deals/:id/returns` records an admin-entered return.
- Endpoint принимает:
  - `amount_near`
  - `note`
- Validation делегирована в `createDealReturn`.
- Invalid `amount_near` возвращает `400`.

Current limitations:

- Нет `recorded_by`.
- Нет `status`.
- Нет `return_type`.
- Нет `tx_hash`.
- Нет void или correction flow.
- Нет admin list endpoint для return records.

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

- Investor endpoints возвращают deal только когда `deals.investor` matches authenticated wallet account.

### Existing ROI calculation logic

ROI summary рассчитывается в `getDealReturnSummary(deal)`:

```js
const investedYocto = BigInt(deal.investment_amount || '0');
const expectedYocto = investedYocto * BigInt(100 + ROI_PERCENT) / 100n;
const returnedYocto = returns.reduce(
  (sum, repayment) => sum + BigInt(parseNearToYocto(repayment.amount_near)),
  0n
);
const outstandingYocto = expectedYocto > returnedYocto ? expectedYocto - returnedYocto : 0n;
```

Summary возвращает formatted NEAR decimal strings.

### Hard-coded ROI assumptions

Текущая hard-coded ROI assumption:

```js
const ROI_PERCENT = 20;
```

Effects:

- Every deal is treated as having a `20%` expected ROI.
- `expected_return` всегда `investment_amount * 1.2`.
- `roi_percent` всегда `20`.
- Deal-specific economics, cycle outcomes, investor split, losses, fees и `capital_return_near` сейчас не используются в ROI calculation.

## Missing Components

Missing backend components:

- Deal-level ROI configuration field, например `projected_roi_pct`.
- Return status field, например `recorded` или `voided`.
- Return audit fields, например `recorded_by`, `updated_at`, `tx_hash` и `return_type`.
- Admin endpoint для list return records.
- Admin endpoint для fetch return summary.
- Admin endpoint для void или correct return records.
- Tests для ROI calculations и return amount normalization.

Missing calculation components:

- Per-deal ROI.
- Return status calculation: `not_started`, `partial`, `complete`, `overpaid`.
- Explicit handling of overpayment.
- Use of `capital_return_near`, splits, fees, profits или losses in ROI logic.
- Reconciliation между return records и on-chain balances или transaction hashes.

Missing schema consistency:

- `schema.sql` should be aligned with Postgres migrations.
- `deal_returns.deal_id` в `schema.sql` должен иметь такую же foreign key relationship, как migration.

## Recommended MVP Scope

Самый безопасный MVP scope - off-chain, database-backed ROI and returns ledger.

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

Не менять smart contracts для MVP.

Текущая implementation уже близка к полезному MVP, но ее нужно стабилизировать до расширения UI:

- remove the hard-coded ROI assumption;
- add deal-level projected ROI;
- add auditable return metadata;
- add admin read/correction endpoints;
- align schema and migrations;
- keep the feature clearly labeled as admin-recorded return reporting.
