# Personal Cabinet (Личный кабинет) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить вход по логину/паролю и личный кабинет для farmer/investor — каждый видит только свои сделки.

**Architecture:** Backend получает новый эндпоинт `GET /api/me/deals` (JWT → near_account → фильтр по роли), JWT токен расширяется полем `near_account`. Frontend обретает экран логина (`#login`), auth-guard в роутере и nav-bar с кнопкой «Выйти». Auth state хранится в localStorage.

**Tech Stack:** Node.js/Express + jsonwebtoken (backend), Vanilla JS + Tailwind CSS (frontend), Jest + supertest (тесты)

---

## Карта файлов

| Файл | Действие | Что меняется |
| --- | --- | --- |
| `backend/src/services/dealService.js` | Изменить | Добавить `getDealsByUser(near_account, role)` |
| `backend/src/routes/auth.js` | Изменить | `signToken` + login-ответ включают `near_account` |
| `backend/src/routes/me.js` | Создать | `GET /api/me/deals` |
| `backend/src/app.js` | Изменить | Подключить `/api/me` роутер |
| `backend/tests/dealService.test.js` | Изменить | Тесты для `getDealsByUser` |
| `backend/tests/auth.test.js` | Изменить | Тест `near_account` в токене |
| `backend/tests/me.test.js` | Создать | Тесты для `GET /api/me/deals` |
| `frontend/index.html` | Изменить | Добавить `<div id="view-login">` |
| `frontend/app.js` | Изменить | Auth state, login view, роутер с guard, nav-bar |

---

## Task 1: dealService — добавить getDealsByUser

**Files:**
- Modify: `backend/src/services/dealService.js`
- Test: `backend/tests/dealService.test.js`

- [ ] **Step 1: Написать failing тесты для getDealsByUser**

Добавить в конец `backend/tests/dealService.test.js`:

```js
const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents, getDealsByUser } =
  require('../src/services/dealService');

// ... в конец файла добавить:

test('getDealsByUser возвращает сделки фермера по near_account', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getDealsByUser('farmer.testnet', 'farmer');
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('WHERE farmer = $1');
  expect(params).toEqual(['farmer.testnet']);
  expect(deals).toHaveLength(1);
});

test('getDealsByUser возвращает сделки инвестора по near_account', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getDealsByUser('investor.testnet', 'investor');
  const [sql, params] = pool.query.mock.calls[0];
  expect(sql).toContain('WHERE investor = $1');
  expect(params).toEqual(['investor.testnet']);
  expect(deals).toHaveLength(1);
});

test('getDealsByUser возвращает все сделки для роли admin', async () => {
  pool.query.mockResolvedValue({ rows: [{ id: 1, ...sampleDeal }] });
  const deals = await getDealsByUser(null, 'admin');
  expect(pool.query).toHaveBeenCalledWith('SELECT * FROM deals ORDER BY created_at DESC');
  expect(deals).toHaveLength(1);
});

test('getDealsByUser возвращает все сделки когда near_account не задан', async () => {
  pool.query.mockResolvedValue({ rows: [] });
  await getDealsByUser(null, 'farmer');
  expect(pool.query).toHaveBeenCalledWith('SELECT * FROM deals ORDER BY created_at DESC');
});
```

- [ ] **Step 2: Запустить тесты — убедиться что падают**

```powershell
cd E:\agripartners\backend
npx jest tests/dealService.test.js --no-coverage
```

Ожидаемый результат: `getDealsByUser is not a function` или аналогичная ошибка.

- [ ] **Step 3: Обновить import в верхней строке dealService.test.js**

Первую строку с require заменить:
```js
// БЫЛО:
const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents } =
  require('../src/services/dealService');

// СТАЛО:
const { getAllDeals, getDealById, createDeal, addEvent, getDealEvents, getDealsByUser } =
  require('../src/services/dealService');
```

- [ ] **Step 4: Реализовать getDealsByUser в dealService.js**

Добавить в конец `backend/src/services/dealService.js` (перед `module.exports`):

```js
async function getDealsByUser(near_account, role) {
  if (near_account && role === 'farmer') {
    const { rows } = await pool.query(
      'SELECT * FROM deals WHERE farmer = $1 ORDER BY created_at DESC',
      [near_account]
    );
    return rows;
  }
  if (near_account && role === 'investor') {
    const { rows } = await pool.query(
      'SELECT * FROM deals WHERE investor = $1 ORDER BY created_at DESC',
      [near_account]
    );
    return rows;
  }
  const { rows } = await pool.query('SELECT * FROM deals ORDER BY created_at DESC');
  return rows;
}
```

Обновить `module.exports`:
```js
module.exports = { getAllDeals, getDealById, createDeal, addEvent, getDealEvents, getDealsByUser };
```

- [ ] **Step 5: Запустить тесты — убедиться что проходят**

```powershell
npx jest tests/dealService.test.js --no-coverage
```

Ожидаемый результат: все тесты PASS.

- [ ] **Step 6: Коммит**

```powershell
git add backend/src/services/dealService.js backend/tests/dealService.test.js
git commit -m "feat: add getDealsByUser to dealService"
```

---

## Task 2: JWT — добавить near_account в токен

**Files:**
- Modify: `backend/src/routes/auth.js`
- Test: `backend/tests/auth.test.js`

- [ ] **Step 1: Написать failing тест**

Добавить в конец `backend/tests/auth.test.js`:

```js
test('POST /api/auth/login токен содержит near_account', async () => {
  userService.findByUsername.mockResolvedValue({ ...mockUser, near_account: 'farmer.testnet' });
  userService.verifyPassword.mockResolvedValue(true);

  const res = await request(app).post('/api/auth/login').send({ username: 'farmer1', password: 'pass' });
  expect(res.status).toBe(200);
  const decoded = jwt.verify(res.body.token, 'test-jwt-secret');
  expect(decoded.near_account).toBe('farmer.testnet');
  expect(res.body.user.near_account).toBe('farmer.testnet');
});

test('POST /api/auth/login near_account равен null когда не задан', async () => {
  userService.findByUsername.mockResolvedValue(mockUser); // mockUser без near_account
  userService.verifyPassword.mockResolvedValue(true);

  const res = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'Admin123!' });
  expect(res.status).toBe(200);
  const decoded = jwt.verify(res.body.token, 'test-jwt-secret');
  expect(decoded.near_account).toBeNull();
  expect(res.body.user.near_account).toBeNull();
});
```

- [ ] **Step 2: Запустить тесты — убедиться что падают**

```powershell
npx jest tests/auth.test.js --no-coverage
```

Ожидаемый результат: 2 новых теста FAIL (near_account не в токене).

- [ ] **Step 3: Обновить signToken и login-ответ в auth.js**

Изменить функцию `signToken` в `backend/src/routes/auth.js`:
```js
// БЫЛО:
function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// СТАЛО:
function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, near_account: user.near_account || null },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}
```

Изменить login-ответ в том же файле:
```js
// БЫЛО:
res.json({ token: signToken(user), user: { id: user.id, username: user.username, role: user.role } });

// СТАЛО:
res.json({
  token: signToken(user),
  user: { id: user.id, username: user.username, role: user.role, near_account: user.near_account || null }
});
```

- [ ] **Step 4: Запустить все тесты auth**

```powershell
npx jest tests/auth.test.js --no-coverage
```

Ожидаемый результат: все тесты PASS.

- [ ] **Step 5: Коммит**

```powershell
git add backend/src/routes/auth.js backend/tests/auth.test.js
git commit -m "feat: add near_account to JWT payload and login response"
```

---

## Task 3: Backend — маршрут /api/me/deals

**Files:**
- Create: `backend/src/routes/me.js`
- Create: `backend/tests/me.test.js`

- [ ] **Step 1: Написать тесты**

Создать `backend/tests/me.test.js`:

```js
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.API_KEY = 'test-api-key';
process.env.NEAR_ADMIN_ACCOUNT = 'admin.testnet';
process.env.NEAR_ADMIN_PRIVATE_KEY = 'ed25519:test';

jest.mock('../src/services/dealService');
jest.mock('../src/db/index', () => ({ query: jest.fn() }));

const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { requireJWT } = require('../src/middleware/jwtAuth');
const meRouter = require('../src/routes/me');
const dealService = require('../src/services/dealService');

const app = express();
app.use(express.json());
app.use('/api/me', requireJWT, meRouter);

const farmerToken = jwt.sign(
  { id: 2, username: 'farmer1', role: 'farmer', near_account: 'farmer.testnet' },
  'test-jwt-secret'
);
const investorToken = jwt.sign(
  { id: 3, username: 'inv1', role: 'investor', near_account: 'investor.testnet' },
  'test-jwt-secret'
);
const adminToken = jwt.sign(
  { id: 1, username: 'admin', role: 'admin', near_account: null },
  'test-jwt-secret'
);

const mockDeals = [
  { id: 1, farmer: 'farmer.testnet', investor: 'investor.testnet', deal_type: 'fidlot' }
];

beforeEach(() => jest.clearAllMocks());

test('GET /api/me/deals возвращает 401 без токена', async () => {
  const res = await request(app).get('/api/me/deals');
  expect(res.status).toBe(401);
});

test('GET /api/me/deals возвращает 401 при невалидном токене', async () => {
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', 'Bearer invalid.token.here');
  expect(res.status).toBe(401);
});

test('GET /api/me/deals возвращает сделки фермера', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${farmerToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith('farmer.testnet', 'farmer');
  expect(res.body).toHaveLength(1);
  expect(res.body[0].id).toBe(1);
});

test('GET /api/me/deals вызывает getDealsByUser с near_account инвестора', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${investorToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith('investor.testnet', 'investor');
});

test('GET /api/me/deals вызывает getDealsByUser с null для admin', async () => {
  dealService.getDealsByUser.mockResolvedValue(mockDeals);
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${adminToken}`);
  expect(res.status).toBe(200);
  expect(dealService.getDealsByUser).toHaveBeenCalledWith(null, 'admin');
});

test('GET /api/me/deals возвращает 500 при ошибке БД', async () => {
  dealService.getDealsByUser.mockRejectedValue(new Error('DB error'));
  const res = await request(app)
    .get('/api/me/deals')
    .set('Authorization', `Bearer ${farmerToken}`);
  expect(res.status).toBe(500);
  expect(res.body.error).toBe('DB error');
});
```

- [ ] **Step 2: Запустить тесты — убедиться что падают**

```powershell
npx jest tests/me.test.js --no-coverage
```

Ожидаемый результат: `Cannot find module '../src/routes/me'`.

- [ ] **Step 3: Создать me.js роутер**

Создать файл `backend/src/routes/me.js`:

```js
const router = require('express').Router();
const dealService = require('../services/dealService');

router.get('/deals', async (req, res) => {
  try {
    const { near_account, role } = req.user;
    const deals = await dealService.getDealsByUser(near_account, role);
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 4: Запустить тесты**

```powershell
npx jest tests/me.test.js --no-coverage
```

Ожидаемый результат: все 6 тестов PASS.

- [ ] **Step 5: Коммит**

```powershell
git add backend/src/routes/me.js backend/tests/me.test.js
git commit -m "feat: add GET /api/me/deals endpoint"
```

---

## Task 4: Backend — подключить /api/me в app.js

**Files:**
- Modify: `backend/src/app.js`

- [ ] **Step 1: Добавить meRouter в app.js**

Изменить `backend/src/app.js`:

```js
// ДОБАВИТЬ в импорты (после adminRouter):
const meRouter = require('./routes/me');

// ДОБАВИТЬ после строки с /api/admin:
app.use('/api/me', requireJWT, meRouter);
```

Полный файл после правки:
```js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db/index');
const { requireJWT, requireRole } = require('./middleware/jwtAuth');
const authRouter = require('./routes/auth');
const dealsRouter = require('./routes/deals');
const adminRouter = require('./routes/admin');
const meRouter = require('./routes/me');

['API_KEY', 'NEAR_ADMIN_ACCOUNT', 'NEAR_ADMIN_PRIVATE_KEY', 'JWT_SECRET'].forEach(k => {
  if (!process.env[k]) throw new Error(`Missing required env var: ${k}`);
});

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

app.use('/api/auth', authRouter);
app.use('/api/deals', dealsRouter);
app.use('/api/admin', requireJWT, requireRole('admin'), adminRouter);
app.use('/api/me', requireJWT, meRouter);

module.exports = app;
```

- [ ] **Step 2: Запустить все тесты**

```powershell
npx jest --no-coverage
```

Ожидаемый результат: все тесты PASS (было 38 + добавили ~10 новых = ~48).

- [ ] **Step 3: Коммит**

```powershell
git add backend/src/app.js
git commit -m "feat: mount /api/me router in app"
```

---

## Task 5: Frontend — auth state + экран логина

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/app.js`

- [ ] **Step 1: Добавить view-login в index.html**

Изменить `frontend/index.html` — добавить div после `view-detail`:

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
  <div id="view-login" class="hidden max-w-md mx-auto px-4 py-8"></div>
  <div id="view-list"  class="hidden max-w-4xl mx-auto px-4 py-8"></div>
  <div id="view-detail" class="hidden max-w-4xl mx-auto px-4 py-8"></div>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Добавить auth-утилиты в начало app.js**

Вставить сразу после строки `const API_BASE = '...'`:

```js
// --- Auth state ---

function getAuth() {
  try { return JSON.parse(localStorage.getItem('ap_auth') || 'null'); } catch { return null; }
}

function setAuth(token, user) {
  localStorage.setItem('ap_auth', JSON.stringify({ token, user }));
}

function clearAuth() {
  localStorage.removeItem('ap_auth');
}

function authHeaders() {
  const auth = getAuth();
  return auth ? { Authorization: `Bearer ${auth.token}` } : {};
}
```

- [ ] **Step 3: Добавить showLogin и handleLogin в app.js**

Вставить перед секцией `// --- Список сделок ---`:

```js
// --- Логин ---

function showLogin() {
  showView('view-login');
  const el = document.getElementById('view-login');
  el.innerHTML = `
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-green-400">AgriPartners</h1>
      <p class="text-slate-400 mt-1">Войдите в личный кабинет</p>
    </div>
    <form id="login-form" class="bg-slate-800 rounded-xl p-6 space-y-4">
      <div>
        <label class="block text-sm text-slate-400 mb-1">Логин</label>
        <input id="login-username" type="text" autocomplete="username"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
      </div>
      <div>
        <label class="block text-sm text-slate-400 mb-1">Пароль</label>
        <input id="login-password" type="password" autocomplete="current-password"
          class="w-full bg-slate-700 text-slate-100 px-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500" />
      </div>
      <div id="login-error" class="hidden bg-red-900 text-red-200 px-3 py-2 rounded text-sm"></div>
      <button type="submit"
        class="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-medium transition">
        Войти
      </button>
    </form>
  `;
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    await handleLogin(
      document.getElementById('login-username').value.trim(),
      document.getElementById('login-password').value
    );
  });
}

async function handleLogin(username, password) {
  const errEl = document.getElementById('login-error');
  const btn = document.querySelector('#login-form button[type="submit"]');
  errEl.classList.add('hidden');
  btn.disabled = true;
  btn.textContent = 'Вход...';
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      errEl.textContent = data.error || 'Ошибка входа';
      errEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Войти';
      return;
    }
    setAuth(data.token, data.user);
    location.hash = '#deals';
  } catch {
    errEl.textContent = 'Сервер недоступен';
    errEl.classList.remove('hidden');
    btn.disabled = false;
    btn.textContent = 'Войти';
  }
}

function logout() {
  clearAuth();
  location.hash = '#login';
}
```

- [ ] **Step 4: Обновить showView для поддержки view-login**

Заменить функцию `showView` в app.js:

```js
// БЫЛО:
function showView(viewId) {
  document.getElementById('view-list').classList.add('hidden');
  document.getElementById('view-detail').classList.add('hidden');
  document.getElementById(viewId).classList.remove('hidden');
}

// СТАЛО:
function showView(viewId) {
  ['view-login', 'view-list', 'view-detail'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(viewId).classList.remove('hidden');
}
```

- [ ] **Step 5: Добавить renderNav в app.js**

Вставить после функции `logout()`:

```js
// --- Nav bar ---

function renderNav() {
  const auth = getAuth();
  if (!auth) return '';
  const labels = { farmer: 'Фермер', investor: 'Инвестор', admin: 'Администратор' };
  const roleLabel = labels[auth.user.role] || auth.user.role;
  return `
    <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
      <span class="text-sm text-slate-400">${roleLabel}: <span class="text-slate-200 font-medium">${auth.user.username}</span></span>
      <button onclick="logout()" class="text-sm text-slate-400 hover:text-red-400 transition">Выйти →</button>
    </div>
  `;
}
```

- [ ] **Step 6: Обновить роутер с auth-guard**

Заменить функцию `route` в app.js:

```js
// БЫЛО:
function route() {
  const hash = location.hash;
  const m = hash.match(/^#deals\/(\d+)$/);
  if (m) {
    showDeal(m[1]);
  } else {
    showDeals();
  }
}

// СТАЛО:
function route() {
  const auth = getAuth();
  const hash = location.hash;

  if (hash === '#login') {
    if (auth) { location.hash = '#deals'; return; }
    showLogin();
    return;
  }

  if (!auth) {
    location.hash = '#login';
    return;
  }

  const m = hash.match(/^#deals\/(\d+)$/);
  if (m) {
    showDeal(m[1]);
  } else {
    showDeals();
  }
}
```

Обновить load-handler (в конце app.js):

```js
// БЫЛО:
window.addEventListener('load', () => {
  if (!location.hash || location.hash === '#') location.hash = '#deals';
  else route();
});

// СТАЛО:
window.addEventListener('load', () => {
  if (!location.hash || location.hash === '#') {
    location.hash = getAuth() ? '#deals' : '#login';
  } else {
    route();
  }
});
```

- [ ] **Step 7: Проверить вручную — экран логина**

Открыть `frontend/index.html` через `serve E:\agripartners\frontend -p 5500` и перейти на http://localhost:5500. Должен открыться экран логина.

Ввести неправильные данные — должно показать ошибку. Ввести правильные (admin / Demo2024!) — должен открыться `#deals`.

- [ ] **Step 8: Коммит**

```powershell
cd E:\agripartners
git add frontend/index.html frontend/app.js
git commit -m "feat: add login screen and auth state to frontend"
```

---

## Task 6: Frontend — личный кабинет (showDeals + nav)

**Files:**
- Modify: `frontend/app.js`

- [ ] **Step 1: Обновить showDeals — использовать /api/me/deals**

Заменить функцию `showDeals` в app.js:

```js
async function showDeals() {
  showView('view-list');
  const el = document.getElementById('view-list');
  el.innerHTML = `
    ${renderNav()}
    <h1 class="text-3xl font-bold text-green-400 mb-1">AgriPartners</h1>
    <p class="text-slate-400 mb-6">Агро-инвестиции на NEAR Protocol</p>
    <div class="spinner"></div>
  `;
  try {
    const res = await fetch(`${API_BASE}/api/me/deals`, { headers: authHeaders() });
    if (res.status === 401) { clearAuth(); location.hash = '#login'; return; }
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
```

- [ ] **Step 2: Проверить вручную**

Войти как admin — список должен загрузиться. Вверху должна быть строка `Администратор: admin | Выйти →`.

Нажать «Выйти» — должен вернуться экран логина. После обновления страницы — снова экран логина.

- [ ] **Step 3: Коммит**

```powershell
git add frontend/app.js
git commit -m "feat: showDeals uses /api/me/deals with auth headers and nav bar"
```

---

## Task 7: Frontend — авторизация в деталях сделки

**Files:**
- Modify: `frontend/app.js`

- [ ] **Step 1: Обновить showDeal — добавить nav и auth headers**

Заменить начало функции `showDeal` (только loading state — до `Promise.allSettled`):

```js
async function showDeal(id) {
  showView('view-detail');
  const el = document.getElementById('view-detail');
  el.innerHTML = `
    ${renderNav()}
    <a href="#deals" class="text-slate-400 hover:text-white text-sm mb-6 inline-block">← Назад</a>
    <div class="spinner"></div>
  `;

  const headers = authHeaders();
  const [dealRes, statusRes, balancesRes, eventsRes] = await Promise.allSettled([
    fetch(`${API_BASE}/api/deals/${id}`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/status`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/balances`, { headers }),
    fetch(`${API_BASE}/api/deals/${id}/events`, { headers })
  ]);

  // ... остальное без изменений
```

- [ ] **Step 2: Обновить renderDealDetail — добавить nav**

Заменить начало `el.innerHTML` в функции `renderDealDetail`:

```js
function renderDealDetail(el, deal, status, balances, events) {
  const cycleText = status ? `· Цикл ${status.current_cycle}` : '';
  el.innerHTML = `
    ${renderNav()}
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
```

- [ ] **Step 3: Финальная проверка вручную**

1. Открыть http://localhost:5500 — должен показать экран логина
2. Войти как admin (admin / Demo2024!) — открылся список сделок с nav-bar
3. Кликнуть на сделку — открылась детальная страница с nav-bar
4. Нажать «← Назад» — вернулся список
5. Нажать «Выйти →» — вернулся экран логина
6. Обновить страницу — снова экран логина (localStorage очищен)
7. Войти повторно → перейти на http://localhost:5500/#deals — открылся список без повторного логина

- [ ] **Step 4: Запустить все backend тесты финально**

```powershell
cd E:\agripartners\backend
npx jest --no-coverage
```

Ожидаемый результат: все тесты PASS.

- [ ] **Step 5: Финальный коммит**

```powershell
cd E:\agripartners
git add frontend/app.js
git commit -m "feat: add nav bar and auth headers to deal detail view"
```

---

## Self-Review

**Покрытие spec:**
- ✅ Вход обязателен — роутер с auth-guard, редирект на #login
- ✅ Только просмотр — кнопка withdraw не добавляется
- ✅ Одинаковый вид для farmer и investor — renderDealCard/renderDealDetail не меняются
- ✅ Расширить существующий app.js — не создаём новых файлов фронтенда
- ✅ Маршруты: #login, #deals (свои), #deals/:id
- ✅ Auth state: localStorage ap_auth { token, user }
- ✅ GET /api/me/deals с JWT и фильтром по роли
- ✅ near_account в JWT payload

**Проверка типов и имён:**
- `getDealsByUser(near_account, role)` — одинаково в dealService.js, me.js и тестах
- `authHeaders()` — используется в showDeals и showDeal
- `renderNav()` — используется в showDeals, showDeal loading state и renderDealDetail
- `getAuth()`, `setAuth()`, `clearAuth()` — согласованы везде

**Placeholders:** отсутствуют — весь код полный.
