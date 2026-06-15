# Финальный аудит ROI & Returns MVP

## Цель

Этот документ проверяет, что ROI & Returns MVP Phases 1-3 завершены и стабильны.

Проверенный scope:

- `backend/src/db/migrations/010_projected_roi_pct.sql`
- `backend/src/db/schema.sql`
- `backend/src/services/dealService.js`
- `backend/src/routes/admin.js`
- `frontend/app.js`
- `backend/tests`

В рамках этого аудита не менялись smart contracts, схема базы данных за пределами утвержденной Phase 1 migration, или deployment configuration.

## Итог аудита

Статус: готово к authenticated UI review и контролируемой staging validation.

Readiness score: 94 / 100

MVP функционально завершен для запланированного scope Phase 1-3:

- Deal-level projected ROI хранится в базе данных.
- Backend return summaries используют `deals.projected_roi_pct`.
- Investor responses отдают ROI и return summary fields.
- Admin read endpoints отдают return summaries и return ledger rows.
- Investor Portal показывает projected ROI, projected return, returned amount, outstanding return и return status.
- Admin Dashboard показывает Return Summary panel и Returns Ledger table.
- Tests pass.

## Verification Checklist

### 1. `projected_roi_pct` существует и используется

Проверено.

- Migration существует: `backend/src/db/migrations/010_projected_roi_pct.sql`
- Schema содержит `projected_roi_pct NUMERIC(8, 4) NOT NULL DEFAULT 20`
- Service читает `deal.projected_roi_pct`
- Frontend читает `deal.projected_roi_pct` с backward-compatible fallback на `roi_percent`

### 2. Hard-code `ROI_PERCENT` удален

Проверено.

В проверенных code paths не найден `ROI_PERCENT` constant или прямой hard-coded ROI calculation.

Примечание: `DEFAULT_PROJECTED_ROI_PCT = '20'` остается как compatibility fallback для legacy или отсутствующих deal data. Это допустимо, потому что active calculation сначала использует `deal.projected_roi_pct`.

### 3. `expected_return` использует deal-level projected ROI

Проверено.

`dealService.getDealReturnSummary(deal)` рассчитывает:

- `investedYocto`
- `projectedRoiPct = deal.projected_roi_pct ?? DEFAULT_PROJECTED_ROI_PCT`
- `expectedYocto = investedYocto * (100 + projectedRoiPct) / 100`

Tests покрывают default 20% case и custom 12.5% deal-level ROI case.

### 4. `returned_amount` и `outstanding_amount` корректны

Проверено.

- `returned_amount` считается как сумма `deal_returns.amount_near`.
- `outstanding_amount` считается как `expected_return - returned_amount`.
- Outstanding ограничен снизу `0.00`, когда returned amount равен или больше expected return.

### 5. `return_status` logic корректна

Проверено.

Backend logic:

- `returned_amount <= 0` -> `no_returns`
- `returned_amount > 0` и `< expected_return` -> `partial`
- `returned_amount >= expected_return` -> `completed`

Investor Detail во frontend также выводит fallback status из returned и expected amounts, если `return_status` отсутствует. Это защищает demo и legacy records.

### 6. Investor Portal показывает ROI и returns

Проверено.

Investor Deal Detail показывает:

- Projected ROI
- Projected Return
- Returned Amount
- Outstanding Return
- Return Status
- Returns History
- Disclaimer: "Projected returns are estimates and are not guaranteed."

### 7. Admin Dashboard показывает returns summary и ledger

Проверено.

Admin Deal Detail включает:

- Return Summary panel
- Returns Ledger table
- Existing Record Return form

Record Return flow сохранен и обновляет summary и ledger после успешной записи.

### 8. Tests pass

Проверено.

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

Result: passed, с существующими Vite browser-compatibility warnings от NEAR dependencies.

### 9. Smart contract changes отсутствуют

Проверено.

В текущем diff нет modified contract files.

### 10. Unintended files не изменены

Проверено с caveat.

Current modified files являются ожидаемыми ROI MVP implementation/test files из Phase 3 и новыми audit documents. Два более ранних Phase 3 UI plan documents остаются untracked с предыдущего planning step.

Этот audit не менял unrelated frontend, backend, contract или test directories, кроме создания этой документации.

## Issues Found

Blocking issues не найдены.

Minor residual notes:

- `DEFAULT_PROJECTED_ROI_PCT = '20'` намеренно остается fallback для legacy records.
- Investor UI имеет fallback status derivation для demo/legacy records; backend остается source of truth для persisted deal summaries.
- Vite build продолжает выводить NEAR dependency browser-compatibility warnings для Node built-ins. Build succeeds.

## Risk Assessment

Overall risk: Low.

Primary residual risks:

- Existing deployed data должна иметь applied migration перед использованием `projected_roi_pct`.
- Authenticated UI review должен подтвердить финальное Investor/Admin отображение с real accounts и seeded returns.
- Return recording остается admin ledger action и не выполняет smart contract transfer; это корректно раскрыто в Admin UI.

## Recommended Next Step

Провести authenticated staging validation:

1. Открыть completed deal с full returned amount в Investor Portal.
2. Подтвердить, что Return Status показывает `Completed`.
3. Открыть active deal без returns и подтвердить `No returns`.
4. Записать partial admin return и подтвердить, что Investor/Admin summaries обновляются до `Partial return`.
5. Подтвердить, что ledger-only return recording не подразумевает smart contract transaction.
