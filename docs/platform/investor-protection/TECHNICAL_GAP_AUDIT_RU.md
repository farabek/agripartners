# Protection Reserve — Technical Gap Audit

| Поле | Значение |
| --- | --- |
| Версия аудита | Draft v1.0 |
| Дата | 2026-06-30 |
| Базовый документ | [Decision Memo v1](DECISION_MEMO_V1_RU.md) |
| Проверенная реализация | Текущее состояние `main` на дату аудита |
| Real-money readiness | `NO-GO` |

## 1. Цель аудита

Аудит сравнивает требования из [Decision Memo v1](DECISION_MEMO_V1_RU.md) с текущими:

- публичной документацией;
- frontend и portal UI;
- backend API и services;
- PostgreSQL schema и ledger foundation;
- NEAR smart contract;
- тестами и deployment posture.

Аудит не подтверждает юридическую допустимость механизма. Его задача — показать, что уже реализовано, что является только projection и какие gaps блокируют реальные средства.

## 2. Executive Summary

### Итог

Текущий уровень готовности:

- **documentation / public explanation:** высокий;
- **demo UI:** высокий;
- **model-specific rate setup:** частично реализован;
- **live reserve accounting:** низкий;
- **release governance:** не реализован;
- **Confirmed Loss governance:** не реализован;
- **staged on-chain release:** не реализован;
- **mainnet readiness:** отсутствует.

### Главный разрыв

UI и документация показывают плавающий required reserve и staged release. Текущий contract:

1. рассчитывает contribution как процент от `farmer_gross`;
2. принимает `losses_near` непосредственно от admin;
3. немедленно переводит Reserve инвестору в пределах указанного убытка;
4. возвращает весь оставшийся `escrow_pool` фермеру только после последнего цикла.

Следовательно, публичная staged-release таблица является финансовой projection, а не отражением текущей contract execution logic.

### Решение

Не расширять текущий contract точечными изменениями. Сначала реализовать Shadow Reserve Ledger и approval workflows, затем проектировать contract v2 по утверждённым требованиям.

## 3. Текущая архитектура

### 3.1. Frontend

Реализовано:

- публичные страницы Fidlot и Hissar;
- ставки 44% и 53%;
- cycle-by-cycle projection;
- итоговые суммы;
- раздельное обозначение USD projection и live NEAR balances;
- Investor, Farmer и Admin entry points;
- disclosures о риске и отсутствии гарантии.

Основной источник model projection находится в `frontend/app.js` в `INVESTOR_PROTECTION_MODELS`.

Ограничение: model data находится во frontend source, а не в versioned backend policy registry.

### 3.2. Backend

Реализовано:

- model-specific default rate resolver для Fidlot 44% и Hissar 53%;
- сохранение `escrow_pct` в сделке;
- admin cycle reporting;
- farmer reports и evidence URL;
- event history;
- typed returns и return status events;
- Treasury Ledger foundation с idempotency.

Не реализовано:

- reserve policy registry;
- contribution ledger;
- required reserve calculation;
- release proposal и approval;
- loss claim и evidence review;
- dispute и freeze;
- release reconciliation;
- USD/NEAR conversion policy.

### 3.3. Database

Таблица `deals` хранит `escrow_pct`, но не хранит:

- `model_key`;
- `model_version`;
- `reserve_policy_version`;
- `calculation_currency`;
- `minimum_reserve_rule`.

Таблицы `events`, `reports`, `farmer_cycle_updates`, `deal_returns` и Treasury Ledger дают полезную основу, но не являются Reserve subledger.

### 3.4. Smart contract

Текущий contract хранит:

- `escrow_pct`;
- `escrow_pool`;
- `capital_return_near`;
- доступные балансы фермера, инвестора и платформы.

Contract не хранит:

- model и policy version;
- investor cash received для release formula;
- required reserve;
- release proposal;
- approval evidence;
- loss claim;
- dispute/freeze;
- частичный capital return schedule Hissar.

## 4. Requirements Traceability Matrix

| ID | Требование | Текущее состояние | Gap | Приоритет | Рекомендуемое действие |
| --- | --- | --- | --- | --- | --- |
| `PR-001` | Термин Protection Reserve | UI/docs используют термин; contract всё ещё использует `escrow_*` | Internal naming может восприниматься как legal claim | P2 | Сохранить compatibility, добавить policy terminology |
| `PR-002` | Model-specific rate | Backend default resolver 44/53; contract принимает любой `0–100` | Нет immutable model/version binding | P0 | Policy registry + validation при создании deal |
| `PR-003` | База до farmer expenses | Contract считает от `farmer_gross` | Contract не знает категории расходов и их порядок | P0 | Зафиксировать cash-flow input schema |
| `PR-004` | Fee только из investor share | Contract считает fee из `investor_gross` | Требуются invariant tests для всех flows | P1 | Добавить model and property tests |
| `PR-005` | Только фактический contribution | Contract добавляет contribution только при attached profit | Backend не хранит contribution subledger | P0 | Shadow Reserve contribution entries |
| `PR-006` | Floating required reserve | Есть только в docs/UI | Полностью отсутствует backend/contract calculation | P0 | Versioned calculation engine |
| `PR-007` | Staged release | Показан в UI | Contract release только на completion | P0 | Release proposal workflow; contract v2 |
| `PR-008` | Финальные `$10,000` | Есть в model projection | Contract не знает USD floor | P0 | Currency-aware floor rule и completion checks |
| `PR-009` | Hissar `$2,500`, cycles 3–6 | Есть в docs/UI | Contract возвращает `capital_return_near` только в конце | P0 | Versioned capital return schedule |
| `PR-010` | Final herd sale | Projection показана | Нет asset sale record, valuation и settlement | P1 | Asset sale evidence + settlement record |
| `PR-011` | Confirmed Loss | Документирован концептуально | Admin передаёт `losses_near` напрямую | P0 Critical | Запрет direct execution; loss claim workflow |
| `PR-012` | Report/default freeze | Report UI существует | Нет due date, cure period или release freeze | P0 | Reporting obligations + freeze state |
| `PR-013` | Maker-checker approval | Нет | Один admin может инициировать критическое действие | P0 Critical | Approval roles, separation of duties, multisig design |
| `PR-014` | Legal ownership/custody | Открытый вопрос раскрыт | Не технический, но блокирует execution | P0 Blocker | Legal opinion и custody architecture |
| `PR-015` | Dispute/appeal | Нет | Нет state machine, evidence или deadlines | P0 | Dispute case model |
| `PR-016` | Immutable audit trail | Events и Treasury Ledger частично существуют | Нет Reserve-specific event taxonomy и source links | P1 | Reserve audit event schema |
| `PR-017` | Early termination waterfall | Contract terminate может обнулить Reserve в пользу investor up to pool | Нет договорного waterfall и asset settlement | P0 Blocker | Утвердить waterfall до contract v2 |
| `PR-018` | No-guarantee disclosure | Реализовано в основных UI/docs | Нужно автоматическое regression coverage | P2 | Content tests для всех entry points |
| `PR-019` | USD projection vs live NEAR | UI разделяет | Нет conversion/reconciliation service | P1 | FX policy; не конвертировать до утверждения |
| `PR-020` | Version immutability | Нет | Ставка хранится без policy context | P0 | DB migration и contract params |

## 5. Contract Gap Analysis

### 5.1. Contribution

Текущая логика в `contract/src/lib.rs`:

```rust
let escrow_contribution =
    farmer_gross * self.escrow_pct as u128 / 100;
```

Положительное:

- contribution вычисляется от farmer gross;
- fee не вычитается из farmer gross;
- integer arithmetic детерминирован.

Gaps:

- нет model/version binding;
- нет событий с calculation inputs;
- integer truncation не сопоставлена с USD schedule rounding;
- нет off-chain reconciliation с фактическими расходами.

### 5.2. Loss

Текущая сигнатура:

```rust
pub fn report_cycle(&mut self, losses_near: U128)
```

Admin передаёт число убытка, после чего contract автоматически уменьшает Reserve и увеличивает investor balance.

Критические gaps:

- нет `loss_claim_id`;
- нет evidence hash;
- нет reviewer;
- нет двухэтапного approval;
- нет dispute window;
- нет recovery/salvage;
- нет contractual cap кроме доступного pool;
- нет идемпотентного settlement reference.

До contract v2 прямой loss execution нельзя считать реализацией Confirmed Loss.

### 5.3. Release

Текущий release:

```rust
if self.current_cycle >= self.total_cycles {
    self.farmer_available += self.escrow_pool;
    self.escrow_pool = 0;
}
```

Отсутствуют:

- partial release;
- required reserve formula;
- investor receipts input;
- `$10,000` floor;
- report and dispute checks;
- release approval.

### 5.4. Hissar capital return

`capital_return_near` добавляется инвестору при completion. Это не соответствует schedule `$2,500` в cycles 3–6.

Contract v2 должен принимать versioned schedule или вычислять stage-specific capital return по immutable policy.

### 5.5. Termination

Если loss превышает Reserve, contract переводит доступный pool инвестору и устанавливает `Terminated`.

Не определено:

- remaining asset sale;
- competing claims;
- farmer obligations;
- partial recovery;
- appeal;
- closure evidence.

Эта ветка является P0 blocker для real-money use.

## 6. Backend и Database Gap Analysis

### 6.1. Существующие reusable foundations

Можно повторно использовать:

- `_migrations` и транзакционное применение migrations;
- `events` как high-level activity history;
- `reports` и `evidence_url`;
- `return_status_events` как пример append-only transition history;
- `treasury_transactions` и `treasury_ledger_entries`;
- idempotency keys Treasury Ledger;
- wallet-linked roles и admin authorization.

### 6.2. Недостающие таблицы Shadow Reserve v1

Предлагается добавить:

#### `reserve_policies`

```text
id
policy_key
policy_version
model_key
model_version
reserve_rate
calculation_currency
minimum_rule_json
release_rule_json
status
effective_at
created_at
```

#### `reserve_ledger_entries`

```text
id
deal_id
cycle_num
entry_type
amount
currency
policy_version
source_type
source_id
idempotency_key
metadata
created_by
created_at
```

`entry_type`:

```text
CONTRIBUTION
LOSS_ALLOCATION
RELEASE_APPROVED
RELEASE_PAID
REVERSAL
ADJUSTMENT
```

#### `reserve_release_requests`

```text
id
deal_id
cycle_num
required_reserve
available_reserve
requested_release
status
calculation_snapshot
created_by
reviewed_by
approved_at
executed_at
execution_reference
created_at
updated_at
```

#### `loss_claims`

```text
id
deal_id
cycle_num
claimed_amount
confirmed_amount
currency
status
evidence_metadata
submitted_by
reviewed_by
decision_reason
dispute_deadline
created_at
updated_at
```

#### `reserve_status_events`

Append-only transition history для release и loss cases.

### 6.3. Необходимые invariants

- один idempotency key создаёт не более одной ledger transaction;
- `PAID` release не превышает `APPROVED`;
- approved release не превышает available minus required;
- loss allocation не превышает confirmed loss;
- один actor не может быть maker и checker;
- transition history не редактируется;
- reversal создаёт новую entry, а не изменяет старую;
- policy version сделки неизменна.

## 7. Frontend Gap Analysis

### Реализовано корректно

- model projections публичны и доступны без login;
- роль может перейти в Investor, Farmer или Admin view;
- текущие rates и schedules согласованы;
- live balance не называется USD projection;
- no-guarantee warning присутствует.

### Требуется для Shadow Reserve

Investor Portal:

- actual contribution history;
- current required reserve;
- open loss claims;
- release pending/approved/paid;
- evidence и decision rationale.

Farmer Portal:

- contribution per cycle;
- available balance;
- proposed release;
- freeze reason;
- dispute action;
- payout reference.

Admin Portal:

- calculation snapshot;
- maker/checker queues;
- evidence review;
- approve/reject/suspend actions;
- audit trail;
- reconciliation status.

Пока этих данных нет, UI должен продолжать маркировать таблицу как `model projection`.

## 8. Target Architecture

### Phase A — Shadow Reserve Ledger

```text
Farmer report / cycle event
        ↓
Calculation engine
        ↓
Reserve ledger contribution
        ↓
Required reserve snapshot
        ↓
Release proposal
        ↓
Maker-checker decision
        ↓
Shadow status only — no contract transfer
```

Цель: проверить формулы, evidence, роли и reconciliation без риска средств.

### Phase B — Contract v2 Testnet

```text
Approved off-chain decision
        ↓
Signed/versioned execution payload
        ↓
Contract validates:
policy version
proposal id
amount cap
approval authority
replay protection
        ↓
On-chain release
        ↓
Tx hash reconciled to Reserve Ledger
```

### Phase C — Mainnet Gate

Требуются:

- legal sign-off;
- custody decision;
- threat model;
- independent contract audit;
- key management;
- incident response;
- reconciliation runbook;
- rollback/pausing strategy;
- successful Testnet scenario pack.

## 9. Prioritized Backlog

### P0 — до любой real-money реализации

1. Утвердить Decision Memo.
2. Закрыть ownership/custody.
3. Определить Confirmed Loss authority.
4. Определить release approval.
5. Зафиксировать early termination waterfall.
6. Добавить policy/model versioning.
7. Реализовать Shadow Reserve Ledger.
8. Запретить интерпретацию `losses_near` как Confirmed Loss без workflow.

### P1 — Shadow Reserve MVP

1. Calculation engine с snapshot.
2. Contribution ledger.
3. Release request state machine.
4. Loss claim state machine.
5. Evidence metadata.
6. Maker-checker.
7. Reserve-specific audit events.
8. Role-specific UI.
9. Reconciliation tests.

### P2 — Contract v2

1. Versioned initialization.
2. Partial release method.
3. Approved loss allocation method.
4. Replay protection.
5. Hissar capital return schedule.
6. Pause/emergency controls.
7. Property and fuzz tests.
8. Independent security audit.

## 10. Обязательные тестовые сценарии

| Сценарий | Ожидаемая проверка |
| --- | --- |
| Все циклы успешны | Все contributions, staged releases и final release сходятся |
| Loss cycle 1 | Компенсация ограничена фактически доступным Reserve |
| Loss cycle 3 | Учитываются earlier releases и investor receipts |
| Loss cycle 6 | Floor и final settlement не нарушаются |
| Full failure | Применяется утверждённый waterfall |
| Missing report | Release заморожен, contribution history сохранена |
| Partial livestock loss | Recovery и salvage уменьшают Confirmed Loss |
| Early termination | Нет автоматического неутверждённого распределения |
| Duplicate approval request | Идемпотентность предотвращает двойной release |
| Maker equals checker | Approval отклоняется |
| Policy changed after deal creation | Сделка остаётся на исходной версии |
| USD projection differs from NEAR actual | UI не смешивает currencies |

## 11. Acceptance Criteria Shadow Reserve v1

Shadow MVP считается готовым, если:

- каждая сделка связана с immutable policy version;
- каждый cycle имеет воспроизводимый calculation snapshot;
- contribution и release histories сходятся с ledger;
- release не может стать `APPROVED` без независимого checker;
- open claim/report/default автоматически создаёт freeze;
- все transitions имеют actor, timestamp и reason;
- повторный запрос не создаёт двойную запись;
- Investor/Farmer/Admin видят одинаковую authoritative state;
- ни одно Shadow действие не переводит contract funds;
- все обязательные сценарии проходят automated tests.

## 12. Go / No-Go Recommendation

### Текущий статус

`NO-GO` для реального staged release и automatic loss allocation.

### Допустимо

`GO` для:

- публичной projection;
- external feedback;
- legal review;
- Shadow Reserve Ledger;
- Testnet calculation and approval simulation.

### Условие перехода к contract v2

Contract v2 начинается только после:

1. утверждения Decision Memo;
2. закрытия legal blockers;
3. успешной Shadow validation;
4. согласованной threat model;
5. утверждённой execution authority.

## 13. Evidence References

- `docs/platform/investor-protection/FRAMEWORK_RU.md`
- `docs/platform/investor-protection/CONTRACT_TERMS_RU.md`
- `docs/platform/investor-protection/OPEN_QUESTIONS.md`
- `docs/platform/investor-protection/SCENARIOS.md`
- `frontend/app.js` — `INVESTOR_PROTECTION_MODELS`, public protection pages и portal panels
- `backend/src/routes/admin.js` — model-specific rate resolution и admin cycle reporting
- `backend/src/services/dealService.js` — events, reports, returns и transition histories
- `backend/src/db/schema.sql`
- `backend/src/db/migrations/013_treasury_ledger_foundation.sql`
- `contract/src/lib.rs` — contribution, loss allocation, completion release и balances
