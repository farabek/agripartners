# Пакет доказательств Testnet

## Обзор

Этот документ объединяет доступные на текущий момент доказательства реализации, тестирования и использования NEAR Testnet в AgriPartners Alpha v1. Он предназначен для технических рецензентов, которым необходимо отличать воспроизводимые доказательства от заявлений о реализации и планов на будущее.

Текущий статус:

- стадия продукта: **Alpha v1**;
- блокчейн-среда: **NEAR Testnet**;
- статус production/Mainnet: **развертывание не выполнено и не заявляется**;
- дата фиксации доказательств: **2026-06-19**.

Ниже используются следующие метки доказательств:

- **Проверено локально:** воспроизведено командой при подготовке этого пакета.
- **Проверено по исходному коду:** непосредственно подтверждается текущим кодом репозитория или тестами.
- **Задокументировано:** указано в текущей документации проекта, но не было независимо воспроизведено по публичному идентификатору.
- **Запланировано:** не реализовано в текущем репозитории.

## Сводка репозитория

### Идентификация репозитория

- репозиторий: [github.com/farabek/agripartners](https://github.com/farabek/agripartners);
- remote: `https://github.com/farabek/agripartners.git`;
- обнаруженная локальная ветка: `main`;
- обнаруженная remote-ветка: `origin/main`;
- команда `git branch -a` не показала дополнительных локальных или remote-веток;
- зафиксированный базовый commit доказательств: `42b62e4ef872c51a1ebc15ded37cb40fcc8c66aa`.

Идентификатор commit фиксирует базовую версию, проверенную для этого пакета. Новые документы developer review могут оставаться незакоммиченными и не представлены этим hash.

### Структура проекта

| Путь | Ответственность |
| --- | --- |
| `frontend/` | Браузерное приложение Vite, интеграция Wallet Selector, investor/farmer/admin portals |
| `backend/` | Express API, миграции PostgreSQL, аутентификация, NEAR client, тесты |
| `contract/` | Rust-контракт NEAR, unit tests, sandbox integration tests |
| `docs/` | Документация продукта, Testnet, demo, launch, investor и developer review |
| `demo.ps1` | Интерактивная API-driven демонстрация lifecycle |
| `backend/scripts/pilot-deal-2-complete.js` | Вспомогательный скрипт lifecycle пилота |
| `render.yaml` | Модель развертывания backend на Render |
| `backend/railway.toml` | Модель развертывания backend на Railway |

### Приоритет источников достоверности

Если документы противоречат друг другу, рецензентам следует использовать следующий порядок:

1. текущий исходный код и миграции;
2. текущие manifests и lockfiles;
3. автоматизированные тесты;
4. этот пакет developer review;
5. более ранний корневой README и презентационная документация.

## Результаты тестов

### Набор тестов backend

Команда повторно выполнена 2026-06-19:

```text
cd backend
npm test -- --runInBand
```

Проверенный результат:

| Метрика | Результат |
| --- | ---: |
| Test suites | 20 passed / 20 total |
| Tests | 226 passed / 226 total |
| Snapshots | 0 |
| Указанное время выполнения | 9.285 секунды |

Области, представленные в test files, включают routes, authorization, проверку wallet signature, PostgreSQL services, конфигурацию NEAR client, построение contract calls, investor/farmer flows, reports, returns и поведение frontend source.

Большинство тестов NEAR service используют mocks. Они проверяют аргументы и поведение приложения, но не выполнение транзакций в live Testnet.

### Production build frontend

Команда повторно выполнена 2026-06-19:

```text
cd frontend
npm run build:wallet-poc
```

Проверенный результат:

- статус: passed;
- версия Vite: 8.0.16;
- преобразовано modules: 408;
- собраны main application и wallet-auth proof-of-concept entry points;
- указанное время build: 464 миллисекунды.

Warnings указывают, что транзитивные NEAR dependencies ссылались на Node-модули `crypto`, `http`, `https` и `util`, которые Vite externalized для browser compatibility. Успешный build не заменяет тестирование wallet flows в развернутом browser bundle.

### Тесты Rust-контракта

Проверенная инвентаризация исходного кода:

- 22 unit tests в `contract/src/lib.rs`;
- 4 sandbox integration tests в `contract/tests/integration.rs`.

Результат на текущей host-системе:

- `cargo test` не дошел до выполнения тестов на Windows;
- compilation был заблокирован из-за того, что `near-vm-runner 0.28.0` импортировал Unix-only API `rustix::fs`;
- integration test file явно отключен на Windows.

Это ограничение environment/toolchain, а не положительный результат contract tests. До внешнего review требуется доказательство выполнения в Linux CI.

## Проверенные функции

| Функция | Статус | Источник доказательств |
| --- | --- | --- |
| Wallet Authentication | Реализовано; backend протестирован; deployed flow не запускался повторно в этом пакете | `frontend/app.js`; `backend/src/services/walletAuthService.js`; `walletAuthService.test.js`; `frontend.auth-flow.test.js` |
| Investor Portal | Реализовано; поведение backend и frontend протестировано | `frontend/app.js`; `backend/src/routes/investor.js`; `investor.routes.test.js`; `frontend.investor-portal.test.js` |
| Farmer Portal | Реализовано; поведение backend и frontend протестировано | `frontend/app.js`; `backend/src/routes/farmer.js`; `farmer.routes.test.js`; `frontend.farmer-dashboard.test.js` |
| Marketplace | Реализовано во frontend; отдельный актуальный screenshot остается неполным | `frontend/app.js`; `docs/investor-portal.md`; `docs/demo-assets/01-demo-assets-inventory.md` |
| Admin Dashboard | Реализовано; routes и поведение frontend протестированы | `frontend/app.js`; `backend/src/routes/admin.js`; `admin.routes.test.js`; `frontend.admin-portal.test.js` |
| Funding Progress | Реализовано в product views; актуальный отдельный screenshot отсутствует | `frontend/app.js`; `docs/demo-assets/01-demo-assets-inventory.md`; investor/admin frontend tests |
| ROI and Returns | Реализовано как UI calculations и PostgreSQL return records; не полностью on-chain | `backend/src/routes/admin.js`; `backend/src/routes/investor.js`; `backend/src/services/dealService.js`; `frontend.investor-portal.test.js`; `docs/product-roadmap/05-roi-returns-final-audit.md` |
| Portfolio Dashboard | Реализовано; frontend tests проходят; screenshot inventory отмечает необходимость обновления | `frontend/app.js`; `frontend.investor-portal.test.js`; `docs/product-roadmap/07-investor-portfolio-dashboard-audit.md`; demo inventory |
| Farmer Reports | Реализовано off-chain в PostgreSQL; route и UI tests проходят | migration `007_farmer_reports.sql`; `farmer.routes.test.js`; `frontend.farmer-reports.test.js` |
| Cycle Tracking | Гибридная реализация: contract cycle state плюс PostgreSQL report/update state | `contract/src/lib.rs`; `backend/src/services/dealService.js`; admin, farmer и investor route tests |
| Event History | Реализовано как PostgreSQL events, которые могут ссылаться на NEAR transaction hashes; это не contract-emitted events | migration `001_initial.sql`; `backend/src/services/dealService.js`; deal и portal tests |

### Интерпретация

Таблица функций подтверждает реализацию и автоматизированно проверенное поведение приложения. Она не доказывает, что каждая функция доступна через текущее публичное развертывание или что каждое business event записывается on-chain.

## Доказательства NEAR Testnet

### Testnet accounts, найденные в текущих источниках

| Account | Источник | Значение доказательства |
| --- | --- | --- |
| `farab.testnet` | `render.yaml`, wallet-auth recipient и local admin allowlist, `demo.ps1` | Имя configured/demo account; само по себе не является записью транзакции |
| `farmer-ap.testnet` | значение по умолчанию в `backend/scripts/pilot-deal-2-complete.js` | Значение скрипта по умолчанию; текущий контроль account и активность независимо не проверены |
| `investor-ap.testnet` | значение по умолчанию в `backend/scripts/pilot-deal-2-complete.js` | Значение скрипта по умолчанию; текущий контроль account и активность независимо не проверены |
| `agripartners-demo.testnet` | `contract/demo.sh` | Значение demonstration script; не подтверждено как каноническое текущее развертывание |
| `farmer.testnet`, `investor.testnet`, `agripartners.testnet` | `contract/demo.sh` | Демонстрационные placeholders; не принимаются как live evidence |

Имена accounts, используемые только в automated test fixtures, не рассматриваются как доказательство публичного развертывания в Testnet.

### Доказательства контрактов

**Реализовано в исходном коде:**

- backend deployment создает `ap<timestamp>.<NEAR_ADMIN_ACCOUNT>`;
- deployment переводит средства на account, добавляет key, разворачивает WASM и инициализирует contract;
- contract реализует funding, cycle state, settlement accounting, balances и withdrawals;
- scripts выводят возвращенные contract addresses и transaction hashes при выполнении;
- PostgreSQL events могут хранить transaction hashes.

**Отсутствует в текущем пакете доказательств:**

- канонический deployed contract ID;
- deployment transaction hash;
- funding transaction hash;
- cycle start/report transaction hashes;
- withdrawal transaction hash;
- explorer links;
- зафиксированные результаты `get_params`, `get_status` и `get_balances`;
- WASM checksum, связанный с source commit.

Следовательно, публичные on-chain доказательства **неполны**. Этот пакет не создает и не выводит contract IDs из test fixtures.

### Продемонстрированные workflows

**Реализовано и представлено scripts или документацией:**

1. создать deal и развернуть его contract;
2. профинансировать deal;
3. запустить cycle;
4. передать cycle profit и loss;
5. просмотреть status и balances;
6. повторять cycles до завершения или termination;
7. вывести balances farmer, investor или platform;
8. сохранить transaction references в application event history.

**Задокументированная демонстрация продукта:**

- завершенный профиль Fidlot;
- активный профиль Hissar;
- investor, farmer и admin views;
- представление funding, reporting, ROI, returns и portfolio.

Без канонических transaction links это доказательства реализации и документации, а не независимо воспроизводимое live-chain подтверждение.

### Запланировано, но не реализовано как production evidence

- развертывание NEAR Mainnet;
- audited production contract;
- settlement в stable-value или fungible token;
- процесс contract upgrade и migration;
- децентрализованная аттестация real-world данных;
- pooled multi-investor contracts;
- production key management и incident recovery;
- полностью on-chain farmer reports и return ledger.

## Проверка API

### Основные группы endpoints

| Группа | Примеры | Аутентификация |
| --- | --- | --- |
| Health | `GET /health` | Public |
| Public deals | `GET /api/deals`, status, balances, events | Public |
| Legacy auth | `POST /api/auth/login`, `/register` | Login public; registration admin JWT |
| Wallet auth | `POST /api/wallet-auth/challenge`, `/verify` | Public challenge/verification flow |
| Profile | `/api/profile/me`, `/onboarding` | Wallet JWT |
| Investor | `/api/investor/deals`, profile, cycles, reports, returns, withdrawal | Wallet JWT и investor ownership checks |
| Farmer | `/api/farmer/deals`, funding confirmation, report submission | Wallet JWT и farmer ownership checks |
| Admin | deal deployment, lifecycle, funding, returns, withdrawals | Admin JWT или allowlisted wallet JWT |
| Legacy user | `GET /api/me/deals` | Legacy JWT |

### Проверенные workflows

Backend tests прошли для:

- username/password login и поведения role JWT;
- wallet challenge, signature, nonce и FullAccess key checks;
- wallet-scoped investor и farmer access;
- profile onboarding и updates;
- admin authorization;
- deal reads и ownership restrictions;
- report и return operations;
- конфигурации NEAR client и построения contract calls.

### Наблюдение публичного API

На 2026-06-19:

- `https://agripartners.onrender.com/health` вернул HTTP 404;
- `https://agripartners.onrender.com/api/deals` вернул HTTP 404;
- `https://agripartners.vercel.app` вернул HTTP 200.

Следовательно, backend не подтвержден как публично работающий по URL, который сейчас hardcoded во frontend и задокументирован в корневом README.

## Доказательства demo

| Набор доказательств | Расположение | Текущий статус |
| --- | --- | --- |
| Launch Kit | `docs/LAUNCH_KIT.md` | Основной навигационный документ |
| Demo Assets Inventory | `docs/demo-assets/01-demo-assets-inventory.md` | Фиксирует доступные и отсутствующие assets |
| Demo Flow | `docs/presentation-readiness/02-demo-flow.md` | Готово как руководство walkthrough |
| Demo Script | `docs/presentation-readiness/06-demo-script.md` | Готово как presentation guidance |
| Pitch Deck | `docs/pitch-deck/README.md` и `docs/investor-package/` | Доступно |
| Investor Brief | `docs/investor-pack/investor-brief.md` | Доступно |
| Screenshots | `docs/screenshots/` | Доступны investor, farmer, admin и demo images |
| Интерактивный lifecycle script | `demo.ps1` | Доступен; требует настроенный local backend и Testnet credentials |

Проверенные ограничения demo assets из inventory:

- отсутствует отдельный актуальный Marketplace screenshot;
- Portfolio Dashboard screenshot требует обновления;
- отсутствует отдельный Funding Progress screenshot;
- несколько filenames содержат `.png.png`;
- отсутствует публичная ссылка на recorded demo walkthrough;
- последнее состояние UI не полностью представлено набором screenshots.

## Известные ограничения

- Только Alpha v1.
- Только NEAR Testnet.
- Нет доказательств развертывания Mainnet.
- Нет аудита smart contract.
- Нет публичного канонического набора contract и transaction evidence.
- Rust contract tests не выполнялись на текущей Windows host-системе из-за несовместимости dependency/platform.
- Задокументированный публичный backend вернул HTTP 404 во время проверки.
- Production build frontend проходит, но выводит browser-externalization warnings из транзитивных NEAR dependencies.
- Farmer reports и manual returns хранятся off-chain.
- Application event history основана на PostgreSQL и не является NEP-297 contract event stream.
- Backend signer keys и централизованные admin actions остаются частью trust model.
- Wallet-auth nonces хранятся в памяти процесса.
- CORS не ограничен, rate limiting отсутствует.
- Contract deployment и PostgreSQL indexing не являются атомарными.
- Не задокументирован процесс contract upgrade, pause, dispute или восстановления после transfer failure.
- Нет подтвержденной legal, KYC/AML, custody, securities или jurisdictional production readiness.
- Claims и deployment links в корневом README требуют согласования с текущей реализацией.

## Руководство по воспроизведению

### 1. Clone

```bash
git clone https://github.com/farabek/agripartners.git
cd agripartners
git checkout main
```

Для точного сравнения доказательств зафиксируйте `git rev-parse HEAD` перед тестированием.

### 2. Установка dependencies backend

```bash
cd backend
npm install
```

### 3. Настройка backend

Текущий runtime требует PostgreSQL database и следующие фактически используемые variables:

```text
DATABASE_URL
API_KEY
NEAR_ADMIN_ACCOUNT
NEAR_ADMIN_PRIVATE_KEY
JWT_SECRET
```

Production seed также требует `ADMIN_PASSWORD`. В исходном коде упоминаются optional signer, RPC и deployment variables. Не используйте production credentials для review.

В текущей инвентаризации репозитория нет `.env.example`, хотя корневой README ссылается на него. Создайте local untracked `.env` вручную и никогда не коммитьте secrets.

### 4. Запуск тестов backend

```bash
cd backend
npm test -- --runInBand
```

Jest tests настраивают собственный test environment и при необходимости mock external dependencies.

### 5. Запуск backend

После настройки PostgreSQL и безопасных Testnet credentials:

```bash
cd backend
npm start
```

При startup применяются упорядоченные migrations. Вне production также создается default admin, если users table пуста.

Ожидаемый local health endpoint:

```text
http://localhost:3000/health
```

### 6. Установка и запуск frontend

```bash
cd frontend
npm install
npm run dev:wallet-poc
```

Согласно package script, Vite запускается на `127.0.0.1:5173`. Build содержит entry points `index.html` и `wallet-auth-poc.html`.

### 7. Build frontend

```bash
cd frontend
npm run build:wallet-poc
```

Проверьте build warnings и протестируйте wallet flows в созданном browser bundle.

### 8. Запуск contract tests в Linux

Текущая near-workspaces setup не поддерживается этой Windows verification environment. Используйте Linux или Linux CI runner:

```bash
cd contract
cargo test
```

Корневой README утверждает, что проект требует Rust 1.86, но файл `rust-toolchain` не найден. До признания результата воспроизводимым зафиксируйте и опубликуйте фактический успешный CI toolchain.

### 9. Build contract WASM в Linux

```bash
cd contract
rustup target add wasm32-unknown-unknown
cargo build --target wasm32-unknown-unknown --release
```

Зафиксируйте source commit и SHA-256 checksum полученного WASM. Проверьте, что artifact, используемый backend deployment, совпадает с ним.

### 10. Формирование Testnet evidence

Используя disposable Testnet accounts и без реальных средств:

1. разверните один contract;
2. зафиксируйте contract ID и deployment hash;
3. вызовите `get_params`, `get_status` и `get_balances`;
4. выполните funding, один cycle и authorized withdrawals;
5. зафиксируйте все explorer links и ожидаемые state transitions;
6. экспортируйте redacted API event record;
7. добавьте доказательства вместе с source revision и WASM hash.

Этот последний шаг является обязательным пробелом; он не выполнялся при подготовке этого документационного пакета.

## Оценка технической готовности

| Область | Оценка | Доказательства |
| --- | --- | --- |
| Architecture | Умеренная готовность Alpha | Понятная гибридная component model; boundaries доверия и reconciliation требуют review |
| Backend | Хорошая локальная готовность Alpha | 20/20 suites и 226/226 tests passed; public deployment недоступен по задокументированному URL |
| Frontend | Хорошая build readiness | Production build passed; live UI ответил; API и wallet flows требуют deployed end-to-end verification |
| Blockchain integration | Реализовано, доказательства неполны | Contract и NEAR service code существуют; canonical Testnet IDs и transactions отсутствуют |
| Documentation | Хорошая готовность к review | Launch, demo, product и developer-review материалы существуют; некоторые ранние claims расходятся с кодом |
| Testing | Сильный backend, частичный contract | Backend suite проходит; frontend собирается; Rust tests требуют результата Linux CI |
| Overall | Умеренная готовность Alpha; низкая готовность Mainnet | Подходит для technical review, но не для production financial use |

## Чек-лист рецензента

### Repository и build

- [ ] Подтвердить branch и source commit.
- [ ] Установить backend и frontend dependencies из lockfiles.
- [ ] Запустить все 226 backend tests.
- [ ] Собрать оба frontend entry points.
- [ ] Запустить Rust unit и sandbox tests в Linux CI.
- [ ] Пересобрать WASM и сравнить его checksum с backend artifact.

### Architecture

- [ ] Подтвердить, какие данные являются authoritative on-chain и в PostgreSQL.
- [ ] Проверить неатомарные contract deployment и database indexing.
- [ ] Проверить требования contract/database reconciliation.
- [ ] Проверить public и wallet-scoped deal endpoints.
- [ ] Проверить deployment configuration и выбрать одну каноническую backend platform.

### Authentication и security

- [ ] Проверить построение NEP-413 payload и требование FullAccess key.
- [ ] Проверить process-local nonce storage и хранение JWT в browser.
- [ ] Проверить поведение admin allowlist.
- [ ] Проверить CORS, rate limiting, validation и logging.
- [ ] Проверить custody backend private keys и альтернативы direct wallet.

### Contract

- [ ] Проверить каждую role и state transition.
- [ ] Протестировать accounting invariants и rounding.
- [ ] Проверить investor withdrawal signer design.
- [ ] Проверить восстановление после failed transfer.
- [ ] Проверить solvency для profit, loss, escrow и capital return cases.
- [ ] Определить необходимость NEP-297 events.
- [ ] Определить audit, upgrade, pause и dispute strategy.

### Testnet evidence

- [ ] Проверить canonical contract ID в explorer.
- [ ] Проверить deployment и lifecycle transaction hashes.
- [ ] Сравнить `get_params` с PostgreSQL deal data.
- [ ] Сравнить `get_status` и `get_balances` с UI/API output.
- [ ] Проверить recipients withdrawals farmer, investor и platform.
- [ ] Подтвердить работу задокументированного backend health endpoint.

### Границы продукта

- [ ] Подтвердить, что farmer reports и return records описаны как off-chain.
- [ ] Подтвердить, что demo metrics не представлены как production adoption.
- [ ] Подтвердить наличие ограничений Testnet, unaudited и Alpha во внешних материалах.
- [ ] Определить минимальный reusable вклад в экосистему NEAR.

## Оценка полноты доказательств

Полнота доказательств является **частичной**.

Сильные доказательства:

- структура и реализация репозитория;
- результат автоматизированных тестов backend;
- production build frontend;
- исходный код routes, database, wallet и contract;
- demo и presentation assets.

Неполные доказательства:

- запись успешных Linux contract tests и WASM build;
- канонический registry Testnet contracts;
- transaction history со ссылками на explorer;
- provenance от исходного кода к WASM;
- работающий публичный backend;
- проверка deployed wallet flows;
- audit и security review.

## Оставшиеся пробелы перед техническим review NEAR DevHub

1. восстановить или заменить public backend и проверить `/health` плюс один read endpoint;
2. запустить contract unit и sandbox tests в Linux CI;
3. опубликовать один canonical disposable Testnet lifecycle со ссылками на explorer;
4. опубликовать source commit и WASM checksum, использованные для этого deployment;
5. проверить deployed wallet-auth, investor, farmer и admin paths;
6. согласовать claims и URLs корневого README с текущим поведением;
7. подготовить краткую threat model для signers, withdrawals, database trust и real-world reports;
8. удалить secrets и personal data из каждого передаваемого artifact.

После этих шагов пакет будет значительно лучше подготовлен для review NEAR DevHub.
