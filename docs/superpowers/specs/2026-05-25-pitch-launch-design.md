# AgriPartners — Pitch & Launch Pack Design
**Date:** 2026-05-25  
**Status:** Approved

---

## Контекст

AgriPartners — RWA платформа агро-инвестиций на NEAR testnet. Статус:
- Смарт-контракт ✅, Backend ✅, Frontend ✅, Demo на testnet ✅
- Есть реальный фермер с подписанным договором Fidlot v5.9
- Инвестиционная модель: $50k/сделка, 60/40 сплит, 20% performance fee
- Соло-фаундер, интерес от фермеров подтверждён

**Цель:** подготовить всё необходимое для первых пользователей и заявки в NEAR Foundation.

---

## Блок 1 — Деплой (Railway + Vercel + Turso)

### Проблема
Railway использует ephemeral файловую систему — SQLite сбрасывается при редеплое.

### Решение: Turso (LibSQL)
Turso — облачный SQLite-совместимый сервис. Минимальные изменения кода:
- Заменить `better-sqlite3` на `@libsql/client`
- Адаптировать `db/index.js` под async API
- Остальная бизнес-логика не меняется

**Free tier Turso:** 500 баз, 9 GB, достаточно для MVP.

### Архитектура
```
GitHub (main)
  ├─→ Railway      — backend Node.js (PORT=3000)
  │     └─→ Turso  — SQLite cloud (deals + events)
  └─→ Vercel       — frontend static (index.html + style.css + app.js)
```

### Переменные окружения Railway
```
NEAR_NETWORK=testnet
NEAR_ADMIN_ACCOUNT=farab.testnet
NEAR_ADMIN_PRIVATE_KEY=ed25519:...
WASM_PATH=./contract/target/wasm32-unknown-unknown/release/agripartners.wasm
API_KEY=<сгенерировать>
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

### Переменные окружения Vercel
```
VITE_API_URL=https://<railway-url>
```

### WASM при деплое
WASM файл (~127 KB) коммитится в репозиторий (добавить в `.gitignore` исключение для release WASM). Railway собирает из исходников невозможно (нет Rust toolchain) — файл должен быть в репо.

### Результат
- Backend URL: `https://agripartners-backend.railway.app`
- Frontend URL: `https://agripartners.vercel.app`

---

## Блок 2 — Одностраничники (3 документа)

Все три — статические HTML файлы в `frontend/pages/`. Открываются в браузере, печатаются как PDF (Ctrl+P).

### 2A — Investor Brief
**Аудитория:** потенциальный инвестор, $50k/сделка  
**Язык:** русский + английский (два варианта)  
**Структура:**
1. Заголовок: "Инвестируй в сельское хозяйство Узбекистана. Защищено блокчейном."
2. Проблема: фермеры без доступа к капиталу, инвесторы без прозрачности
3. Решение: 3 шага (вложи → эскроу защищает → получи прибыль)
4. Цифры: $50k/сделка, 40% прибыли инвестору, 3 цикла, эскроу 44%
5. Технология: NEAR блокчейн, смарт-контракт, прозрачность
6. CTA: ссылка на dashboard + контакт

### 2B — Farmer Brief
**Аудитория:** фермер Узбекистана  
**Язык:** узбекский + русский  
**Структура:**
1. Заголовок: "Moliyalashtiring. Bank siz. Blokchein orqali."
2. Проблема: банки отказывают, условия непрозрачны
3. Решение: 3 шага (договор → инвестор вносит → ты работаешь → прибыль делится)
4. Цифры: 60% прибыли фермеру, защита эскроу, фиксированные условия
5. Документы: договор Fidlot v5.9 уже готов
6. CTA: контакт фаундера

### 2C — Platform Overview
**Аудитория:** NEAR Foundation, партнёры, пресса  
**Язык:** английский  
**Структура:**
1. Headline: "AgriPartners — Real-World Asset platform for Central Asian agriculture on NEAR"
2. Market: агро рынок Узбекистана ~$10B, 60% фермеров без доступа к финансированию
3. Solution: смарт-контракт эскроу, прозрачные условия, мобильный дашборд
4. Traction: MVP на testnet, реальный фермер, подписанный договор
5. Tech stack: NEAR Protocol, Rust contract, Node.js, SQLite
6. Roadmap: Узбекистан → ЦА → Global
7. CTA: demo URL + email

---

## Блок 3 — Питч скрипт (3 языка)

**Формат:** Markdown файл `docs/pitch-script.md` с тремя секциями.  
**Длительность:** 5–7 минут  
**Привязка:** каждый шаг синхронизирован с demo (Deploy → Fund → Cycle 1 → Cycle 2 → Cycle 3 → Complete)

### Структура скрипта (одинакова для всех языков)

| Шаг demo | Что говорить | Длительность |
|----------|-------------|--------------|
| Вступление | Проблема: фермер в Узбекистане, банк отказал | 60 сек |
| Deploy | "Создаём смарт-контракт — условия записаны навсегда" | 60 сек |
| Fund | "Инвестор вносит $50k — деньги заблокированы в эскроу" | 60 сек |
| Cycle 1-2 | "Фермер работает, каждый цикл фиксируем результат" | 90 сек |
| Cycle 3 + Complete | "Сделка завершена — все получили своё, всё прозрачно" | 60 сек |
| Заключение | Roadmap + CTA для инвестора | 60 сек |

### Языки
- `pitch-script-ru.md` — русский
- `pitch-script-en.md` — English
- `pitch-script-uz.md` — O'zbek

---

## Блок 4 — Пакет NEAR Foundation

### 4A — Grant Proposal (NEAR DevHub)

**Платформа:** https://devhub.near.org (публичный форум, Markdown)  
**Сумма:** $30,000 USDC  
**Структура milestones:**

| Milestone | Сумма | Deliverable | Срок |
|-----------|-------|-------------|------|
| M1 | $10,000 | Mainnet деплой + auth (JWT, роли) | 4 недели |
| M2 | $10,000 | Telegram уведомления + Railway/Vercel prod | 4 недели |
| M3 | $10,000 | Первая реальная сделка на mainnet + отчёт | 4 недели |

**Разделы proposal:**
1. **TL;DR** — одно предложение
2. **Problem** — агро-финансирование в ЦА, рынок $10B, 60% без доступа к капиталу
3. **Solution** — смарт-контракт эскроу на NEAR
4. **What's Built** — MVP на testnet, demo видео/ссылка, реальный фермер
5. **Why NEAR** — низкие комиссии, скорость, developer-friendly
6. **Team** — соло-фаундер + тракшн как компенсация
7. **Milestones** — таблица выше
8. **Budget breakdown** — как тратятся $30k
9. **Risks & Mitigation**

**Файл:** `docs/near-grant-proposal.md`

### 4B — NEAR Horizon Profile

**Платформа:** https://app.near.org/horizon  
**Тип:** Startup profile  
**Разделы:**
- Project name: AgriPartners
- Tagline: "Blockchain-secured agricultural investments in Central Asia"
- Description: 200 слов
- Category: RWA / DeFi / Agriculture
- Stage: MVP
- Website: Vercel URL
- Demo: Railway URL
- GitHub: https://github.com/farabek/agripartners

**Файл:** `docs/near-horizon-profile.md`

---

## Порядок реализации

1. **Блок 1** — Деплой (Railway + Turso + Vercel) → получаем живые URL
2. **Блок 2** — Одностраничники (используют живые URL)
3. **Блок 3** — Питч скрипты (ссылаются на live demo)
4. **Блок 4** — NEAR Foundation пакет (включает все ссылки и материалы)

---

## Файловая структура

```
agripartners/
  backend/
    src/db/index.js          ← адаптация под Turso async API
    src/db/turso.js          ← новый клиент Turso
  frontend/
    pages/
      investor-brief-ru.html
      investor-brief-en.html
      farmer-brief-uz.html
      farmer-brief-ru.html
      platform-overview-en.html
  docs/
    pitch-script-ru.md
    pitch-script-en.md
    pitch-script-uz.md
    near-grant-proposal.md
    near-horizon-profile.md
    60-40/                   ← существующие PDF договоры
```
