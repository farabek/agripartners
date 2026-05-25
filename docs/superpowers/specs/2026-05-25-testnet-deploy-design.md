# Testnet Deploy Design: AgriPartners

**Date:** 2026-05-25  
**Status:** Approved  
**Goal:** Запустить AgriPartners локально с реальным NEAR testnet для питча NEAR Protocol команде

---

## Overview

Backend уже умеет деплоить контракты через near-api-js — near-cli не нужен. Один аккаунт `farab.testnet` используется как admin + farmer + investor (допустимо для демо). Всё работает локально, хостинг не нужен.

---

## Компоненты

| Компонент | Статус | Что делать |
|---|---|---|
| Смарт-контракт (WASM) | ✅ готов | Убедиться что файл существует |
| Backend API | ✅ готов | Добавить эндпоинт fund, заполнить .env |
| Frontend дашборд | ✅ готов | Ничего не менять |
| demo.ps1 | ❌ нет | Создать |

---

## Шаг 1: Экспорт приватного ключа

Аккаунт `farab.testnet` есть только в браузерном кошельке. Нужно получить приватный ключ:

1. Открыть `testnet.mynearwallet.com`
2. Settings → Security & Recovery → Export Private Key
3. Скопировать строку формата `ed25519:...`
4. Вставить в `backend/.env` как `NEAR_ADMIN_PRIVATE_KEY`

Ключ нигде не публиковать. Это testnet — реальных денег нет, но всё равно хранить аккуратно.

---

## Шаг 2: Backend .env

Заполнить `E:\agripartners\backend\.env`:

```env
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=farab.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:ВАША_СТРОКА_ЗДЕСЬ
WASM_PATH=../contract/target/wasm32-unknown-unknown/release/agripartners.wasm
API_KEY=agripartners-demo-key
PORT=3000
DB_PATH=./agripartners.db
```

---

## Шаг 3: Новый backend эндпоинт — fund

`fund()` в контракте вызывается от имени investor с депозитом = `investment_amount`. В демо `farab.testnet` одновременно admin и investor, поэтому admin-аккаунт может вызвать fund().

**Добавить в backend:**

- `nearService.fundContract(contractAddress, investmentAmount)` — вызов `fund()` с депозитом
- `POST /api/admin/deals/:id/fund` — защищённый эндпоинт (X-API-Key)

**nearService.fundContract:**
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

**admin route:**
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

---

## Шаг 4: demo.ps1

Файл `E:\agripartners\demo.ps1` — полный demo-цикл одной командой для питча.

**Что делает:**
1. Проверяет что backend запущен (GET /health)
2. Деплоит сделку (`POST /api/admin/deals`) — Fidlot, 3 цикла × 1 день, 1000 NEAR
3. Финансирует (`POST /api/admin/deals/:id/fund`)
4. Старт цикла 1 (`POST /api/admin/deals/:id/start-cycle`)
5. Репорт цикла 1 — profit 300 NEAR (`POST /api/admin/deals/:id/report-cycle`)
6. Выводит ссылку: `http://localhost:5500/#deals/:id`
7. Спрашивает продолжить → цикл 2 → цикл 3 → Completed

**Параметры:**
```
API_KEY     = agripartners-demo-key
API_BASE    = http://localhost:3000
INVESTMENT  = "10000000000000000000000000"   # 10 NEAR в yocto (testnet faucet даёт ~200 NEAR)
PROFIT      = "3000000000000000000000000"    # 3 NEAR в yocto
FARMER      = farab.testnet
INVESTOR    = farab.testnet
DEAL_TYPE   = Fidlot v5.9
CYCLES      = 3
CYCLE_DAYS  = 1
CAPITAL_RETURN = "4080000000000000000000000" # 4.08 NEAR в yocto (40.8% от 10 NEAR)
```

**После каждого шага:** пауза с сообщением "Нажмите Enter для продолжения" — чтобы показать дашборд между шагами на питче.

---

## Шаг 5: Запуск для демо

```powershell
# Терминал 1
Set-Location E:\agripartners\backend
npm start

# Терминал 2
serve E:\agripartners\frontend -p 5500

# Терминал 3 (запуск демо)
Set-Location E:\agripartners
.\demo.ps1
```

Открыть браузер: `http://localhost:5500`

---

## Что НЕ входит в scope

- Хостинг в облаке
- Отдельные аккаунты для farmer/investor
- Обновление demo.sh (оставить как есть)
- Mainnet деплой
- NEAR CLI установка
