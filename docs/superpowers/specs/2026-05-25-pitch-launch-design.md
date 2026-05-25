# AgriPartners — Pitch & Launch Pack Design
**Date:** 2026-05-25  
**Status:** Approved

---

## Контекст

AgriPartners — RWA платформа агро-инвестиций на NEAR testnet. Статус:
- Смарт-контракт ✅, Backend ✅, Frontend ✅, Demo на testnet ✅
- Реальный фермер готов подписать 2 договора Fidlot v5.9 после согласования финансирования
- **2 сделки × $50,000 = $100,000** — ждут финансирования от инвесторов и/или NEAR Foundation
- Соло-фаундер; следующий шаг — согласовать финансирование → фермер подписывает

### Договоры (docs/60-40/)

| Файл | Для кого | Модель |
|------|----------|--------|
| `Agri-Investor-Fidlot-v5.9-6040.pdf` | Инвестор | Fidlot v5.9 |
| `Agri-Farmer-Fidlot-v5.9-6040.pdf` | Фермер | Fidlot v5.9 |
| `Agri-Investor-VariantB-v2.1-6040.pdf` | Инвестор | Variant B |
| `Agri-Farmer-VariantB-v2.1-6040.pdf` | Фермер | Variant B |

**Эти PDF прикладываются ко всем питч-материалам и пакету NEAR Foundation.**

### Финансовая модель Fidlot v5.9 (реальные цифры)

**Для инвестора ($50,000):**
- Возврат за 35 мес: ~$82,000 (+64% ROI, 21.9% APR)
- Циклы 1–2: $9,600/цикл → Циклы 3–7: $8,480/цикл
- Возврат капитала при завершении: $20,400
- Performance Fee 20% — только с доли инвестора (40%)

**Для фермера ($0 вложений):**
- Первая выплата через 5 мес: $15,250
- За 35 мес деньгами: ~$96,250 (~1 млн сум)
- Итого выгода: $114,250 + откормочная база ($18,000) остаётся навсегда
- Fee 20% — берётся только с инвесторов, фермера не касается

**Структура сделки:**
- 50 голов молодняка × $1,000/гол = $50,000 выручка/цикл
- Стартовый пул $50,000: закупка молодняка Ц1–Ц2 ($20k) + откормбаза ($18k) + резерв ($12k)
- С Цикла 3: закупка из выручки (самофинансирование)

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
**Приложение:** `Agri-Investor-Fidlot-v5.9-6040.pdf`  
**Структура:**
1. Заголовок: "Вложи $50,000 — получи $82,000 за 35 месяцев. Защищено NEAR блокчейном."
2. Цифры крупно: $50k вход · $82k выход · +64% ROI · 21.9% APR · 35 мес
3. Как работает: 3 шага (вложи → смарт-контракт держит эскроу → получай $9,600 каждые 5 мес)
4. Защита: эскроу на блокчейне, условия неизменны, прозрачность в реальном времени
5. Сделка: 50 голов KRS × $1,000/гол, 7 циклов × 5 мес, Узбекистан
6. Документ: ссылка на PDF договор + demo dashboard
7. CTA: контакт фаундера

### 2B — Farmer Brief
**Аудитория:** фермер Узбекистана  
**Язык:** узбекский + русский  
**Приложение:** `Agri-Farmer-Fidlot-v5.9-6040.pdf`  
**Структура:**
1. Заголовок (UZ): "Siz 0 so'm kiritasiz — 35 oyda $114,250 olasiz."
2. Проблема традиционного финансирования (6 пунктов):
   - Банки: высокие % — невыгодно, съедает всю прибыль
   - Непрозрачные договоры — мелкий шрифт, скрытые комиссии
   - Долгое согласование — месяцы ожидания, горы документов
   - Залог и поручители — сложные требования к обеспечению
   - Штрафы при просрочке — один плохой сезон = долговая яма
   - Фермер не доверяет — нет прозрачного контроля над деньгами на счетах в банках
3. Цифры крупно: $0 вложений · $15,250 первая выплата через 5 мес · $114,250 итого + база
4. Как работает: инвестор финансирует, вы откармливаете и продаёте, прибыль 60/40
5. Ваша защита: 20% fee берётся только с инвесторов — ваша доля неприкосновенна
6. Откормочная база $18,000 — ваша навсегда после 35 мес
7. Документ: PDF договор уже готов, условия фиксированы
8. CTA: контакт фаундера

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
4. **What's Built** — MVP на testnet, demo ссылка, фермер готов к подписанию 2 договоров Fidlot v5.9 ($100k), PDF договоры готовы (docs/60-40/)
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
