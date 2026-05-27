# AgriPartners — Дизайн Backend API

**Дата:** 2026-05-24  
**Подход:** B+ (Deal Registry + базовая auth)  
**Статус:** Одобрен

---

## 1. Общая архитектура

**Стек:** Node.js + Express.js + SQLite (better-sqlite3) + near-api-js

**Принцип:** Слоистая архитектура — каждый слой делает одно дело.

```
E:\agripartners\backend\
├── src/
│   ├── routes/
│   │   ├── deals.js       ← CRUD сделок
│   │   └── admin.js       ← start_cycle, report_cycle, deploy
│   ├── services/
│   │   ├── dealService.js ← логика работы со сделками
│   │   └── nearService.js ← деплой + транзакции + view-вызовы
│   ├── db/
│   │   ├── index.js       ← инициализация SQLite
│   │   └── schema.sql     ← структура таблиц
│   ├── near/
│   │   └── client.js      ← NEAR RPC клиент + подписание ключом
│   ├── middleware/
│   │   └── auth.js        ← проверка API-ключа для /admin
│   └── app.js             ← Express приложение
├── .env
├── package.json
└── server.js
```

**Поток запроса:**
```
HTTP запрос
  → middleware/auth.js (если /admin — проверяет X-API-Key)
  → routes/           (маршрутизация, без логики)
  → services/         (бизнес-логика)
  → db/ или near/     (данные)
  → JSON ответ
```

**Разделение источников данных:**
- Параметры сделок, история событий → SQLite (БД)
- Текущий статус и балансы → NEAR RPC (блокчейн, в реальном времени)

---

## 2. База данных (SQLite)

```sql
CREATE TABLE deals (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_address     TEXT NOT NULL UNIQUE,
  deal_type            TEXT NOT NULL,
  farmer               TEXT NOT NULL,
  investor             TEXT NOT NULL,
  admin                TEXT NOT NULL,
  platform             TEXT NOT NULL,
  investment_amount    TEXT NOT NULL,
  farmer_split_pct     INTEGER NOT NULL,
  investor_split_pct   INTEGER NOT NULL,
  escrow_pct           INTEGER NOT NULL,
  performance_fee_pct  INTEGER NOT NULL,
  cycle_duration_days  INTEGER NOT NULL,
  total_cycles         INTEGER NOT NULL,
  capital_return_near  TEXT NOT NULL,
  created_at           TEXT NOT NULL
);

CREATE TABLE events (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  deal_id      INTEGER NOT NULL REFERENCES deals(id),
  event_type   TEXT NOT NULL,
  cycle_num    INTEGER,
  profit_near  TEXT,
  losses_near  TEXT,
  tx_hash      TEXT,
  created_at   TEXT NOT NULL
);
```

**Типы event_type:** `deployed` | `cycle_started` | `cycle_reported` | `completed` | `terminated`

**Примечание:** `funded` (вызов fund() инвестором) не записывается в events — инвестор вызывает этот метод напрямую через свой кошелёк, не через backend. Текущий статус "Funded" виден через GET /api/deals/:id/status.

**Важно:** Суммы NEAR хранятся как `TEXT` — yoctoNEAR слишком большие числа для JavaScript `NUMBER`. Events — append-only лог.

---

## 3. API эндпоинты

### Публичные (без авторизации)

| Метод | URL | Источник | Описание |
| --- | --- | --- | --- |
| `GET` | `/api/deals` | БД | Список всех сделок |
| `GET` | `/api/deals/:id` | БД | Параметры одной сделки |
| `GET` | `/api/deals/:id/status` | Блокчейн | Статус + номер цикла |
| `GET` | `/api/deals/:id/balances` | Блокчейн | Балансы farmer/investor/escrow |
| `GET` | `/api/deals/:id/events` | БД | История событий |

### Защищённые (требуют заголовок `X-API-Key`)

| Метод | URL | Описание |
| --- | --- | --- |
| `POST` | `/api/admin/deals` | Деплой нового контракта + запись в БД |
| `POST` | `/api/admin/deals/:id/start-cycle` | Вызов `start_cycle()` на контракте |
| `POST` | `/api/admin/deals/:id/report-cycle` | Вызов `report_cycle()` с profit NEAR |

### Тела запросов

**POST /api/admin/deals:**
```json
{
  "deal_type": "fidlot",
  "farmer": "farmer.testnet",
  "investor": "investor1.testnet",
  "investment_amount": "50000000000000000000000000",
  "farmer_split_pct": 60,
  "investor_split_pct": 40,
  "escrow_pct": 44,
  "performance_fee_pct": 20,
  "total_cycles": 7,
  "cycle_duration_days": 150,
  "capital_return_near": "20400000000000000000000000"
}
```

**POST /api/admin/deals/:id/report-cycle:**
```json
{
  "profit_near": "5000000000000000000000000",
  "losses_near": "0"
}
```

---

## 4. Интеграция с NEAR

**Библиотека:** `near-api-js`

### near/client.js — инициализация при старте

```
1. Читает NEAR_ADMIN_PRIVATE_KEY из .env
2. Создаёт InMemoryKeyStore с этим ключом
3. Подключается к NEAR RPC (testnet или mainnet)
4. Экспортирует функции: deployContract, callMethod, viewMethod
```

### Три типа операций

**Деплой контракта:**
```
Читает WASM → создаёт субаккаунт вида "uuid.agripartners.testnet"
→ деплоит WASM → вызывает new() с параметрами
→ возвращает contract_address вида "ap-{nanoid}.agripartners.testnet"
```

**Admin транзакции (start_cycle, report_cycle):**
```
Строит транзакцию → подписывает NEAR_ADMIN_PRIVATE_KEY
→ отправляет в NEAR RPC → возвращает tx_hash
→ после report_cycle проверяет новый статус контракта
→ если статус Completed или Terminated — дописывает соответствующий event
→ tx_hash сохраняется в events таблицу
```

**View-вызовы (get_status, get_balances):**
```
Вызывает view-функцию контракта (бесплатно, без подписи)
→ возвращает JSON клиенту
```

### Переменные окружения (.env)

```
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=agripartners.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:...
WASM_PATH=../contract/target/wasm32-unknown-unknown/release/agripartners.wasm
API_KEY=supersecret123
PORT=3000
```

---

## 5. Что оставлено на v2

- JWT авторизация с ролями (farmer/investor/admin)
- Email/Telegram уведомления о событиях цикла
- Аналитика и статистика по всем сделкам
- Полноценная admin-панель с UI
- Polling блокчейна для синхронизации состояния в БД

---

## 6. Тестирование

- Запуск сервера локально (`npm start`)
- Проверка всех публичных эндпоинтов через curl или Postman
- Проверка защиты /admin — запрос без ключа должен вернуть 401
- Деплой тестового контракта через POST /api/admin/deals
- Прогон цикла: start_cycle → report_cycle → проверка events
- Проверка get_status и get_balances возвращают данные из блокчейна
