# AgriPartners — Дизайн смарт-контракта NEAR

**Дата:** 2026-05-23  
**Продукты:** Fidlot v5.9 (откорм баранчиков) + Hissar (разведение овцематок)  
**Статус:** Одобрен

---

## 1. Архитектура

**Принцип:** Один контракт = одна сделка (один фермер + один инвестор).

Fidlot и Hissar используют **одинаковый шаблон контракта** — разница только в параметрах при деплое. Каждый инвестор получает свой отдельный экземпляр контракта.

**Стек:**
- Язык: Rust
- SDK: near-sdk 5.x
- Токен: Native NEAR (Ⓝ)
- Верификация циклов: Admin (адрес платформы)
- Паттерн выплат: Pull (withdraw)

---

## 2. Участники

| Роль | Описание |
|---|---|
| `farmer` | Адрес фермера — получает 60% дохода |
| `investor` | Адрес инвестора — вносит средства, получает 40% дохода |
| `admin` | Адрес платформы — управляет циклами, верифицирует итоги |
| `platform` | Адрес для получения Performance Fee |

---

## 3. Параметры деплоя (все переменные)

| Параметр | Тип | Fidlot | Hissar |
|---|---|---|---|
| `farmer` | AccountId | адрес фермера | адрес фермера |
| `investor` | AccountId | адрес инвестора | адрес инвестора |
| `admin` | AccountId | адрес платформы | адрес платформы |
| `platform` | AccountId | адрес платформы | адрес платформы |
| `deal_type` | String | "fidlot" | "hissar" |
| `investment_amount` | Balance (NEAR) | сумма в NEAR | сумма в NEAR |
| `farmer_split_pct` | u8 | 60 | 60 |
| `investor_split_pct` | u8 | 40 | 40 |
| `escrow_pct` | u8 | 44 | **44** |
| `performance_fee_pct` | u8 | 20 | 20 |
| `cycle_duration_days` | u32 | 150 (5 мес) | **180 (6 мес)** |
| `total_cycles` | u8 | 7 | **6** |
| `capital_return_near` | Balance | ~$20,400 в NEAR | **~$20,600** (от продажи стада) |

---

## 4. State Machine

```
Initialized
    ↓  investor вызывает fund()
Funded
    ↓  admin вызывает start_cycle()
CycleActive
    ↓  admin вызывает report_cycle()
CycleSettlement
    ↓  контракт автоматически переходит
    ├── ещё есть циклы → CycleActive (следующий цикл)
    ├── все циклы завершены → Completed ✅
    └── критические потери → Terminated ❌
```

---

## 5. Функции

### `fund()` — инвестор
- Вызывает: только `investor`
- Статус: только `Initialized`
- Принимает ровно `investment_amount` NEAR, иначе возврат
- После успеха: статус → `Funded`

### `start_cycle()` — admin
- Вызывает: только `admin`
- Статус: `Funded` или `CycleSettlement`
- Переводит операционные средства фермеру на цикл
- После успеха: статус → `CycleActive`

### `report_cycle(losses_near)` — admin
- Вызывает: только `admin`
- Статус: только `CycleActive`
- Admin **прикрепляет NEAR к транзакции** — это и есть прибыль цикла (farmer + investor возвращают капитал + прибыль)
- Контракт распределяет прикреплённый NEAR по формуле (см. раздел 6)
- `losses_near` — сумма потерь (0 если успешный цикл)
- После успеха: статус → `CycleSettlement`

### `withdraw()` — farmer или investor
- Вызывает: `farmer` или `investor`
- Доступно после каждого `CycleSettlement`
- Переводит накопленный доступный баланс вызывающему
- Эскроу-пул недоступен для вывода до `Completed`

### View-функции (бесплатно, только чтение)
- `get_status()` — текущий статус, номер цикла
- `get_balances()` — балансы farmer, investor, escrow
- `get_params()` — все параметры контракта

---

## 6. Логика распределения (при report_cycle)

```
Доход цикла = profit_near

Доля фермера     = profit_near × farmer_split_pct / 100
Доля инвестора   = profit_near × investor_split_pct / 100
Performance fee  = доля инвестора × performance_fee_pct / 100  → platform
Чистая инвестору = доля инвестора - performance fee

Эскроу взнос     = доля фермера × escrow_pct / 100  → escrow_pool
Чистый фермеру   = доля фермера - эскроу взнос  → farmer_available
```

**Прибыль цикла** = NEAR прикреплённый к `report_cycle()` транзакции (attached_deposit)

**При losses_near > 0:**
```
Если losses_near ≤ escrow_pool:
    escrow_pool -= losses_near
    investor_available += losses_near   (компенсация)
    цикл продолжается

Если losses_near > escrow_pool:
    investor_available += escrow_pool   (весь эскроу → инвестору)
    escrow_pool = 0
    статус → Terminated
```

**При Completed (все циклы успешны):**
```
escrow_pool → farmer_available          (весь эскроу возвращается фермеру)
capital_return_near → investor_available (рабочий капитал возвращается инвестору)
```

**Примечание по операционным расходам фермера:**
Зарплата ($1,750/цикл) и транспорт ($1,000/цикл) — оффчейн расходы фермера.
Контракт их не отслеживает. Admin сообщает чистую прибыль (profit_near) уже с
учётом того, что эти расходы фермер покрывает самостоятельно.

---

## 7. Защита и контроль доступа

| Функция | Разрешено |
|---|---|
| `fund()` | только `investor` + статус `Initialized` |
| `start_cycle()` | только `admin` + статус `Funded`/`CycleSettlement` |
| `report_cycle()` | только `admin` + статус `CycleActive` |
| `withdraw()` | `farmer` или `investor` (свой баланс) |

Нарушение любого условия → паника контракта, NEAR возвращается.

---

## 8. Тестирование

### Unit-тесты (Rust, в контракте)
- [ ] Параметры деплоя сохраняются корректно
- [ ] `fund()` принимает ровно `investment_amount`
- [ ] `fund()` отклоняет неверную сумму
- [ ] `start_cycle()` доступен только admin
- [ ] `report_cycle()` корректно считает доли (60/40, эскроу, fee)
- [ ] `withdraw()` отдаёт правильную сумму
- [ ] Полный успешный путь × 7 циклов → Completed, эскроу возвращается
- [ ] Частичные потери → списание из эскроу, цикл продолжается
- [ ] Критические потери → Terminated

### Integration-тесты (NEAR Sandbox)
- [ ] Happy path: 7 циклов без потерь
- [ ] Один цикл с частичными потерями
- [ ] Terminated сценарий
- [ ] Fidlot параметры vs Hissar параметры
- [ ] Несанкционированный вызов → паника

### Демо для питча NEAR Protocol
- Деплой на testnet с реальными адресами
- Скрипт-демо: полный цикл за ~1 минуту (сжатые временные параметры)

---

## 9. Примеры деплоя

**Fidlot контракт:**
```
farmer = "farmer.testnet"
investor = "investor1.testnet"
admin = "agripartners.testnet"
platform = "agripartners.testnet"
deal_type = "fidlot"
investment_amount = 50000 NEAR
farmer_split_pct = 60
investor_split_pct = 40
escrow_pct = 44
performance_fee_pct = 20
cycle_duration_days = 150
total_cycles = 7
capital_return_near = 20400 NEAR  (рабочий капитал, возвращается инвестору при Completed)
```

**Hissar контракт (другой инвестор):**
```
farmer = "farmer.testnet"
investor = "investor2.testnet"
admin = "agripartners.testnet"
platform = "agripartners.testnet"
deal_type = "hissar"
investment_amount = 50000 NEAR
farmer_split_pct = 60
investor_split_pct = 40
escrow_pct = 44
performance_fee_pct = 20
cycle_duration_days = 180  (6 месяцев)
total_cycles = 6
capital_return_near = 20600 NEAR  (от продажи маточного стада после цикла 6)
```

**Примечание Hissar:** Эскроу 44% применяется так же как в Fidlot.
С цикла 3 "плата за стадо" $2,500/цикл выплачивается инвестору ДО раздела прибыли 60/40.
Admin учитывает это при отчёте — указывает чистую прибыль уже после вычета платы за стадо.
