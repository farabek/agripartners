# Frontend Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Статичный HTML/JS/CSS дашборд для AgriPartners — список сделок и детальная страница каждой сделки с балансами из блокчейна.

**Architecture:** Hash-based SPA (без build-шага). Два вида: `#deals` (карточки сделок) и `#deals/:id` (детали + Chart.js donut + история событий). Frontend обращается к backend API на `localhost:3000`.

**Tech Stack:** HTML5, Tailwind CSS v3 (CDN), Chart.js v4 (CDN), vanilla JS (BigInt для yoctoNEAR), Express cors middleware.

---

## Файловая структура

```
E:\agripartners\
  backend\src\app.js          — добавить cors middleware
  frontend\
    index.html                — HTML skeleton, CDN imports
    style.css                 — dark theme, status badge colors, spinner
    app.js                    — utilities, router, все view-функции
```

---

## Task 1: Добавить CORS в backend

**Files:**
- Modify: `E:\agripartners\backend\src\app.js`
- Modify: `E:\agripartners\backend\package.json` (через npm install)

Без CORS браузер блокирует fetch-запросы с `file://` или другого порта к `localhost:3000`.

- [ ] **Шаг 1: Установить cors**

```powershell
Set-Location E:\agripartners\backend
npm install cors
```

Ожидаемый вывод: `added 1 package` (или аналог).

- [ ] **Шаг 2: Подключить cors в app.js**

Открыть `E:\agripartners\backend\src\app.js` и добавить cors после строки `const express = require('express');`:

```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { requireApiKey } = require('./middleware/auth');
const dealsRouter = require('./routes/deals');
const adminRouter = require('./routes/admin');

['API_KEY', 'NEAR_ADMIN_ACCOUNT', 'NEAR_ADMIN_PRIVATE_KEY'].forEach(k => {
  if (!process.env[k]) throw new Error(`Missing required env var: ${k}`);
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/deals', dealsRouter);
app.use('/api/admin', requireApiKey, adminRouter);

module.exports = app;
```

- [ ] **Шаг 3: Проверить что backend запускается**

```powershell
Set-Location E:\agripartners\backend
npm start
```

Ожидаемый вывод: `AgriPartners backend listening on port 3000` (или аналог). Нажать Ctrl+C.

- [ ] **Шаг 4: Проверить что тесты проходят**

```powershell
Set-Location E:\agripartners\backend
npm test
```

Ожидаемый вывод: `29 passed` (все тесты зелёные).

- [ ] **Шаг 5: Закоммитить**

```powershell
Set-Location E:\agripartners
git add backend/src/app.js backend/package.json backend/package-lock.json
git commit -m "feat: add CORS middleware to backend"
```

---

## Task 2: HTML skeleton + dark theme CSS

**Files:**
- Create: `E:\agripartners\frontend\index.html`
- Create: `E:\agripartners\frontend\style.css`

- [ ] **Шаг 1: Создать `index.html`**

```html
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AgriPartners</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <link rel="stylesheet" href="style.css">
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen font-sans">
  <div id="view-list" class="hidden max-w-4xl mx-auto px-4 py-8"></div>
  <div id="view-detail" class="hidden max-w-4xl mx-auto px-4 py-8"></div>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Шаг 2: Создать `style.css`**

```css
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.badge-Initialized     { background-color: #374151; color: #9ca3af; }
.badge-Funded          { background-color: #78350f; color: #fde68a; }
.badge-CycleActive     { background-color: #1e3a5f; color: #93c5fd; }
.badge-CycleSettlement { background-color: #7c2d12; color: #fdba74; }
.badge-Completed       { background-color: #14532d; color: #86efac; }
.badge-Terminated      { background-color: #7f1d1d; color: #fca5a5; }

.spinner {
  border: 3px solid #334155;
  border-top-color: #22d3ee;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 0.8s linear infinite;
  margin: 2rem auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
```

- [ ] **Шаг 3: Визуально проверить**

Установить `serve` если нет:
```powershell
npm install -g serve
```

Запустить:
```powershell
serve E:\agripartners\frontend -p 5500
```

Открыть `http://localhost:5500` в браузере.
Ожидаемый результат: тёмная страница (bg-slate-900), оба `div` скрыты (содержимого не видно). Ошибок в DevTools Console нет.

- [ ] **Шаг 4: Закоммитить**

```powershell
Set-Location E:\agripartners
git add frontend/index.html frontend/style.css
git commit -m "feat: add frontend HTML skeleton and dark theme CSS"
```

---

## Task 3: app.js — утилиты + роутер

**Files:**
- Create: `E:\agripartners\frontend\app.js`

- [ ] **Шаг 1: Создать `app.js` с утилитами и роутером**

```js
const API_BASE = 'http://localhost:3000';

// --- Утилиты ---

function yoctoToNear(yocto) {
  if (!yocto || yocto === '0') return '0.00 NEAR';
  const n = BigInt(yocto);
  const one = BigInt('1000000000000000000000000');
  const whole = n / one;
  const frac = (n % one) * 100n / one;
  return `${whole}.${frac.toString().padStart(2, '0')} NEAR`;
}

function yoctoToNearFloat(yocto) {
  if (!yocto || yocto === '0') return 0;
  const n = BigInt(yocto);
  const one = BigInt('1000000000000000000000000');
  const whole = Number(n / one);
  const frac = Number((n % one) * 10000n / one) / 10000;
  return whole + frac;
}

function formatAddress(addr) {
  if (!addr) return '—';
  if (addr.length <= 20) return addr;
  return addr.slice(0, 6) + '…' + addr.slice(-4);
}

function statusBadge(status) {
  if (!status) return '<span class="badge badge-Initialized">—</span>';
  return `<span class="badge badge-${status}">${status}</span>`;
}

// --- Роутер ---

function showView(viewId) {
  document.getElementById('view-list').classList.add('hidden');
  document.getElementById('view-detail').classList.add('hidden');
  document.getElementById(viewId).classList.remove('hidden');
}

function route() {
  const hash = location.hash;
  const m = hash.match(/^#deals\/(\d+)$/);
  if (m) {
    showDeal(m[1]);
  } else {
    showDeals();
  }
}

window.addEventListener('hashchange', route);
window.addEventListener('load', () => {
  if (!location.hash || location.hash === '#') location.hash = '#deals';
  else route();
});

// --- Placeholder для следующих задач ---
function showDeals() { showView('view-list'); document.getElementById('view-list').innerHTML = '<p class="text-slate-400">Loading...</p>'; }
function showDeal(id) { showView('view-detail'); document.getElementById('view-detail').innerHTML = `<p class="text-slate-400">Deal ${id}</p>`; }
```

- [ ] **Шаг 2: Проверить роутер в браузере**

Открыть `http://localhost:5500` (serve должен работать из Task 2).
- Перейти на `http://localhost:5500/#deals` → видно "Loading..."
- Перейти на `http://localhost:5500/#deals/1` → видно "Deal 1"
- Перейти на `http://localhost:5500/` → должен редиректнуть на `#deals`

- [ ] **Шаг 3: Проверить утилиты в DevTools Console**

```js
yoctoToNear('1000000000000000000000000')   // → "1.00 NEAR"
yoctoToNear('2500000000000000000000000')   // → "2.50 NEAR"
yoctoToNear('0')                           // → "0.00 NEAR"
formatAddress('alice.testnet')             // → "alice.testnet"
formatAddress('abcdef1234567890abcdef1234567890abcdef12') // → "abcdef…ef12"
statusBadge('CycleActive')                 // → строка с классом badge-CycleActive
```

- [ ] **Шаг 4: Закоммитить**

```powershell
Set-Location E:\agripartners
git add frontend/app.js
git commit -m "feat: add frontend utilities and hash router"
```

---

## Task 4: Список сделок (showDeals + renderDealCard)

**Files:**
- Modify: `E:\agripartners\frontend\app.js` — заменить placeholder `showDeals` на полную реализацию

- [ ] **Шаг 1: Заменить функцию `showDeals` в app.js**

Найти строку:
```js
function showDeals() { showView('view-list'); document.getElementById('view-list').innerHTML = '<p class="text-slate-400">Loading...</p>'; }
```

Заменить на:

```js
async function showDeals() {
  showView('view-list');
  const el = document.getElementById('view-list');
  el.innerHTML = `
    <h1 class="text-3xl font-bold text-green-400 mb-1">AgriPartners</h1>
    <p class="text-slate-400 mb-6">Агро-инвестиции на NEAR Protocol</p>
    <div class="spinner"></div>
  `;
  try {
    const res = await fetch(`${API_BASE}/api/deals`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const deals = await res.json();
    el.querySelector('.spinner').remove();
    if (deals.length === 0) {
      el.innerHTML += '<p class="text-slate-400 mt-4">Нет сделок</p>';
      return;
    }
    const grid = document.createElement('div');
    grid.className = 'grid gap-4';
    deals.forEach(d => { grid.innerHTML += renderDealCard(d); });
    el.appendChild(grid);
  } catch (e) {
    el.querySelector('.spinner')?.remove();
    el.innerHTML += `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Backend недоступен: ${e.message}</div>`;
  }
}

function renderDealCard(d) {
  return `
    <div class="bg-slate-800 rounded-xl p-5 flex justify-between items-center gap-4">
      <div class="space-y-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-xs font-semibold bg-slate-700 px-2 py-0.5 rounded text-slate-300">${d.deal_type}</span>
        </div>
        <p class="text-sm text-slate-400">Фермер: <span class="text-slate-200">${formatAddress(d.farmer)}</span></p>
        <p class="text-sm text-slate-400">Инвестор: <span class="text-slate-200">${formatAddress(d.investor)}</span></p>
        <p class="text-sm text-slate-500">${d.total_cycles} цикл(а) × ${d.cycle_duration_days} дн  ·  ${yoctoToNear(d.investment_amount)}</p>
      </div>
      <a href="#deals/${d.id}" class="shrink-0 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Открыть →</a>
    </div>
  `;
}
```

- [ ] **Шаг 2: Запустить backend**

```powershell
Set-Location E:\agripartners\backend
npm start
```

- [ ] **Шаг 3: Проверить список сделок в браузере**

Открыть `http://localhost:5500/#deals`.

Ожидаемые результаты:
- Заголовок "AgriPartners" зелёного цвета
- Спиннер появляется на секунду, затем исчезает
- Карточки сделок отображаются (если БД содержит сделки)
- Кнопка "Открыть →" зелёная, при клике переходит на `#deals/:id`

Проверить пустое состояние: временно изменить `${API_BASE}/api/deals` на несуществующий URL, убедиться что показывается красная плашка "Backend недоступен", вернуть URL обратно.

- [ ] **Шаг 4: Закоммитить**

```powershell
Set-Location E:\agripartners
git add frontend/app.js
git commit -m "feat: add deals list view with cards"
```

---

## Task 5: Детали сделки — параметры + статус

**Files:**
- Modify: `E:\agripartners\frontend\app.js` — заменить placeholder `showDeal`, добавить `renderDealDetail`, `renderParams`

- [ ] **Шаг 1: Заменить функцию `showDeal` в app.js**

Найти строку:
```js
function showDeal(id) { showView('view-detail'); document.getElementById('view-detail').innerHTML = `<p class="text-slate-400">Deal ${id}</p>`; }
```

Заменить на:

```js
async function showDeal(id) {
  showView('view-detail');
  const el = document.getElementById('view-detail');
  el.innerHTML = `
    <a href="#deals" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">← Назад</a>
    <div class="spinner"></div>
  `;

  const [dealRes, statusRes, balancesRes, eventsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}`),
    fetch(`${API_BASE}/api/deals/${id}/status`),
    fetch(`${API_BASE}/api/deals/${id}/balances`),
    fetch(`${API_BASE}/api/deals/${id}/events`)
  ]);

  el.querySelector('.spinner')?.remove();

  if (dealRes.status === 'rejected' || !dealRes.value.ok) {
    const code = dealRes.value?.status;
    el.innerHTML += code === 404
      ? '<p class="text-slate-400 mt-8 text-center">Сделка не найдена</p>'
      : `<div class="bg-red-900 text-red-200 px-4 py-3 rounded mt-4">Backend недоступен</div>`;
    return;
  }

  const deal = await dealRes.value.json();
  const status = statusRes.status === 'fulfilled' && statusRes.value.ok
    ? await statusRes.value.json() : null;
  const balances = balancesRes.status === 'fulfilled' && balancesRes.value.ok
    ? await balancesRes.value.json() : null;
  const events = eventsRes.status === 'fulfilled' && eventsRes.value.ok
    ? await eventsRes.value.json() : [];

  renderDealDetail(el, deal, status, balances, events);
}

function renderDealDetail(el, deal, status, balances, events) {
  const cycleText = status ? `· Цикл ${status.current_cycle}` : '';
  el.innerHTML = `
    <div class="flex flex-wrap items-center gap-3 mb-6">
      <a href="#deals" class="text-slate-400 hover:text-white text-sm">← Назад</a>
      <span class="text-slate-600">|</span>
      <span class="font-semibold">${deal.deal_type}</span>
      <span id="status-badge">${statusBadge(status?.status)}</span>
      <span id="cycle-text" class="text-slate-400 text-sm">${cycleText}</span>
      <button id="btn-refresh" class="ml-auto bg-slate-700 hover:bg-slate-600 text-sm px-3 py-1.5 rounded transition">Обновить</button>
    </div>
    <div class="grid md:grid-cols-2 gap-6 mb-6">
      <div class="bg-slate-800 rounded-xl p-5 space-y-2">
        ${renderParams(deal)}
      </div>
      <div class="bg-slate-800 rounded-xl p-5 flex flex-col items-center justify-center" id="chart-col">
        ${balances
          ? '<canvas id="balances-chart" width="240" height="240"></canvas>'
          : '<p class="text-slate-500 text-sm">Балансы недоступны</p>'}
      </div>
    </div>
    <div class="bg-slate-800 rounded-xl p-5">
      <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">История событий</h3>
      ${renderEvents(events)}
    </div>
  `;

  if (balances) renderBalancesChart(balances);

  document.getElementById('btn-refresh').addEventListener('click', () => refreshDeal(deal.id));
}

function renderParams(deal) {
  const rows = [
    ['Фермер',           formatAddress(deal.farmer)],
    ['Инвестор',         formatAddress(deal.investor)],
    ['Администратор',    formatAddress(deal.admin)],
    ['Платформа',        formatAddress(deal.platform)],
    ['Сплит',            `${deal.farmer_split_pct}% / ${deal.investor_split_pct}%`],
    ['Эскроу',           `${deal.escrow_pct}%`],
    ['Performance Fee',  `${deal.performance_fee_pct}%`],
    ['Длительность цикла', `${deal.cycle_duration_days} дн`],
    ['Всего циклов',     deal.total_cycles],
    ['Инвестиция',       yoctoToNear(deal.investment_amount)],
    ['Возврат капитала', yoctoToNear(deal.capital_return_near)],
  ];
  return rows.map(([k, v]) => `
    <div class="flex justify-between text-sm gap-2">
      <span class="text-slate-400 shrink-0">${k}</span>
      <span class="text-slate-100 font-mono text-right">${v}</span>
    </div>
  `).join('');
}

// Placeholder для следующей задачи
function renderBalancesChart(balances) {}
function renderEvents(events) { return '<p class="text-slate-500 text-sm">Загрузка...</p>'; }
async function refreshDeal(id) {}
```

- [ ] **Шаг 2: Проверить страницу деталей в браузере**

Открыть `http://localhost:5500/#deals`, нажать "Открыть →" на любой карточке.

Ожидаемые результаты:
- Хлебная крошка "← Назад" работает (возвращает на список)
- Заголовок: тип сделки + badge статуса + номер цикла
- Левая колонка: все параметры сделки в таблице
- Правая колонка: "Балансы недоступны" (chart-функция ещё пустая)
- Секция событий: "Загрузка..."

Проверить `#deals/99999` → должно показать "Сделка не найдена".

- [ ] **Шаг 3: Закоммитить**

```powershell
Set-Location E:\agripartners
git add frontend/app.js
git commit -m "feat: add deal detail view with params and status"
```

---

## Task 6: Balances chart + события + refresh

**Files:**
- Modify: `E:\agripartners\frontend\app.js` — заменить три placeholder-функции

- [ ] **Шаг 1: Заменить `renderBalancesChart` в app.js**

Найти:
```js
function renderBalancesChart(balances) {}
```

Заменить на:

```js
let balancesChartInstance = null;

function renderBalancesChart(balances) {
  if (balancesChartInstance) {
    balancesChartInstance.destroy();
    balancesChartInstance = null;
  }
  const ctx = document.getElementById('balances-chart');
  if (!ctx) return;
  const data = [
    yoctoToNearFloat(balances.farmer),
    yoctoToNearFloat(balances.investor),
    yoctoToNearFloat(balances.platform),
    yoctoToNearFloat(balances.escrow),
  ];
  balancesChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Фермер', 'Инвестор', 'Платформа', 'Эскроу'],
      datasets: [{
        data,
        backgroundColor: ['#2563eb', '#16a34a', '#ca8a04', '#dc2626'],
        borderWidth: 0
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#94a3b8', font: { size: 12 }, padding: 12 }
        }
      },
      cutout: '65%'
    }
  });
}
```

- [ ] **Шаг 2: Заменить `renderEvents` в app.js**

Найти:
```js
function renderEvents(events) { return '<p class="text-slate-500 text-sm">Загрузка...</p>'; }
```

Заменить на:

```js
function renderEvents(events) {
  if (!events.length) return '<p class="text-slate-500 text-sm">Событий нет</p>';
  return events.map(e => {
    const profitHtml = e.profit_near
      ? `<span class="text-green-400 ml-2">+${yoctoToNear(e.profit_near)}</span>` : '';
    const lossHtml = e.losses_near && e.losses_near !== '0'
      ? `<span class="text-red-400 ml-2">−${yoctoToNear(e.losses_near)}</span>` : '';
    const txHtml = e.tx_hash
      ? `<a href="https://testnet.nearblocks.io/txns/${e.tx_hash}" target="_blank" class="text-blue-400 hover:underline font-mono">${formatAddress(e.tx_hash)}</a>`
      : '';
    const date = new Date(e.created_at).toLocaleDateString('ru-RU');
    return `
      <div class="flex justify-between items-start text-sm py-2.5 border-b border-slate-700 last:border-0 gap-2">
        <div>
          <span class="text-slate-200 font-medium">${e.event_type}</span>
          ${e.cycle_num != null ? `<span class="text-slate-400 ml-2">цикл ${e.cycle_num}</span>` : ''}
          ${profitHtml}${lossHtml}
        </div>
        <div class="text-right text-slate-500 shrink-0">
          ${txHtml}
          <div class="text-xs mt-0.5">${date}</div>
        </div>
      </div>
    `;
  }).join('');
}
```

- [ ] **Шаг 3: Заменить `refreshDeal` в app.js**

Найти:
```js
async function refreshDeal(id) {}
```

Заменить на:

```js
async function refreshDeal(id) {
  const btn = document.getElementById('btn-refresh');
  if (btn) { btn.disabled = true; btn.textContent = 'Обновление...'; }

  const [statusRes, balancesRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}/status`),
    fetch(`${API_BASE}/api/deals/${id}/balances`)
  ]);

  const status = statusRes.status === 'fulfilled' && statusRes.value.ok
    ? await statusRes.value.json() : null;
  const balances = balancesRes.status === 'fulfilled' && balancesRes.value.ok
    ? await balancesRes.value.json() : null;

  if (status) {
    const badgeEl = document.getElementById('status-badge');
    const cycleEl = document.getElementById('cycle-text');
    if (badgeEl) badgeEl.innerHTML = statusBadge(status.status);
    if (cycleEl) cycleEl.textContent = `· Цикл ${status.current_cycle}`;
  }
  if (balances) renderBalancesChart(balances);

  if (btn) { btn.disabled = false; btn.textContent = 'Обновить'; }
}
```

- [ ] **Шаг 4: Проверить chart + события + refresh в браузере**

Открыть `http://localhost:5500/#deals`, зайти в любую сделку.

Ожидаемые результаты:
- Правая колонка: donut-диаграмма с 4 сегментами (синий/зелёный/жёлтый/красный)
- Легенда под диаграммой: Фермер / Инвестор / Платформа / Эскроу
- Если все балансы = 0 (сделка только создана), диаграмма может быть пустой — это нормально
- История событий: список с типами, циклами, суммами
- Нажать "Обновить" → кнопка становится "Обновление..." на секунду, затем диаграмма обновляется

- [ ] **Шаг 5: Закоммитить**

```powershell
Set-Location E:\agripartners
git add frontend/app.js
git commit -m "feat: add balances chart, events timeline and refresh button"
```

---

## Task 7: Финальная проверка + polish

**Files:**
- Modify (если нужно): `E:\agripartners\frontend\style.css`, `E:\agripartners\frontend\app.js`

- [ ] **Шаг 1: Проверить все сценарии ошибок**

| Сценарий | Как проверить | Ожидаемый результат |
| --- | --- | --- |
| Backend недоступен | Остановить backend, открыть `#deals` | Красная плашка "Backend недоступен" |
| Сделка не найдена | Открыть `#deals/99999` | "Сделка не найдена" |
| Нет сделок | Проверить пустую БД или временно подменить URL | "Нет сделок" |
| Blockchain недоступен | Нельзя симулировать легко — пропустить |

- [ ] **Шаг 2: Проверить навигацию**

- Открыть `http://localhost:5500/` → редирект на `#deals`
- Зайти в сделку → нажать "← Назад" → вернуться на список
- В списке нажать "Открыть →" → перейти в детали
- Нажать кнопку Back браузера → вернуться на список

- [ ] **Шаг 3: Проверить корректность отображения NEAR**

В DevTools Console на странице:
```js
yoctoToNear('1000000000000000000000000')  // "1.00 NEAR"
yoctoToNear('500000000000000000000000')   // "0.50 NEAR"  
yoctoToNear('0')                          // "0.00 NEAR"
```

- [ ] **Шаг 4: Финальный коммит**

```powershell
Set-Location E:\agripartners
git add frontend/
git status
git commit -m "feat: complete AgriPartners frontend dashboard"
```

- [ ] **Шаг 5: Обновить memory**

Сохранить в памяти что frontend завершён.

---

## Как запустить для демо

```powershell
# Терминал 1 — backend
Set-Location E:\agripartners\backend
npm start

# Терминал 2 — frontend
serve E:\agripartners\frontend -p 5500
```

Открыть: `http://localhost:5500`
