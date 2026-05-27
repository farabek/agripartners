# AgriPartners Pitch & Launch Pack — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Задеплоить backend на Railway+Turso и frontend на Vercel, создать 5 HTML одностраничников, 3 питч-скрипта (RU/EN/UZ) и пакет документов для NEAR Foundation.

**Architecture:** Backend мигрирует с better-sqlite3 (sync) на @libsql/client (async, совместим с Turso cloud и :memory: для тестов). Frontend получает Vercel rewrite для проксирования API запросов на Railway. Все pitch-материалы — статические файлы в репозитории.

**Tech Stack:** @libsql/client, Railway (Node.js), Turso (LibSQL cloud), Vercel (static + rewrites), Tailwind CSS CDN (HTML pages), Markdown (pitch scripts + NEAR docs)

---

## Файловая структура

```
backend/
  src/db/index.js              ← заменить: Turso async клиент (было: better-sqlite3 sync)
  src/services/dealService.js  ← заменить: все функции async
  src/routes/deals.js          ← изменить: await dealService calls
  src/routes/admin.js          ← изменить: await dealService calls
  tests/db.test.js             ← заменить: async тесты + :memory:
  tests/dealService.test.js    ← заменить: async тесты + resetDb
  tests/deals.routes.test.js   ← изменить: mockResolvedValue
  tests/admin.routes.test.js   ← изменить: mockResolvedValue
  package.json                 ← добавить @libsql/client, удалить better-sqlite3
railway.json                   ← новый: Railway deployment config
contract/.gitignore            ← добавить исключение для release WASM
frontend/
  app.js                       ← изменить line 1: dynamic API_BASE
  vercel.json                  ← новый: Vercel rewrites → Railway
  pages/
    investor-brief-ru.html     ← новый
    investor-brief-en.html     ← новый
    farmer-brief-uz.html       ← новый
    farmer-brief-ru.html       ← новый
    platform-overview-en.html  ← новый
docs/
  pitch-script-ru.md           ← новый
  pitch-script-en.md           ← новый
  pitch-script-uz.md           ← новый
  near-grant-proposal.md       ← новый
  near-horizon-profile.md      ← новый
```

---

## Task 1: Turso — установка и db/index.js

**Files:**
- Modify: `backend/package.json`
- Modify: `backend/src/db/index.js`

- [ ] **Step 1.1: Установить @libsql/client, удалить better-sqlite3**

```bash
cd backend
npm install @libsql/client
npm uninstall better-sqlite3
```

- [ ] **Step 1.2: Переписать backend/src/db/index.js**

```js
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

let client = null;

async function getDb() {
  if (client) return client;
  client = createClient({
    url: process.env.TURSO_DATABASE_URL || ':memory:',
    authToken: process.env.TURSO_AUTH_TOKEN
  });
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  const stmts = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of stmts) {
    await client.execute(stmt);
  }
  return client;
}

function resetDb() {
  client = null;
}

module.exports = { getDb, resetDb };
```

- [ ] **Step 1.3: Обновить тест db.test.js**

```js
process.env.TURSO_DATABASE_URL = ':memory:';
const { getDb, resetDb } = require('../src/db/index');

beforeEach(() => { resetDb(); });

test('creates deals and events tables on init', async () => {
  const db = await getDb();
  const result = await db.execute("SELECT name FROM sqlite_master WHERE type='table'");
  const names = result.rows.map(t => t.name);
  expect(names).toContain('deals');
  expect(names).toContain('events');
});

test('getDb returns same instance on repeated calls', async () => {
  const db1 = await getDb();
  const db2 = await getDb();
  expect(db1).toBe(db2);
});
```

- [ ] **Step 1.4: Запустить тест**

```bash
cd backend && npx jest tests/db.test.js --no-coverage
```

Ожидаемый результат: `Tests: 2 passed`

- [ ] **Step 1.5: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/src/db/index.js backend/tests/db.test.js
git commit -m "feat: migrate db layer from better-sqlite3 to @libsql/client (Turso)"
```

---

## Task 2: Migrate dealService to async

**Files:**
- Modify: `backend/src/services/dealService.js`
- Modify: `backend/tests/dealService.test.js`

- [ ] **Step 2.1: Переписать dealService.js**

```js
const { getDb } = require('../db/index');

async function getAllDeals() {
  const db = await getDb();
  const result = await db.execute('SELECT * FROM deals ORDER BY created_at DESC');
  return result.rows;
}

async function getDealById(id) {
  const db = await getDb();
  const result = await db.execute({ sql: 'SELECT * FROM deals WHERE id = ?', args: [id] });
  return result.rows[0] || null;
}

async function createDeal(deal) {
  const db = await getDb();
  const result = await db.execute({
    sql: `INSERT INTO deals (
      contract_address, deal_type, farmer, investor, admin, platform,
      investment_amount, farmer_split_pct, investor_split_pct, escrow_pct,
      performance_fee_pct, cycle_duration_days, total_cycles, capital_return_near, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      deal.contract_address, deal.deal_type, deal.farmer, deal.investor,
      deal.admin, deal.platform, deal.investment_amount,
      deal.farmer_split_pct, deal.investor_split_pct, deal.escrow_pct,
      deal.performance_fee_pct, deal.cycle_duration_days, deal.total_cycles,
      deal.capital_return_near, new Date().toISOString()
    ]
  });
  return getDealById(Number(result.lastInsertRowid));
}

async function addEvent(event) {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO events (deal_id, event_type, cycle_num, profit_near, losses_near, tx_hash, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      event.deal_id, event.event_type, event.cycle_num ?? null,
      event.profit_near ?? null, event.losses_near ?? null,
      event.tx_hash ?? null, new Date().toISOString()
    ]
  });
}

async function getDealEvents(dealId) {
  const db = await getDb();
  const result = await db.execute({ sql: 'SELECT * FROM events WHERE deal_id = ? ORDER BY created_at ASC', args: [dealId] });
  return result.rows;
}

module.exports = { getAllDeals, getDealById, createDeal, addEvent, getDealEvents };
```

- [ ] **Step 2.2: Переписать dealService.test.js**

```js
process.env.TURSO_DATABASE_URL = ':memory:';
const { resetDb } = require('../src/db/index');
const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents } = require('../src/services/dealService');

const sampleDeal = {
  contract_address: 'ap123.agripartners.testnet',
  deal_type: 'fidlot',
  farmer: 'farmer.testnet',
  investor: 'investor.testnet',
  admin: 'agripartners.testnet',
  platform: 'agripartners.testnet',
  investment_amount: '50000000000000000000000000',
  farmer_split_pct: 60,
  investor_split_pct: 40,
  escrow_pct: 44,
  performance_fee_pct: 20,
  cycle_duration_days: 150,
  total_cycles: 7,
  capital_return_near: '20400000000000000000000000'
};

beforeEach(() => { resetDb(); });

test('getAllDeals returns empty array initially', async () => {
  expect(await getAllDeals()).toEqual([]);
});

test('createDeal inserts and returns deal with id', async () => {
  const deal = await createDeal(sampleDeal);
  expect(deal).toHaveProperty('id');
  expect(deal.contract_address).toBe('ap123.agripartners.testnet');
  expect(deal.deal_type).toBe('fidlot');
});

test('getDealById returns correct deal', async () => {
  const deal = await createDeal({ ...sampleDeal, contract_address: 'ap456.agripartners.testnet' });
  expect(await getDealById(deal.id)).toMatchObject({ id: deal.id });
});

test('getDealById returns null for missing id', async () => {
  expect(await getDealById(9999)).toBeNull();
});

test('getAllDeals returns inserted deals', async () => {
  await createDeal(sampleDeal);
  expect((await getAllDeals()).length).toBeGreaterThan(0);
});

test('addEvent and getDealEvents work correctly', async () => {
  const deal = await createDeal({ ...sampleDeal, contract_address: 'ap789.agripartners.testnet' });
  await addEvent({ deal_id: deal.id, event_type: 'deployed', tx_hash: 'abc123' });
  const events = await getDealEvents(deal.id);
  expect(events).toHaveLength(1);
  expect(events[0].event_type).toBe('deployed');
  expect(events[0].tx_hash).toBe('abc123');
});
```

- [ ] **Step 2.3: Запустить тест**

```bash
cd backend && npx jest tests/dealService.test.js --no-coverage
```

Ожидаемый результат: `Tests: 6 passed`

- [ ] **Step 2.4: Commit**

```bash
git add backend/src/services/dealService.js backend/tests/dealService.test.js
git commit -m "feat: make dealService fully async for Turso compatibility"
```

---

## Task 3: Обновить routes и route-тесты

**Files:**
- Modify: `backend/src/routes/deals.js`
- Modify: `backend/src/routes/admin.js`
- Modify: `backend/tests/deals.routes.test.js`
- Modify: `backend/tests/admin.routes.test.js`

- [ ] **Step 3.1: Обновить deals.js — добавить await к dealService вызовам**

Открыть `backend/src/routes/deals.js`. Найти все вызовы `dealService.*` и добавить `await`. Пример — каждая строка вида:
```js
const deal = dealService.getDealById(req.params.id);
// заменить на:
const deal = await dealService.getDealById(req.params.id);
```
То же для `getAllDeals`, `getDealEvents`.

- [ ] **Step 3.2: Обновить admin.js — добавить await к dealService вызовам**

Открыть `backend/src/routes/admin.js`. Найти все вызовы `dealService.*` и добавить `await`:
```js
const deal = await dealService.getDealById(req.params.id);
const deal = await dealService.createDeal({...});
await dealService.addEvent({...});
```

- [ ] **Step 3.3: Обновить deals.routes.test.js — sync mock → resolved mock**

В `beforeEach` заменить `mockReturnValue` на `mockResolvedValue` для dealService:
```js
beforeEach(() => {
  dealService.getAllDeals.mockResolvedValue([mockDeal]);
  dealService.getDealById.mockResolvedValue(mockDeal);
  dealService.getDealEvents.mockResolvedValue([]);
  nearService.getContractStatus.mockResolvedValue({ status: 'Funded', current_cycle: 0 });
  nearService.getContractBalances.mockResolvedValue({ farmer: '0', investor: '0', platform: '0', escrow: '0' });
});
```
Также в тесте 404: `dealService.getDealById.mockResolvedValueOnce(null);`

- [ ] **Step 3.4: Обновить admin.routes.test.js — sync mock → resolved mock**

В `beforeEach` заменить:
```js
beforeEach(() => {
  dealService.getDealById.mockResolvedValue(mockDeal);
  dealService.createDeal.mockResolvedValue(mockDeal);
  dealService.addEvent.mockResolvedValue(undefined);
  nearService.deployContract.mockResolvedValue({ contractId: 'ap1.agripartners.testnet', txHash: 'tx1' });
  nearService.startCycle.mockResolvedValue({ txHash: 'tx2' });
  nearService.reportCycle.mockResolvedValue({ txHash: 'tx3' });
  nearService.getContractStatus.mockResolvedValue({ status: 'CycleActive', current_cycle: 1 });
  nearService.fundContract = jest.fn().mockResolvedValue({ txHash: 'tx4' });
});
```
Также: `dealService.getDealById.mockResolvedValueOnce(null)` в 404 тесте.

- [ ] **Step 3.5: Запустить все тесты**

```bash
cd backend && npm test
```

Ожидаемый результат: `Tests: 29 passed` (все зелёные)

- [ ] **Step 3.6: Commit**

```bash
git add backend/src/routes/deals.js backend/src/routes/admin.js \
        backend/tests/deals.routes.test.js backend/tests/admin.routes.test.js
git commit -m "feat: update routes and tests for async dealService"
```

---

## Task 4: Railway + Vercel + WASM конфигурация

**Files:**
- Create: `railway.json`
- Modify: `contract/.gitignore`
- Modify: `frontend/app.js` (line 1)
- Create: `frontend/vercel.json`

- [ ] **Step 4.1: Создать railway.json**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

- [ ] **Step 4.2: Добавить исключение WASM в contract/.gitignore**

Открыть `contract/.gitignore` и добавить строку:
```
/target
!/target/wasm32-unknown-unknown/release/agripartners.wasm
```

- [ ] **Step 4.3: Добавить WASM в git**

```bash
git add -f contract/target/wasm32-unknown-unknown/release/agripartners.wasm
```

- [ ] **Step 4.4: Обновить app.js — динамический API_BASE**

В `frontend/app.js` заменить строку 1:
```js
// было:
const API_BASE = 'http://localhost:3000';
// стало:
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : '';
```

- [ ] **Step 4.5: Создать frontend/vercel.json**

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://agripartners-backend.railway.app/api/:path*"
    },
    {
      "source": "/health",
      "destination": "https://agripartners-backend.railway.app/health"
    }
  ]
}
```

> **Важно:** после получения реального Railway URL заменить `agripartners-backend.railway.app` на фактический URL.

- [ ] **Step 4.6: Commit**

```bash
git add railway.json contract/.gitignore \
        contract/target/wasm32-unknown-unknown/release/agripartners.wasm \
        frontend/app.js frontend/vercel.json
git commit -m "feat: add Railway/Vercel deployment config and commit WASM binary"
```

---

## Task 5: Деплой на Railway

> Требует: аккаунт на railway.app, CLI установлен (`npm i -g @railway/cli`)

- [ ] **Step 5.1: Залогиниться и создать проект**

```bash
railway login
cd backend
railway init   # выбрать "Empty Project", назвать agripartners-backend
```

- [ ] **Step 5.2: Добавить переменные окружения через Railway dashboard**

Открыть https://railway.app → проект → Variables. Добавить:
```
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=farab.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:<ключ из .env>
WASM_PATH=./contract/target/wasm32-unknown-unknown/release/agripartners.wasm
API_KEY=<новый случайный ключ, минимум 32 символа>
TURSO_DATABASE_URL=<из шага 5.3>
TURSO_AUTH_TOKEN=<из шага 5.3>
PORT=3000
```

- [ ] **Step 5.3: Создать Turso базу данных**

```bash
npm install -g turso    # если не установлен
turso auth login
turso db create agripartners
turso db show agripartners   # скопировать URL
turso db tokens create agripartners  # скопировать токен
```

Вставить URL и токен в Railway Variables (шаг 5.2).

- [ ] **Step 5.4: Деплой**

```bash
cd /e/agripartners
railway up --service agripartners-backend
```

- [ ] **Step 5.5: Проверить health endpoint**

```bash
curl https://<railway-url>/health
```

Ожидаемый результат: `{"status":"ok"}`

- [ ] **Step 5.6: Обновить Railway URL в vercel.json**

Заменить `agripartners-backend.railway.app` на реальный Railway URL в `frontend/vercel.json`. Закоммитить:

```bash
git add frontend/vercel.json
git commit -m "chore: update Railway URL in Vercel rewrite config"
```

---

## Task 6: Деплой на Vercel

> Требует: аккаунт на vercel.com, CLI установлен (`npm i -g vercel`)

- [ ] **Step 6.1: Деплой frontend**

```bash
cd /e/agripartners/frontend
vercel --prod
```

При первом запуске: выбрать "Deploy from existing project", root = `frontend/`, framework = Other.

- [ ] **Step 6.2: Проверить дашборд онлайн**

Открыть `https://<vercel-url>` в браузере. Убедиться что:
- Страница загружается
- GET /api/deals возвращает данные (через Vercel rewrite → Railway)

- [ ] **Step 6.3: Сохранить финальные URL**

Записать в `docs/live-urls.md`:
```markdown
# AgriPartners — Live URLs

- **Dashboard:** https://<vercel-url>
- **Backend API:** https://<railway-url>
- **GitHub:** https://github.com/farabek/agripartners
```

```bash
git add docs/live-urls.md
git commit -m "docs: add live deployment URLs"
git push
```

---

## Task 7: Investor Brief — HTML страницы (RU + EN)

**Files:**
- Create: `frontend/pages/investor-brief-ru.html`
- Create: `frontend/pages/investor-brief-en.html`

- [ ] **Step 7.1: Создать frontend/pages/ директорию**

```bash
mkdir -p /e/agripartners/frontend/pages
```

- [ ] **Step 7.2: Создать investor-brief-ru.html**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners — Инвестору</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print { .no-print { display: none; } body { font-size: 13px; } }
  </style>
</head>
<body class="bg-white text-gray-900 max-w-3xl mx-auto px-8 py-10 font-sans">

  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-green-800">AgriPartners</h1>
    <p class="text-gray-500 text-sm mt-1">Агро-инвестиции на блокчейне NEAR · Узбекистан</p>
  </div>

  <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
    <p class="text-lg font-semibold text-green-900 mb-4">
      Вложи $50,000 — получи $82,000 за 35 месяцев.<br>
      <span class="text-green-700">Защищено смарт-контрактом NEAR.</span>
    </p>
    <div class="grid grid-cols-4 gap-4 mt-4">
      <div><p class="text-2xl font-bold text-green-800">$50k</p><p class="text-xs text-gray-500">Инвестиция</p></div>
      <div><p class="text-2xl font-bold text-green-800">$82k</p><p class="text-xs text-gray-500">Возврат</p></div>
      <div><p class="text-2xl font-bold text-green-800">+64%</p><p class="text-xs text-gray-500">Чистый ROI</p></div>
      <div><p class="text-2xl font-bold text-green-800">21.9%</p><p class="text-xs text-gray-500">APR годовых</p></div>
    </div>
  </div>

  <h2 class="text-xl font-bold text-green-800 mb-3">Как это работает</h2>
  <ol class="list-decimal list-inside space-y-2 mb-8 text-gray-700">
    <li><strong>Вы вносите $50,000 USDC</strong> — деньги блокируются в смарт-контракте на NEAR.</li>
    <li><strong>Фермер закупает 50 голов молодняка</strong> (~$200/гол) и начинает откорм 5 месяцев.</li>
    <li><strong>Каждые 5 месяцев</strong> — продажа партии по $1,000/гол, прибыль делится 60/40. Вы получаете $9,600 на кошелёк.</li>
    <li><strong>Циклы 3–7</strong> — закупка уже из выручки (самофинансирование). Вы получаете $8,480/цикл.</li>
    <li><strong>После 35 месяцев</strong> — возврат капитала $20,400. Итого на руки: <strong>$82,000</strong>.</li>
  </ol>

  <h2 class="text-xl font-bold text-green-800 mb-3">Ваша защита</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>✅ <strong>Эскроу на блокчейне</strong> — деньги недоступны фермеру до завершения цикла</li>
    <li>✅ <strong>Условия неизменны</strong> — смарт-контракт нельзя переписать после подписания</li>
    <li>✅ <strong>Прозрачность в реальном времени</strong> — дашборд показывает статус и балансы онлайн</li>
    <li>✅ <strong>Performance Fee 20%</strong> — берётся только при положительном результате, только с вашей доли</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">Сделка</h2>
  <table class="w-full text-sm border border-gray-200 rounded mb-8">
    <tbody>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Модель</td><td class="px-4 py-2 font-medium">Fidlot v5.9 · Откорм КРС</td></tr>
      <tr class="border-b bg-gray-50"><td class="px-4 py-2 text-gray-500">Поголовье</td><td class="px-4 py-2 font-medium">50 голов × $1,000/гол</td></tr>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Циклов</td><td class="px-4 py-2 font-medium">7 × 5 мес = 35 мес</td></tr>
      <tr class="border-b bg-gray-50"><td class="px-4 py-2 text-gray-500">Сплит прибыли</td><td class="px-4 py-2 font-medium">Фермер 60% · Инвестор 40%</td></tr>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Комиссия платформы</td><td class="px-4 py-2 font-medium">20% только с доли инвестора</td></tr>
      <tr class="bg-gray-50"><td class="px-4 py-2 text-gray-500">Локация</td><td class="px-4 py-2 font-medium">Узбекистан</td></tr>
    </tbody>
  </table>

  <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
    <p class="font-semibold text-gray-800 mb-2">Документы</p>
    <p class="text-sm text-gray-600">Полный договор инвестора: <strong>Agri-Investor-Fidlot-v5.9-6040.pdf</strong></p>
    <p class="text-sm text-gray-600 mt-1">Live дашборд: <strong>https://agripartners.vercel.app</strong></p>
  </div>

  <div class="text-center border-t pt-6">
    <p class="text-gray-700 font-semibold">Готовы обсудить?</p>
    <p class="text-gray-500 text-sm mt-1">farhodmuhamadiev4@gmail.com · GitHub: farabek/agripartners</p>
    <p class="text-xs text-gray-400 mt-3">AgriPartners · RWA на NEAR Protocol · MVP на testnet ✅</p>
  </div>

</body>
</html>
```

- [ ] **Step 7.3: Создать investor-brief-en.html** (English version)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners — Investor Brief</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>@media print { .no-print { display: none; } body { font-size: 13px; } }</style>
</head>
<body class="bg-white text-gray-900 max-w-3xl mx-auto px-8 py-10 font-sans">

  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-green-800">AgriPartners</h1>
    <p class="text-gray-500 text-sm mt-1">Agricultural investments on NEAR blockchain · Uzbekistan</p>
  </div>

  <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
    <p class="text-lg font-semibold text-green-900 mb-4">
      Invest $50,000 — receive $82,000 in 35 months.<br>
      <span class="text-green-700">Secured by NEAR smart contract escrow.</span>
    </p>
    <div class="grid grid-cols-4 gap-4 mt-4">
      <div><p class="text-2xl font-bold text-green-800">$50k</p><p class="text-xs text-gray-500">Investment</p></div>
      <div><p class="text-2xl font-bold text-green-800">$82k</p><p class="text-xs text-gray-500">Return</p></div>
      <div><p class="text-2xl font-bold text-green-800">+64%</p><p class="text-xs text-gray-500">Net ROI</p></div>
      <div><p class="text-2xl font-bold text-green-800">21.9%</p><p class="text-xs text-gray-500">APR</p></div>
    </div>
  </div>

  <h2 class="text-xl font-bold text-green-800 mb-3">How It Works</h2>
  <ol class="list-decimal list-inside space-y-2 mb-8 text-gray-700">
    <li><strong>You deposit $50,000 USDC</strong> — locked in a NEAR smart contract escrow.</li>
    <li><strong>The farmer buys 50 cattle</strong> (~$200/head) and begins a 5-month fattening cycle.</li>
    <li><strong>Every 5 months</strong> — herd sold at $1,000/head, profit split 60/40. You receive $9,600.</li>
    <li><strong>Cycles 3–7</strong> — cattle purchased from revenue (self-financing). You receive $8,480/cycle.</li>
    <li><strong>After 35 months</strong> — capital returned: $20,400. Total received: <strong>$82,000</strong>.</li>
  </ol>

  <h2 class="text-xl font-bold text-green-800 mb-3">Your Protection</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>✅ <strong>On-chain escrow</strong> — funds inaccessible to the farmer until cycle completion</li>
    <li>✅ <strong>Immutable terms</strong> — smart contract cannot be changed after deployment</li>
    <li>✅ <strong>Real-time transparency</strong> — dashboard shows live status and balances</li>
    <li>✅ <strong>Performance Fee 20%</strong> — only taken from investor share, only on profit</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">Deal Structure</h2>
  <table class="w-full text-sm border border-gray-200 rounded mb-8">
    <tbody>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Model</td><td class="px-4 py-2 font-medium">Fidlot v5.9 · Cattle fattening</td></tr>
      <tr class="border-b bg-gray-50"><td class="px-4 py-2 text-gray-500">Herd</td><td class="px-4 py-2 font-medium">50 head × $1,000/head</td></tr>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Cycles</td><td class="px-4 py-2 font-medium">7 × 5 months = 35 months total</td></tr>
      <tr class="border-b bg-gray-50"><td class="px-4 py-2 text-gray-500">Profit split</td><td class="px-4 py-2 font-medium">Farmer 60% · Investor 40%</td></tr>
      <tr class="border-b"><td class="px-4 py-2 text-gray-500">Platform fee</td><td class="px-4 py-2 font-medium">20% of investor share only</td></tr>
      <tr class="bg-gray-50"><td class="px-4 py-2 text-gray-500">Location</td><td class="px-4 py-2 font-medium">Uzbekistan</td></tr>
    </tbody>
  </table>

  <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
    <p class="font-semibold text-gray-800 mb-2">Documents</p>
    <p class="text-sm text-gray-600">Full investor agreement: <strong>Agri-Investor-Fidlot-v5.9-6040.pdf</strong></p>
    <p class="text-sm text-gray-600 mt-1">Live dashboard: <strong>https://agripartners.vercel.app</strong></p>
  </div>

  <div class="text-center border-t pt-6">
    <p class="text-gray-700 font-semibold">Ready to discuss?</p>
    <p class="text-gray-500 text-sm mt-1">farhodmuhamadiev4@gmail.com · GitHub: farabek/agripartners</p>
    <p class="text-xs text-gray-400 mt-3">AgriPartners · RWA on NEAR Protocol · MVP live on testnet ✅</p>
  </div>

</body>
</html>
```

- [ ] **Step 7.4: Commit**

```bash
git add frontend/pages/
git commit -m "feat: add investor brief pages (RU + EN)"
```

---

## Task 8: Farmer Brief HTML (UZ + RU)

**Files:**
- Create: `frontend/pages/farmer-brief-uz.html`
- Create: `frontend/pages/farmer-brief-ru.html`

- [ ] **Step 8.1: Создать farmer-brief-uz.html**

```html
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners — Fermer uchun</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 max-w-3xl mx-auto px-8 py-10 font-sans">

  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-green-800">AgriPartners</h1>
    <p class="text-gray-500 text-sm mt-1">Qishloq xo'jaligi moliyalashtirish · NEAR blokcheyni</p>
  </div>

  <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
    <p class="text-lg font-semibold text-green-900">
      Siz 0 so'm kiritasiz — 35 oyda $114,250 olasiz.
    </p>
    <div class="grid grid-cols-3 gap-4 mt-4">
      <div><p class="text-2xl font-bold text-green-800">$0</p><p class="text-xs text-gray-500">Sizning kiritma</p></div>
      <div><p class="text-2xl font-bold text-green-800">$15,250</p><p class="text-xs text-gray-500">1-to'lov (5 oyda)</p></div>
      <div><p class="text-2xl font-bold text-green-800">$114,250</p><p class="text-xs text-gray-500">Jami foyda</p></div>
    </div>
  </div>

  <h2 class="text-xl font-bold text-green-800 mb-3">An'anaviy moliyalashtirishning muammolari</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>❌ <strong>Banklar:</strong> yuqori foizlar — foydasiz, barcha daromadni yeydi</li>
    <li>❌ <strong>Noaniq shartnomalar</strong> — mayda harflar, yashirin to'lovlar</li>
    <li>❌ <strong>Uzoq kelishuv</strong> — oylab kutish, hujjatlar to'plami</li>
    <li>❌ <strong>Garov va kafil</strong> — ta'minot bo'yicha murakkab talablar</li>
    <li>❌ <strong>Kechikish jarimalari</strong> — bir yomon mavsum = qarz botqog'i</li>
    <li>❌ <strong>Fermer ishonmaydi</strong> — bank hisoblaridagi pullarni nazorat qila olmaydi</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">AgriPartners qanday ishlaydi</h2>
  <ol class="list-decimal list-inside space-y-2 mb-8 text-gray-700">
    <li>Investor $50,000 kiritadi — pul blokcheynga qulflangan.</li>
    <li>Siz 50 bosh mol-qo'y sotib olasiz va boqishni boshlaysiz.</li>
    <li>5 oyda sotish: 50 bosh × $1,000 = $50,000. Foyda 60/40 bo'linadi.</li>
    <li><strong>Sizga birinchi to'lov: $15,250</strong> — 5 oydan keyin.</li>
    <li>3-tsikldan boshlab xarid daromaddan amalga oshiriladi (o'z-o'zini moliyalashtirish).</li>
    <li>35 oydan keyin: $96,250 naqd + boqish bazasi ($18,000) — <strong>sizniki abadiy</strong>.</li>
  </ol>

  <h2 class="text-xl font-bold text-green-800 mb-3">Sizning himoyangiz</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>✅ <strong>60% foyda sizniki</strong> — platforma komissiyasi faqat investordan olinadi</li>
    <li>✅ <strong>Shaffof shartlar</strong> — blokcheynga yozilgan, o'zgartirib bo'lmaydi</li>
    <li>✅ <strong>Boqish bazasi $18,000</strong> — 35 oydan keyin sizniki abadiy</li>
    <li>✅ <strong>Haqiqiy vaqt nazorati</strong> — dashboard orqali barcha ko'rsatkichlar</li>
  </ul>

  <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
    <p class="font-semibold text-gray-800 mb-2">Hujjatlar</p>
    <p class="text-sm text-gray-600">To'liq fermer shartnomasi: <strong>Agri-Farmer-Fidlot-v5.9-6040.pdf</strong></p>
    <p class="text-sm text-gray-600 mt-1">Dashboard: <strong>https://agripartners.vercel.app</strong></p>
  </div>

  <div class="text-center border-t pt-6">
    <p class="text-gray-700 font-semibold">Muzokaralar uchun:</p>
    <p class="text-gray-500 text-sm mt-1">farhodmuhamadiev4@gmail.com</p>
    <p class="text-xs text-gray-400 mt-3">AgriPartners · NEAR Protocol · MVP tayyor ✅</p>
  </div>

</body>
</html>
```

- [ ] **Step 8.2: Создать farmer-brief-ru.html** (русская версия для фермера)

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners — Фермеру</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 max-w-3xl mx-auto px-8 py-10 font-sans">

  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-green-800">AgriPartners</h1>
    <p class="text-gray-500 text-sm mt-1">Агро-финансирование на блокчейне · Узбекистан</p>
  </div>

  <div class="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
    <p class="text-lg font-semibold text-green-900">
      Вы вкладываете $0 — за 35 месяцев получаете $114,250.
    </p>
    <div class="grid grid-cols-3 gap-4 mt-4">
      <div><p class="text-2xl font-bold text-green-800">$0</p><p class="text-xs text-gray-500">Ваши вложения</p></div>
      <div><p class="text-2xl font-bold text-green-800">$15,250</p><p class="text-xs text-gray-500">Первая выплата (5 мес)</p></div>
      <div><p class="text-2xl font-bold text-green-800">$114,250</p><p class="text-xs text-gray-500">Итого выгода</p></div>
    </div>
  </div>

  <h2 class="text-xl font-bold text-green-800 mb-3">Проблемы традиционного финансирования</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>❌ <strong>Банки:</strong> высокие % — невыгодно, съедает всю прибыль</li>
    <li>❌ <strong>Непрозрачные договоры</strong> — мелкий шрифт, скрытые комиссии</li>
    <li>❌ <strong>Долгое согласование</strong> — месяцы ожидания, горы документов</li>
    <li>❌ <strong>Залог и поручители</strong> — сложные требования к обеспечению</li>
    <li>❌ <strong>Штрафы при просрочке</strong> — один плохой сезон = долговая яма</li>
    <li>❌ <strong>Фермер не доверяет</strong> — нет прозрачного контроля над деньгами на счетах в банках</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">Как работает AgriPartners</h2>
  <ol class="list-decimal list-inside space-y-2 mb-8 text-gray-700">
    <li>Инвестор вносит $50,000 — деньги заблокированы в смарт-контракте.</li>
    <li>Вы закупаете 50 голов молодняка и начинаете откорм.</li>
    <li>Через 5 месяцев продажа: 50 гол × $1,000 = $50,000. Прибыль делится 60/40.</li>
    <li><strong>Ваша первая выплата: $15,250</strong> — через 5 месяцев после старта.</li>
    <li>С цикла 3 — закупка из выручки (самофинансирование, без доп. вложений).</li>
    <li>После 35 месяцев: $96,250 деньгами + база $18,000 — <strong>ваша навсегда</strong>.</li>
  </ol>

  <h2 class="text-xl font-bold text-green-800 mb-3">Ваша защита</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>✅ <strong>60% прибыли ваши</strong> — комиссия платформы берётся только с инвесторов</li>
    <li>✅ <strong>Прозрачные условия</strong> — зафиксированы в блокчейне, не изменяются</li>
    <li>✅ <strong>Откормочная база $18,000</strong> — остаётся вам навсегда после 35 мес</li>
    <li>✅ <strong>Контроль в реальном времени</strong> — дашборд показывает все балансы онлайн</li>
  </ul>

  <div class="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
    <p class="font-semibold text-gray-800 mb-2">Документы</p>
    <p class="text-sm text-gray-600">Полный договор фермера: <strong>Agri-Farmer-Fidlot-v5.9-6040.pdf</strong></p>
    <p class="text-sm text-gray-600 mt-1">Дашборд: <strong>https://agripartners.vercel.app</strong></p>
  </div>

  <div class="text-center border-t pt-6">
    <p class="text-gray-700 font-semibold">Обсудить условия:</p>
    <p class="text-gray-500 text-sm mt-1">farhodmuhamadiev4@gmail.com</p>
    <p class="text-xs text-gray-400 mt-3">AgriPartners · NEAR Protocol · MVP готов ✅</p>
  </div>

</body>
</html>
```

- [ ] **Step 8.3: Commit**

```bash
git add frontend/pages/farmer-brief-uz.html frontend/pages/farmer-brief-ru.html
git commit -m "feat: add farmer brief pages (UZ + RU)"
```

---

## Task 9: Platform Overview HTML (EN)

**Files:**
- Create: `frontend/pages/platform-overview-en.html`

- [ ] **Step 9.1: Создать platform-overview-en.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners — Platform Overview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 max-w-3xl mx-auto px-8 py-10 font-sans">

  <div class="text-center mb-8">
    <h1 class="text-3xl font-bold text-green-800">AgriPartners</h1>
    <p class="text-green-700 font-medium mt-1">Real-World Asset platform for Central Asian agriculture on NEAR</p>
    <p class="text-gray-500 text-sm mt-1">MVP live on testnet · Solo founder · Uzbekistan → Central Asia → Global</p>
  </div>

  <div class="grid grid-cols-3 gap-4 mb-8">
    <div class="bg-green-50 rounded-xl p-4 text-center">
      <p class="text-2xl font-bold text-green-800">$10B+</p>
      <p class="text-xs text-gray-500">Uzbekistan agri market</p>
    </div>
    <div class="bg-green-50 rounded-xl p-4 text-center">
      <p class="text-2xl font-bold text-green-800">60%</p>
      <p class="text-xs text-gray-500">Farmers without financing</p>
    </div>
    <div class="bg-green-50 rounded-xl p-4 text-center">
      <p class="text-2xl font-bold text-green-800">$100k</p>
      <p class="text-xs text-gray-500">Ready deals (2 contracts)</p>
    </div>
  </div>

  <h2 class="text-xl font-bold text-green-800 mb-3">The Problem</h2>
  <p class="text-gray-700 mb-6">
    Farmers in Central Asia lack access to affordable financing. Traditional banks offer high interest rates,
    opaque terms, slow approval, and require collateral that farmers don't have.
    Investors have no transparent, secure mechanism to fund agricultural operations in emerging markets.
  </p>

  <h2 class="text-xl font-bold text-green-800 mb-3">The Solution</h2>
  <p class="text-gray-700 mb-4">
    AgriPartners connects farmers and investors through NEAR smart contract escrow.
    Terms are immutable and transparent. Funds are protected on-chain.
    Both parties interact through a simple dashboard without needing crypto knowledge.
  </p>
  <ul class="space-y-1 mb-8 text-gray-700 text-sm">
    <li>🔐 Smart contract holds funds in escrow — inaccessible until cycle completion</li>
    <li>📊 Real-time dashboard shows balances, cycle status, transaction history</li>
    <li>💸 Investor earns +64% ROI over 35 months (21.9% APR) on Fidlot v5.9 model</li>
    <li>🌾 Farmer receives 60% profit share + feedlot infrastructure ($18k) as permanent asset</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">Traction</h2>
  <ul class="space-y-2 mb-8 text-gray-700">
    <li>✅ <strong>MVP deployed</strong> on NEAR testnet — full cycle demo completed</li>
    <li>✅ <strong>Real farmer</strong> ready to sign 2 Fidlot v5.9 contracts ($50k each)</li>
    <li>✅ <strong>PDF agreements</strong> prepared and reviewed with the farmer</li>
    <li>✅ <strong>Working dashboard</strong> — live status, balances, event history</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">Why NEAR</h2>
  <ul class="space-y-1 mb-8 text-gray-700 text-sm">
    <li>⚡ Low transaction fees — critical for small/medium agricultural deals</li>
    <li>🚀 Fast finality — cycle reports and payouts confirmed in seconds</li>
    <li>🛠 Developer-friendly Rust SDK — enabled rapid MVP development</li>
    <li>🌍 Growing ecosystem in emerging markets</li>
  </ul>

  <h2 class="text-xl font-bold text-green-800 mb-3">Tech Stack</h2>
  <p class="text-gray-700 text-sm mb-8">
    NEAR Protocol (Rust smart contract) · Node.js backend · SQLite · Vanilla JS dashboard ·
    Deployed: Railway (backend) + Vercel (frontend) + Turso (database)
  </p>

  <h2 class="text-xl font-bold text-green-800 mb-3">Roadmap</h2>
  <div class="space-y-2 mb-8 text-sm text-gray-700">
    <div class="flex gap-3"><span class="text-green-700 font-bold">Q2 2026</span><span>MVP on testnet ✅ · First farmer deal ·  NEAR grant application</span></div>
    <div class="flex gap-3"><span class="text-green-700 font-bold">Q3 2026</span><span>Mainnet launch · First real deals · Auth + notifications</span></div>
    <div class="flex gap-3"><span class="text-green-700 font-bold">Q4 2026</span><span>10 deals · Expand to Kazakhstan, Kyrgyzstan</span></div>
    <div class="flex gap-3"><span class="text-green-700 font-bold">2027</span><span>100 deals · Multi-crop models · Regional expansion</span></div>
  </div>

  <div class="text-center border-t pt-6">
    <p class="text-gray-700 font-semibold">AgriPartners</p>
    <p class="text-gray-500 text-sm mt-1">farhodmuhamadiev4@gmail.com · https://agripartners.vercel.app</p>
    <p class="text-sm mt-1"><a href="https://github.com/farabek/agripartners" class="text-green-700">github.com/farabek/agripartners</a></p>
  </div>

</body>
</html>
```

- [ ] **Step 9.2: Commit**

```bash
git add frontend/pages/platform-overview-en.html
git commit -m "feat: add platform overview page (EN) for NEAR Foundation and partners"
```

---

## Task 10: Питч-скрипты (RU / EN / UZ)

**Files:**
- Create: `docs/pitch-script-ru.md`
- Create: `docs/pitch-script-en.md`
- Create: `docs/pitch-script-uz.md`

- [ ] **Step 10.1: Создать docs/pitch-script-ru.md**

```markdown
# AgriPartners — Питч-скрипт (Русский)
**Длительность:** 5–7 минут · **Аудитория:** Инвестор / Партнёр

---

## Вступление (60 сек)
*До запуска demo. Смотреть на собеседника.*

> "Представьте фермера в Узбекистане. У него есть земля, опыт, желание работать.
> Но чтобы начать откорм 50 голов скота, нужны $50,000 стартового капитала.
> Банк предлагает высокие проценты с непрозрачными условиями и месяцами ожидания.
> А инвестор, который готов вложить деньги, не может проверить куда они идут.
>
> Мы решили эту проблему. Давайте я покажу как."

*Открыть demo. Убедиться что backend запущен.*

---

## Шаг 1 — Deploy (60 сек)
*Запустить команду деплоя. Пока идёт (10-30 сек) — говорить.*

> "Прямо сейчас мы создаём смарт-контракт на блокчейне NEAR.
> В него записаны все условия сделки: сколько вкладывает инвестор,
> какой процент получает фермер, сколько циклов, каков возврат капитала.
> После создания условия нельзя изменить. Ни нам, ни фермеру, ни инвестору."

*Когда появится `Contract: ap...testnet`:*

> "Контракт создан. Адрес на блокчейне — можете проверить в NEAR Explorer."

---

## Шаг 2 — Fund (60 сек)
*Нажать Enter для Fund.*

> "Теперь инвестор вносит $50,000. В нашем случае — 1 NEAR для demo.
> Деньги уходят в смарт-контракт и блокируются.
> Фермер их видит, но снять не может — только по результатам каждого цикла.
> Никаких банков, никаких посредников."

*Показать на dashboard статус 'Funded'.*

> "Дашборд показывает статус в реальном времени. Инвестор может зайти с телефона и проверить."

---

## Шаги 3–5 — Циклы 1, 2, 3 (90 сек)
*Запускать циклы один за другим.*

> "Каждый цикл — 5 месяцев работы фермера.
> Мы запускаем цикл — фермер закупает скот, откармливает, продаёт.
> В конце цикла фиксируем прибыль — она автоматически делится 60/40.
> Фермер получает $15,250 на свой счёт. Инвестор — $9,600 USDC."

*После каждого report-cycle показывать dashboard.*

> "Смотрите — статус обновился, балансы изменились. Всё прозрачно."

---

## Финал — Completed (60 сек)
*После третьего цикла — статус Completed.*

> "Сделка завершена. За 35 месяцев:
> — Инвестор получил $82,000 на вложенные $50,000 — это +64% ROI, 21.9% годовых.
> — Фермер заработал $96,250 деньгами. И откормочная база на $18,000 — его навсегда.
> — Платформа получила performance fee — только при положительном результате.
>
> Всё записано в блокчейн. Никто не мог изменить условия по дороге."

---

## Заключение + CTA (60 сек)
*Закрыть terminal, показать dashboard.*

> "Это работающий MVP на NEAR testnet.
> Есть реальный фермер, который готов подписать два договора Fidlot v5.9 —
> по $50,000 каждый, итого $100,000 первых сделок.
>
> Мы ищем инвестора / партнёра, который готов профинансировать эти сделки.
> Договор уже готов — Agri-Investor-Fidlot-v5.9-6040.pdf.
>
> Если интересно — давайте обсудим детали."

*Передать распечатанный Investor Brief.*
```

- [ ] **Step 10.2: Создать docs/pitch-script-en.md**

```markdown
# AgriPartners — Pitch Script (English)
**Duration:** 5–7 minutes · **Audience:** Investor / NEAR Foundation / Partner

---

## Introduction (60 sec)
*Before launching demo. Make eye contact.*

> "Imagine a farmer in Uzbekistan. He has land, skills, and determination.
> But to start fattening 50 cattle, he needs $50,000 in starting capital.
> Banks offer high interest rates with opaque terms and months of waiting.
> And an investor who's willing to fund him can't verify where the money goes.
>
> We solved this. Let me show you."

*Open demo. Confirm backend is running.*

---

## Step 1 — Deploy (60 sec)
*Run deploy command. Talk while it runs (10–30 sec).*

> "Right now, we're deploying a smart contract on the NEAR blockchain.
> It contains all deal terms: how much the investor puts in,
> the farmer's profit share, number of cycles, capital return schedule.
> Once deployed — terms are immutable. No one can change them."

*When `Contract: ap...testnet` appears:*

> "Contract is live. This address is verifiable on NEAR Explorer."

---

## Step 2 — Fund (60 sec)
*Press Enter to Fund.*

> "The investor deposits $50,000 — in our demo, 1 NEAR.
> Funds are locked in the smart contract escrow.
> The farmer can see the balance but cannot withdraw —
> only through cycle settlement. No banks, no intermediaries."

*Show dashboard status 'Funded'.*

> "The dashboard shows real-time status. The investor can check from their phone."

---

## Steps 3–5 — Cycles 1, 2, 3 (90 sec)
*Run cycles sequentially.*

> "Each cycle is 5 months of farming work.
> We start the cycle — the farmer buys cattle, fattens, sells.
> At cycle end, we report profit — it's automatically split 60/40.
> The farmer receives $15,250. The investor receives $9,600 USDC."

*Show dashboard after each report.*

> "Status updated, balances changed. Fully transparent."

---

## Completion (60 sec)
*After cycle 3 — status: Completed.*

> "Deal complete. Over 35 months:
> — Investor received $82,000 on $50,000 invested — +64% ROI, 21.9% APR.
> — Farmer earned $96,250 in cash. Plus $18,000 feedlot infrastructure — his forever.
> — Platform earned performance fee — only on positive results.
>
> Everything is on-chain. No one could change terms along the way."

---

## Close + CTA (60 sec)
*Show dashboard, close terminal.*

> "This is a working MVP on NEAR testnet.
> We have a real farmer ready to sign two Fidlot v5.9 agreements —
> $50,000 each, $100,000 in first deals.
>
> We're looking for investors or partners to fund these deals.
> The agreement is ready — Agri-Investor-Fidlot-v5.9-6040.pdf.
>
> Interested? Let's talk."

*Hand over printed Investor Brief (EN).*
```

- [ ] **Step 10.3: Создать docs/pitch-script-uz.md**

```markdown
# AgriPartners — Taqdimot skripti (O'zbek tili)
**Davomiyligi:** 5–7 daqiqa · **Auditoriya:** Investor / Fermer / Hamkor

---

## Kirish (60 son)
*Demo ishga tushirishdan oldin. Ko'z temasida bo'ling.*

> "Tasavvur qiling: O'zbekistondagi fermer.
> Uning yeri bor, tajribasi bor, ishlashga tayyorligi bor.
> Lekin 50 bosh mol-qo'y boqishni boshlash uchun $50,000 kerak.
> Banklar yuqori foiz taklif qiladi — noaniq shartlar, oylab kutish.
> Pul bermoqchi bo'lgan investor esa pulning qayerga ketishini ko'ra olmaydi.
>
> Biz bu muammoni hal qildik. Ko'rsatay."

*Demoni oching. Backend ishga tushirilganligini tekshiring.*

---

## Qadam 1 — Shartnoma yaratish (60 son)
*Deploy buyrug'ini ishga tushiring. Kutish vaqtida gapiring.*

> "Hozir biz NEAR blokcheynga aqlli shartnoma joylashtiryapmiz.
> Unda barcha shartlar yozilgan: investor qancha kiritadi,
> fermer qancha foiz oladi, necha tsikl, kapital qaytarish jadvali.
> Joylashtirilgandan keyin — shartlarni hech kim o'zgartira olmaydi."

*`Contract: ap...testnet` paydo bo'lganda:*

> "Shartnoma tayyor. Manzilni NEAR Explorer'da tekshirish mumkin."

---

## Qadam 2 — Moliyalashtirish (60 son)
*Enter bosib Fund qiling.*

> "Investor $50,000 kiritadi — demonstratsiyada 1 NEAR.
> Pul aqlli shartnomaga qulflandi.
> Fermer balansni ko'radi, lekin yecha olmaydi —
> faqat tsikl tugagandan keyin. Bank yo'q, vositachi yo'q."

*Dashboard'da 'Funded' statusini ko'rsating.*

> "Dashboard real vaqtda statusni ko'rsatadi. Investor telefonidan tekshira oladi."

---

## Qadam 3–5 — Tsikllar 1, 2, 3 (90 son)
*Tsikllarni ketma-ket ishga tushiring.*

> "Har bir tsikl — 5 oylik fermerlik ishi.
> Tsiklni boshlaymiz — fermer mol-qo'y sotib oladi, boqadi, sotadi.
> Tsikl oxirida foydani qayd etamiz — avtomatik 60/40 bo'linadi.
> Fermer $15,250 oladi. Investor $9,600 USDC oladi."

*Har bir report dan keyin dashboard'ni ko'rsating.*

> "Status yangilandi, balanslar o'zgardi. To'liq shaffoflik."

---

## Yakunlash (60 son)
*3-tsikldan keyin — Completed statusi.*

> "Bitim yakunlandi. 35 oy davomida:
> — Investor $50,000 ga $82,000 oldi — bu +64% ROI, yiliga 21.9%.
> — Fermer $96,250 naqd pul ishlab topdi.
>   Hamda $18,000 qiymatidagi boqish bazasi — uniki abadiy.
> — Platforma faqat ijobiy natijada komissiya oldi.
>
> Hamma narsa blokcheynga yozilgan. Hech kim shartlarni o'zgartira olmadi."

---

## Xulosa + Taklif (60 son)
*Dashboard'ni ko'rsating, terminalni yoping.*

> "Bu NEAR testnet'da ishlaydigan MVP.
> Bizda haqiqiy fermer bor — u ikkita Fidlot v5.9 shartnomasini
> imzolashga tayyor: har biri $50,000, jami $100,000.
>
> Biz bu bitimlarni moliyalashtirish uchun investor yoki hamkor izlayapmiz.
> Shartnoma tayyor — Agri-Investor-Fidlot-v5.9-6040.pdf.
>
> Qiziqsangiz — gaplashamiz."

*Chop etilgan Investor Brief (UZ) ni bering.*
```

- [ ] **Step 10.4: Commit**

```bash
git add docs/pitch-script-ru.md docs/pitch-script-en.md docs/pitch-script-uz.md
git commit -m "feat: add pitch scripts in RU, EN, UZ (5-7 min investor demo)"
```

---

## Task 11: NEAR Grant Proposal

**Files:**
- Create: `docs/near-grant-proposal.md`

- [ ] **Step 11.1: Создать docs/near-grant-proposal.md**

```markdown
# AgriPartners — NEAR Foundation Grant Proposal

> **Platform:** https://devhub.near.org · **Category:** RWA / DeFi / Agriculture
> **Amount requested:** $30,000 USDC · **Timeline:** 12 weeks (3 milestones × 4 weeks)

---

## TL;DR

AgriPartners is a Real-World Asset platform on NEAR that connects farmers in Central Asia
with investors through transparent, on-chain escrow smart contracts —
eliminating banks, reducing friction, and enabling verified agricultural financing at scale.

---

## Problem

**60% of farmers in Uzbekistan lack access to affordable financing.**

The $10B+ Uzbek agricultural market is severely underfinanced. Traditional options:
- Banks charge high interest rates with opaque terms and months of bureaucracy
- Investors have no transparent mechanism to fund agricultural operations remotely
- No existing infrastructure for verifiable, trustless farmer-investor partnerships

This creates a massive gap: willing investors, willing farmers, no trusted bridge.

---

## Solution

AgriPartners bridges farmers and investors through NEAR smart contracts:

1. **Investor deposits USDC** — locked in escrow smart contract
2. **Farmer operates** — buys cattle, fattens, sells each 5-month cycle
3. **Profit auto-distributes** — 60% farmer / 40% investor, on-chain and transparent
4. **Capital returned** at deal completion — all terms immutable from day one

The platform charges 20% performance fee from the investor's share only — payable on results.

**Fidlot v5.9 model (cattle fattening):**
- $50,000 investment → $82,000 return (+64% ROI, 21.9% APR over 35 months)
- Farmer earns $114,250 total including $18,000 feedlot infrastructure (permanent asset)

---

## What's Already Built

✅ **Rust smart contract on NEAR testnet** — full state machine (Initialized → Funded → CycleActive → CycleSettlement → Completed), 21 unit tests passing

✅ **Node.js backend API** — 4 admin endpoints (deploy, fund, start-cycle, report-cycle), 5 public endpoints, SQLite storage, 29/29 tests passing

✅ **Dashboard frontend** — real-time status, balance chart (Chart.js), event history, mobile-friendly

✅ **Full demo completed on NEAR testnet** — 3 cycles, Completed status achieved

✅ **Real farmer in Uzbekistan** ready to sign 2 Fidlot v5.9 agreements ($50,000 each)

✅ **Legal agreements prepared** — Agri-Farmer-Fidlot-v5.9 and Agri-Investor-Fidlot-v5.9 PDF contracts

**Live demo:** https://agripartners.vercel.app
**GitHub:** https://github.com/farabek/agripartners

---

## Why NEAR

- **Low fees** — critical for small/medium agricultural deals in emerging markets
- **Fast finality** — cycle reports and payouts confirmed in seconds
- **Rust SDK** — enabled solo developer to build production-quality contract rapidly
- **Ecosystem alignment** — NEAR's focus on real-world utility matches our use case

---

## Team

**Farhod Muhamadiev** — Solo founder, full-stack developer
- Built entire MVP (Rust contract + Node.js backend + frontend) in 2 weeks
- Established relationship with first farmer partner in Uzbekistan
- Deep understanding of local agricultural financing challenges

*Traction compensates for team size: working product + real deal pipeline.*

---

## Milestones

### Milestone 1 — $10,000 | Weeks 1–4
**Production Infrastructure + Authentication**
- [ ] Deploy to NEAR mainnet (contract audit + deployment)
- [ ] JWT authentication with roles: farmer / investor / admin
- [ ] Replace SQLite with PostgreSQL for production scale
- [ ] Railway + Vercel production deployment

**Deliverable:** Live mainnet contract + authenticated API endpoints
**Verification:** GitHub repo + mainnet contract address + API documentation

### Milestone 2 — $10,000 | Weeks 5–8
**Notifications + Investor Dashboard**
- [ ] Telegram bot notifications (cycle started, profit reported, payment received)
- [ ] Investor-facing dashboard (portfolio view, projected returns)
- [ ] Email notifications via SendGrid
- [ ] Admin panel for deal management

**Deliverable:** Notification system + investor portal
**Verification:** Demo video showing notification flow + GitHub

### Milestone 3 — $10,000 | Weeks 9–12
**First Real Deal + Community Report**
- [ ] Execute first $50,000 Fidlot v5.9 deal on mainnet with real farmer
- [ ] Document full deal lifecycle (deploy → fund → cycles → completion)
- [ ] Written report: technical architecture, lessons learned, market insights
- [ ] Open source SDK for other NEAR developers building RWA apps

**Deliverable:** First real mainnet deal + public report + RWA SDK
**Verification:** Mainnet transaction hashes + published report + GitHub SDK

---

## Budget Breakdown

| Category | M1 | M2 | M3 | Total |
| --- | --- | --- | --- | --- |
| Development (contract audit, features) | $6,000 | $6,000 | $4,000 | $16,000 |
| Infrastructure (servers, DB, services) | $1,000 | $1,000 | $1,000 | $3,000 |
| First deal facilitation (legal, onboarding) | $2,000 | $1,000 | $3,000 | $6,000 |
| Marketing / community (NEAR ecosystem) | $1,000 | $2,000 | $2,000 | $5,000 |
| **Total** | **$10,000** | **$10,000** | **$10,000** | **$30,000** |

---

## Risks & Mitigation

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Mainnet contract vulnerability | Medium | Professional audit before M1 deploy |
| Farmer deal falls through | Low | Second farmer already in conversation |
| Regulatory issues (UZ) | Low | Operating as a platform, not a financial institution |
| Slow adoption | Medium | Starting with 2 pre-agreed deals, proven model |

---

## Long-term Vision

**2026:** 10 deals · Uzbekistan market · $500k TVL
**2027:** 100 deals · Kazakhstan + Kyrgyzstan · $5M TVL
**2028:** Multi-crop models (grain, vegetables) · $50M TVL · Central Asia leader

AgriPartners aims to become the infrastructure layer for agricultural financing in Central Asia —
the same way NEAR aims to be infrastructure for the open web.

---

*Contact: farhodmuhamadiev4@gmail.com | GitHub: farabek/agripartners*
```

- [ ] **Step 11.2: Commit**

```bash
git add docs/near-grant-proposal.md
git commit -m "docs: add NEAR DevHub grant proposal ($30k, 3 milestones)"
```

---

## Task 12: NEAR Horizon Profile

**Files:**
- Create: `docs/near-horizon-profile.md`

- [ ] **Step 12.1: Создать docs/near-horizon-profile.md**

```markdown
# AgriPartners — NEAR Horizon Profile

> Copy-paste ready for https://app.near.org/horizon

---

## Basic Information

**Project name:** AgriPartners

**Tagline:** Blockchain-secured agricultural investments in Central Asia

**Website:** https://agripartners.vercel.app

**GitHub:** https://github.com/farabek/agripartners

**Demo:** https://agripartners.vercel.app

**Contact:** farhodmuhamadiev4@gmail.com

---

## Categories

- Real World Assets (RWA)
- DeFi
- Agriculture / Impact

---

## Stage

MVP (live on testnet, first mainnet deals in preparation)

---

## Description (200 words)

AgriPartners is a Real-World Asset platform on NEAR Protocol that connects agricultural
farmers in Central Asia with investors through transparent, on-chain escrow smart contracts.

**The Problem:** 60% of farmers in Uzbekistan lack access to affordable financing.
Banks charge high interest rates with opaque terms and months of bureaucracy.
Investors have no trusted, verifiable mechanism to fund agricultural operations remotely.

**The Solution:** AgriPartners deploys a NEAR smart contract for each deal.
The investor's capital is locked in escrow — inaccessible until cycle completion.
Profit is automatically distributed 60/40 (farmer/investor) after each 5-month cycle.
All terms are immutable and publicly verifiable on-chain.

**Fidlot v5.9 model:** $50,000 investment → $82,000 return (+64% ROI, 21.9% APR, 35 months).
The farmer earns $114,250 including a $18,000 feedlot infrastructure asset that remains
with them permanently.

**Current status:** MVP deployed on NEAR testnet, full demo cycle completed, real farmer
in Uzbekistan ready to sign two $50,000 agreements, PDF contracts prepared.

**Vision:** Become the infrastructure layer for agricultural financing in Central Asia —
starting in Uzbekistan, expanding to Kazakhstan, Kyrgyzstan, and beyond.

---

## Team

**Farhod Muhamadiev** — Founder & Developer
- Built full MVP (Rust smart contract + Node.js API + frontend dashboard) in 2 weeks
- Established first farmer partnership in Uzbekistan
- farhodmuhamadiev4@gmail.com

---

## What We're Looking For on Horizon

- **Funding:** NEAR Foundation grant to reach mainnet and execute first real deal
- **Technical support:** Smart contract audit, NEAR ecosystem guidance
- **Partnerships:** Investors interested in RWA agricultural deals in Central Asia
- **Visibility:** Introduction to NEAR ecosystem projects in emerging markets / impact space
```

- [ ] **Step 12.2: Commit**

```bash
git add docs/near-horizon-profile.md
git commit -m "docs: add NEAR Horizon startup profile"
```

- [ ] **Step 12.3: Push всё на GitHub**

```bash
git push origin main
```

---

## Self-Review

**Spec coverage check:**
- ✅ Блок 1 (Railway + Turso + Vercel): Tasks 1–6
- ✅ Блок 2A (Investor Brief RU+EN): Task 7
- ✅ Блок 2B (Farmer Brief UZ+RU): Task 8
- ✅ Блок 2C (Platform Overview EN): Task 9
- ✅ Блок 3 (Pitch scripts RU+EN+UZ): Task 10
- ✅ Блок 4A (NEAR Grant Proposal): Task 11
- ✅ Блок 4B (NEAR Horizon Profile): Task 12
- ✅ PDF договоры referenced во всех материалах
- ✅ Реальные цифры Fidlot v5.9 во всех документах

**Placeholder scan:** нет TBD, нет TODO, все цифры реальные из спека.

**Type consistency:** нет перекрёстных зависимостей между задачами — каждая самодостаточна.
