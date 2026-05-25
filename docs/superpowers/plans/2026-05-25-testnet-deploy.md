# Testnet Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить fund-эндпоинт в backend и создать demo.ps1 для запуска AgriPartners на NEAR testnet с одной командой.

**Architecture:** Backend получает новый эндпоинт `POST /api/admin/deals/:id/fund` который вызывает `fund()` на смарт-контракте. PowerShell-скрипт `demo.ps1` оркестрирует полный demo-цикл через API. Всё запускается локально.

**Tech Stack:** Node.js + Express (backend), near-api-js v2 (NEAR вызовы), PowerShell (demo-скрипт), NEAR testnet (farab.testnet).

---

## Файловая структура

```
E:\agripartners\
  backend\src\services\nearService.js    — добавить fundContract()
  backend\src\routes\admin.js            — добавить POST /deals/:id/fund
  backend\tests\admin.routes.test.js     — добавить 2 теста для fund
  demo.ps1                               — новый demo-скрипт
```

---

## Task 1: Fund эндпоинт в backend

**Files:**
- Modify: `E:\agripartners\backend\src\services\nearService.js`
- Modify: `E:\agripartners\backend\src\routes\admin.js`
- Modify: `E:\agripartners\backend\tests\admin.routes.test.js`

- [ ] **Шаг 1: Добавить mockDeal.investment_amount в тест-файл**

Открыть `E:\agripartners\backend\tests\admin.routes.test.js`.

Найти строку:
```js
const mockDeal = { id: 1, contract_address: 'ap1.agripartners.testnet', deal_type: 'fidlot' };
```

Заменить на:
```js
const mockDeal = { id: 1, contract_address: 'ap1.agripartners.testnet', deal_type: 'fidlot', investment_amount: '10000000000000000000000000' };
```

- [ ] **Шаг 2: Написать два failing теста для fund**

В конце файла `admin.routes.test.js`, после последнего теста, добавить:

```js
test('POST /api/admin/deals/:id/fund calls fundContract and records event', async () => {
  nearService.fundContract = jest.fn().mockResolvedValue({ txHash: 'tx4' });
  const res = await request(app)
    .post('/api/admin/deals/1/fund')
    .set('X-API-Key', 'test-secret');
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
  expect(res.body.tx_hash).toBe('tx4');
  expect(nearService.fundContract).toHaveBeenCalledWith(
    'ap1.agripartners.testnet',
    '10000000000000000000000000'
  );
  expect(dealService.addEvent).toHaveBeenCalledWith(
    expect.objectContaining({ event_type: 'funded', tx_hash: 'tx4' })
  );
});

test('POST /api/admin/deals/:id/fund returns 404 when deal not found', async () => {
  dealService.getDealById.mockReturnValueOnce(null);
  const res = await request(app)
    .post('/api/admin/deals/999/fund')
    .set('X-API-Key', 'test-secret');
  expect(res.status).toBe(404);
});
```

- [ ] **Шаг 3: Запустить тесты и убедиться что новые падают**

```powershell
Set-Location E:\agripartners\backend
npm test -- --testPathPattern=admin.routes
```

Ожидаемый вывод: два новых теста FAIL (`Cannot read properties of undefined` или `404 expected 200`), остальные 5 PASS.

- [ ] **Шаг 4: Добавить fundContract в nearService.js**

Открыть `E:\agripartners\backend\src\services\nearService.js`.

Перед строкой `module.exports = {` добавить:

```js
async function fundContract(contractAddress, investmentAmount) {
  const account = await getAdminAccount();
  const result = await account.functionCall({
    contractId: contractAddress,
    methodName: 'fund',
    args: {},
    gas: '100000000000000',
    attachedDeposit: investmentAmount
  });
  return { txHash: result.transaction.hash };
}
```

- [ ] **Шаг 5: Экспортировать fundContract**

Найти строку:
```js
module.exports = { getContractStatus, getContractBalances, deployContract, startCycle, reportCycle };
```

Заменить на:
```js
module.exports = { getContractStatus, getContractBalances, deployContract, startCycle, reportCycle, fundContract };
```

- [ ] **Шаг 6: Добавить роут POST /deals/:id/fund в admin.js**

Открыть `E:\agripartners\backend\src\routes\admin.js`.

Перед строкой `module.exports = router;` добавить:

```js
router.post('/deals/:id/fund', async (req, res) => {
  const deal = dealService.getDealById(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  try {
    const { txHash } = await nearService.fundContract(
      deal.contract_address,
      deal.investment_amount
    );
    dealService.addEvent({ deal_id: deal.id, event_type: 'funded', tx_hash: txHash });
    res.json({ success: true, tx_hash: txHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

- [ ] **Шаг 7: Запустить все тесты и убедиться что все проходят**

```powershell
Set-Location E:\agripartners\backend
npm test
```

Ожидаемый вывод:
```
Tests: 31 passed, 31 total
```

- [ ] **Шаг 8: Закоммитить**

```powershell
Set-Location E:\agripartners
git add backend/src/services/nearService.js backend/src/routes/admin.js backend/tests/admin.routes.test.js
git commit -m "feat: add fund endpoint to backend for testnet demo"
```

---

## Task 2: Создать demo.ps1

**Files:**
- Create: `E:\agripartners\demo.ps1`

- [ ] **Шаг 1: Создать demo.ps1**

```powershell
# AgriPartners Demo Script
# Запуск: .\demo.ps1
# Требования: backend запущен (npm start), frontend запущен (serve frontend -p 5500)

$API_BASE = "http://localhost:3000"
$API_KEY  = "agripartners-demo-key"
$HEADERS  = @{ "X-API-Key" = $API_KEY }

$INVESTMENT     = "10000000000000000000000000"   # 10 NEAR
$PROFIT         = "3000000000000000000000000"    # 3 NEAR
$CAPITAL_RETURN = "4080000000000000000000000"    # 4.08 NEAR
$FARMER         = "farab.testnet"
$INVESTOR       = "farab.testnet"

function Step($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "OK  $msg" -ForegroundColor Green }
function Pause($msg) { Read-Host "`n$msg [Enter]" | Out-Null }

Write-Host "`nAgriPartners Demo — NEAR Testnet" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

# 0. Проверка backend
Step "Проверка backend"
try {
    Invoke-RestMethod "$API_BASE/health" -ErrorAction Stop | Out-Null
    Ok "Backend доступен на $API_BASE"
} catch {
    Write-Host "ОШИБКА: Backend недоступен. Запустите: cd backend; npm start" -ForegroundColor Red
    exit 1
}

# 1. Деплой сделки
Step "1. Деплой смарт-контракта"
Write-Host "Это займёт 10-30 секунд (транзакция на testnet)..."

$dealBody = @{
    deal_type          = "Fidlot v5.9"
    farmer             = $FARMER
    investor           = $INVESTOR
    investment_amount  = $INVESTMENT
    farmer_split_pct   = 60
    investor_split_pct = 40
    escrow_pct         = 44
    performance_fee_pct = 20
    cycle_duration_days = 1
    total_cycles       = 3
    capital_return_near = $CAPITAL_RETURN
} | ConvertTo-Json

try {
    $deal = Invoke-RestMethod "$API_BASE/api/admin/deals" -Method POST -Headers $HEADERS -Body $dealBody -ContentType "application/json" -ErrorAction Stop
} catch {
    Write-Host "ОШИБКА при деплое: $_" -ForegroundColor Red
    exit 1
}

$dealId = $deal.id
Ok "Контракт задеплоен: $($deal.contract_address)"
Ok "Deal ID: $dealId"
Write-Host "`nОткройте в браузере: http://localhost:5500/#deals/$dealId" -ForegroundColor Yellow
Pause "Просмотрите дашборд, затем продолжите"

# 2. Финансирование
Step "2. Внесение инвестиции (fund)"
Write-Host "Инвестор вносит 10 NEAR..."
try {
    $funded = Invoke-RestMethod "$API_BASE/api/admin/deals/$dealId/fund" -Method POST -Headers $HEADERS -ErrorAction Stop
} catch {
    Write-Host "ОШИБКА при fund: $_" -ForegroundColor Red
    exit 1
}
Ok "Инвестиция внесена. TX: $($funded.tx_hash)"
Write-Host "Обновите дашборд — статус изменится на Funded" -ForegroundColor Yellow
Pause "Нажмите Enter для старта цикла 1"

# 3. Циклы
for ($i = 1; $i -le 3; $i++) {
    Step "$i. Старт цикла $i"
    try {
        $started = Invoke-RestMethod "$API_BASE/api/admin/deals/$dealId/start-cycle" -Method POST -Headers $HEADERS -ErrorAction Stop
    } catch {
        Write-Host "ОШИБКА при start-cycle: $_" -ForegroundColor Red
        exit 1
    }
    Ok "Цикл $i запущен. TX: $($started.tx_hash)"
    Write-Host "Обновите дашборд — статус: CycleActive, цикл $i" -ForegroundColor Yellow
    Pause "Нажмите Enter для репорта цикла $i"

    $reportBody = @{ profit_near = $PROFIT; losses_near = "0" } | ConvertTo-Json
    try {
        $reported = Invoke-RestMethod "$API_BASE/api/admin/deals/$dealId/report-cycle" -Method POST -Headers $HEADERS -Body $reportBody -ContentType "application/json" -ErrorAction Stop
    } catch {
        Write-Host "ОШИБКА при report-cycle: $_" -ForegroundColor Red
        exit 1
    }
    Ok "Цикл $i завершён. Статус: $($reported.status)"

    if ($reported.status -eq "Completed" -or $reported.status -eq "Terminated") {
        Write-Host "Обновите дашборд — статус: $($reported.status)" -ForegroundColor Yellow
        break
    }

    if ($i -lt 3) {
        Pause "Нажмите Enter для цикла $($i + 1)"
    }
}

Write-Host "`n=================================" -ForegroundColor Yellow
Write-Host "Demo завершён!" -ForegroundColor Green
Write-Host "Дашборд: http://localhost:5500/#deals/$dealId" -ForegroundColor Yellow
```

- [ ] **Шаг 2: Проверить синтаксис скрипта**

```powershell
$errors = $null
[System.Management.Automation.Language.Parser]::ParseFile(
    "E:\agripartners\demo.ps1", [ref]$null, [ref]$errors
)
if ($errors) { $errors | ForEach-Object { Write-Host $_.Message -ForegroundColor Red } }
else { Write-Host "Синтаксис OK" -ForegroundColor Green }
```

Ожидаемый вывод: `Синтаксис OK`

- [ ] **Шаг 3: Закоммитить**

```powershell
Set-Location E:\agripartners
git add demo.ps1
git commit -m "feat: add PowerShell demo script for testnet pitch"
```

---

## Task 3: Настройка .env и проверка готовности

Это инструкции для ручного выполнения (не код). Необходимо сделать до запуска demo.ps1.

**Files:**
- Modify: `E:\agripartners\backend\.env` (вручную, не коммитить)

- [ ] **Шаг 1: Экспортировать приватный ключ из MyNearWallet**

1. Открыть `testnet.mynearwallet.com` в браузере
2. Нажать на иконку профиля → Settings
3. Security & Recovery → Export Private Key
4. Ввести пароль кошелька
5. Скопировать строку вида `ed25519:...`

- [ ] **Шаг 2: Заполнить backend/.env**

Открыть `E:\agripartners\backend\.env` и заполнить:

```env
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=farab.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:ВСТАВИТЬ_КЛЮЧ_СЮДА
WASM_PATH=../contract/target/wasm32-unknown-unknown/release/agripartners.wasm
API_KEY=agripartners-demo-key
PORT=3000
DB_PATH=./agripartners.db
```

- [ ] **Шаг 3: Убедиться что WASM существует**

```powershell
Test-Path "E:\agripartners\contract\target\wasm32-unknown-unknown\release\agripartners.wasm"
```

Ожидаемый вывод: `True`

Если `False` — собрать WASM:
```powershell
Set-Location E:\agripartners\contract
$env:RUSTUP_TOOLCHAIN = "1.86"
cargo build --target wasm32-unknown-unknown --release
```

- [ ] **Шаг 4: Проверить баланс farab.testnet**

Открыть `https://testnet.nearblocks.io/address/farab.testnet` в браузере.

Убедиться что баланс > 15 NEAR (нужно ~12 NEAR на деплой аккаунта + инвестицию + gas).

Если меньше — получить тестовый NEAR через `https://near-faucet.io`.

- [ ] **Шаг 5: Запустить backend и проверить подключение**

```powershell
Set-Location E:\agripartners\backend
npm start
```

Ожидаемый вывод: `AgriPartners backend listening on port 3000` (или аналог без ошибок).

Проверить в новом терминале:
```powershell
Invoke-RestMethod http://localhost:3000/health
```

Ожидаемый вывод: `@{status=ok}`

- [ ] **Шаг 6: Запустить frontend**

```powershell
serve E:\agripartners\frontend -p 5500
```

Открыть `http://localhost:5500` — тёмный дашборд загружается, список сделок пустой.

- [ ] **Шаг 7: Запустить demo**

```powershell
Set-Location E:\agripartners
.\demo.ps1
```

Следовать инструкциям скрипта. Между каждым шагом обновлять дашборд кнопкой "Обновить".

---

## Порядок запуска для питча

```powershell
# Терминал 1 — backend
Set-Location E:\agripartners\backend; npm start

# Терминал 2 — frontend  
serve E:\agripartners\frontend -p 5500

# Терминал 3 — demo
Set-Location E:\agripartners; .\demo.ps1
```

Браузер: `http://localhost:5500`
