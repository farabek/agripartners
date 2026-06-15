# ROI & Returns MVP Design Audit

## Purpose

Этот документ аудирует текущий codebase AgriPartners и предлагает самый безопасный MVP-подход для ROI и investor returns.

Проверенный scope:

- `backend/src/routes`
- `backend/src/services`
- `backend/src/db/schema.sql`
- `backend/src/db/migrations`
- `frontend/app.js`
- `frontend/index.html`

Это documentation-only design audit. Он не меняет application code, migrations, contracts, commits или deployment state.

## Findings

### Existing data available for ROI calculations

Текущий backend уже хранит достаточно deal-level data для расчета простого projected ROI и progress по returns:

- `deals.investment_amount`: principal инвестора в yoctoNEAR.
- `deals.capital_return_near`: planned capital return amount, передаваемый smart contract при deployment.
- `deals.investor_split_pct`: доля инвестора.
- `deals.farmer_split_pct`: доля фермера.
- `deals.escrow_pct`: escrow percentage.
- `deals.performance_fee_pct`: platform или performance fee percentage.
- `deals.total_cycles`: количество production cycles.
- `deals.cycle_duration_days`: ожидаемая длина цикла.
- `events.profit_near`: profit value, записываемый при admin cycle report.
- `events.losses_near`: loss value, записываемый при admin cycle report.
- `deal_returns.amount_near`: off-chain return records, введенные admin.
- `deal_returns.note`: optional context для return record.
- `deal_returns.created_at`: timestamp return record.

В `backend/src/services/dealService.js` уже есть частичная реализация ROI/returns:

- `ROI_PERCENT` жестко задан как `20`.
- `getDealReturnSummary(deal)` рассчитывает invested amount, expected return, returned amount, outstanding amount и ROI percent.
- `enrichDealWithReturnSummary(deal)` добавляет эти значения в deal payload.
- `getDealReturns(dealId)` возвращает return rows.
- `createDealReturn(dealId, repayment)` записывает admin-entered return.

Уже есть частичное API coverage:

- `GET /api/investor/deals/:id` возвращает investor-owned deal с return summary.
- `GET /api/investor/deals/:id/returns` возвращает recorded return rows.
- `POST /api/admin/deals/:id/returns` записывает admin return.

В `frontend/app.js` уже есть частичное frontend coverage:

- Investor detail загружает deal, status, balances, events, cycles, reports и returns.
- Investor detail показывает `Investment Summary` с invested, expected return, returned, outstanding и projected ROI.
- Investor detail показывает `Returns` history.
- Admin deal detail содержит форму `Record Return`.

### Whether ROI can be implemented without smart contract changes

Да, самый безопасный MVP можно реализовать без smart contract changes, если ROI и returns рассматриваются как off-chain reporting layer.

Smart contract уже хранит и отдает lifecycle state и balances через существующие backend calls:

- `get_status`
- `get_balances`
- `fund`
- `start_cycle`
- `report_cycle`
- `withdraw`

Для MVP ROI можно рассчитывать из database data и admin-entered return records:

- principal: `deals.investment_amount`
- expected return: configured ROI percent или deal-level target
- returned amount: сумма `deal_returns.amount_near`
- outstanding amount: expected return минус returned amount

Smart contract changes не требуются для первого dashboard MVP, потому что return ledger является informational и admin-controlled. Но любые будущие утверждения, что returns полностью on-chain, investor-withdrawable или contract-enforced, потребуют smart contract и event/indexing changes.

### Current gaps

Текущая реализация полезна, но еще не является product-grade MVP:

- ROI жестко задан как `20%` в `dealService.js`.
- `deal_returns` хранит только `deal_id`, `amount_near`, `note` и `created_at`.
- У return records нет явных `recorded_by`, `return_type`, `status`, `tx_hash` или audit metadata.
- `schema.sql` определяет `deal_returns` иначе, чем Postgres migration style в `backend/src/db/migrations`.
- Public `GET /api/deals/:id` не включает return summary.
- Admin dashboard может записывать returns, но не показывает полноценный return ledger или return summary в admin detail view.
- Investor dashboard cards используют enriched details, но list/detail UX должен ясно объяснять, что значения projected/admin-recorded, а не contract-guaranteed.
- Нет dedicated admin edit/delete/correction flow для ошибочных return records.

## Proposed Architecture

### MVP principle

Строить ROI & Returns MVP сначала как database-backed reporting feature.

MVP должен ясно маркировать ROI как projected, пока deal не completed и returns не recorded. Return records должны показываться как admin-recorded entries, а не automatic on-chain settlement.

### Calculation model

Использовать эти поля для initial MVP:

| Value | Source | Notes |
| --- | --- | --- |
| Invested amount | `deals.investment_amount` | Stored in yoctoNEAR. |
| ROI percent | New deal-level DB field or temporary service default | Avoid long-term hard-coded ROI. |
| Expected return | invested amount plus ROI | Computed in service layer. |
| Returned amount | Sum of `deal_returns.amount_near` | Stored as NEAR decimal strings today. |
| Outstanding amount | expected return minus returned amount | Never display below zero. |
| Return status | computed | `not_started`, `partial`, `complete`, `overpaid`. |

### Required DB changes

Самый безопасный DB design является additive и не переписывает existing deal data.

Рекомендуемая migration:

1. Добавить deal-level ROI configuration:

```sql
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS projected_roi_pct NUMERIC(8, 4) NOT NULL DEFAULT 20;
```

2. Расширить `deal_returns` для auditability:

```sql
ALTER TABLE deal_returns
  ADD COLUMN IF NOT EXISTS return_type TEXT NOT NULL DEFAULT 'admin_recorded',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'recorded',
  ADD COLUMN IF NOT EXISTS recorded_by TEXT,
  ADD COLUMN IF NOT EXISTS tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
```

3. Добавить constraints в follow-up migration после проверки existing data:

```sql
ALTER TABLE deal_returns
  ADD CONSTRAINT deal_returns_status_check
  CHECK (status IN ('recorded', 'voided'));
```

4. Синхронизировать `backend/src/db/schema.sql` с Postgres migrations, чтобы fresh database setup совпадал с production migration behavior.

Для минимального MVP можно переиспользовать существующий `deal_returns`, и тогда обязателен только `projected_roi_pct`. Для более безопасного MVP audit fields выше лучше добавить до более широкой демонстрации feature.

### Required API endpoints

Существующие endpoints, которые нужно сохранить:

- `GET /api/investor/deals/:id`
- `GET /api/investor/deals/:id/returns`
- `POST /api/admin/deals/:id/returns`

Рекомендуемые additions:

- `GET /api/investor/deals/:id/return-summary`
  - Возвращает только ROI summary для authenticated investor.
  - Полезно для refresh summary без перезагрузки всего deal.

- `GET /api/admin/deals/:id/return-summary`
  - Возвращает admin-visible ROI summary и ledger totals.

- `GET /api/admin/deals/:id/returns`
  - Показывает return records для admin review.

- `PATCH /api/admin/deals/:id/returns/:returnId`
  - Позволяет admin обновить note/status или void ошибочный return.
  - Безопаснее, чем удалять records.

- `PATCH /api/admin/deals/:id/roi`
  - Позволяет admin задать `projected_roi_pct` до deal launch или в early MVP mode.
  - Должен быть restricted и logged.

### Required Investor Portal UI changes

Investor Portal должен сохранить текущие detail-level `Investment Summary` и `Returns` sections, но усилить MVP language и list UX.

Рекомендуемые Investor Portal changes:

- На investment cards показывать:
  - Invested amount.
  - Projected ROI.
  - Expected return.
  - Returned amount.
  - Outstanding amount.
  - Return status.

- На investor deal detail показывать:
  - `Investment Summary` с labels:
    - Invested
    - Projected Return
    - Returned
    - Outstanding
    - Projected ROI
  - `Returns History` с date, amount, note и status.
  - Небольшой disclaimer: returns в MVP являются admin-recorded и не гарантируют on-chain settlement.

- Держать investor withdrawal отдельно от ROI reporting.

- Не показывать ROI как final, пока deal status не completed или expected return не fully recorded.

### Required Admin Dashboard changes

Admin Dashboard уже имеет форму `Record Return` в deal detail view. MVP должен сделать ее безопаснее и заметнее.

Рекомендуемые Admin Dashboard changes:

- Добавить admin return summary panel:
  - Invested amount.
  - Projected ROI percent.
  - Expected return.
  - Returned amount.
  - Outstanding amount.
  - Return status.

- Добавить return ledger под формой `Record Return`:
  - Date.
  - Amount.
  - Note.
  - Status.
  - Recorded by.

- Добавить validation copy рядом с form:
  - Amount is in NEAR.
  - Return record is an admin ledger entry.
  - Recording a return does not itself execute a smart contract transfer.

- Добавить void/correction path вместо удаления return rows.

- Добавить optional ROI percent setting при deal creation или в deal admin detail.

## Implementation Phases

### Phase 1: Stabilize the current MVP

- Оставить ROI off-chain и database-backed.
- Заменить hard-coded `ROI_PERCENT` на deal-level `projected_roi_pct`.
- Добавить return summary service output с понятными fields:
  - `invested_amount`
  - `projected_roi_pct`
  - `expected_return`
  - `returned_amount`
  - `outstanding_amount`
  - `return_status`
- Убедиться, что investor и admin routes используют одну summary function.
- Синхронизировать `schema.sql` с migrations.

### Phase 2: Improve admin controls

- Добавить admin `GET /returns` и `GET /return-summary`.
- Добавить return ledger display в admin detail.
- Добавить void/correction flow.
- Добавить `recorded_by`, `status`, `return_type` и optional `tx_hash`.
- Добавить tests для amount normalization и summary calculations.

### Phase 3: Improve investor UX

- Добавить return summary на investor list cards.
- Добавить более ясные projected/final ROI labels.
- Добавить returns disclaimer.
- Добавить empty, partial, complete и overpaid states.
- Добавить refresh behavior для summary и ledger.

### Phase 4: Prepare for on-chain return verification

- Решить, должны ли return records связываться с contract withdrawals, event hashes или external transfer hashes.
- Добавить optional `tx_hash` display.
- Добавить reconciliation logic между DB return records и contract balances.
- Отложить smart contract changes до проверки MVP reporting model.

## Risk Assessment

### Low risk

- Показывать projected ROI из deal и return data.
- Показывать admin-recorded return ledger.
- Добавлять investor-facing summary fields.
- Добавлять additive DB columns.

### Medium risk

- Оставить ROI hard-coded at `20%`.
- Смешивать yoctoNEAR и NEAR decimal strings across tables.
- Разрешить admins record returns без correction или void path.
- Представлять projected ROI как guaranteed.
- Fresh database setup drift из-за неполного совпадения `schema.sql` и migrations.

### High risk

- Утверждать, что returns являются on-chain-enforced, когда они admin-recorded.
- Считать `deal_returns` payment proof без transaction hash или reconciliation.
- Менять smart contracts до validation product reporting model.
- Разрешить deletion of return rows вместо auditable correction.

## Recommended MVP Decision

Реализовать ROI & Returns MVP без smart contract changes.

Использовать conservative database-backed reporting model:

- projected ROI является deal-level configuration;
- returns являются admin-recorded ledger entries;
- investor UI ясно показывает projected, returned и outstanding amounts;
- admin UI управляет recording и correction;
- future on-chain verification является later phase.
